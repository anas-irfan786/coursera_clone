# assessments/assignment_services.py
import os
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from .models import Assignment, AssignmentSubmission
from enrollments.models import Enrollment

class AssignmentService:
    """Service to handle assignment submissions with deadlines and file validation"""

    # Allowed file extensions (can be configured)
    ALLOWED_EXTENSIONS = [
        '.pdf', '.doc', '.docx', '.txt', '.rtf',  # Documents
        '.jpg', '.jpeg', '.png', '.gif', '.bmp',  # Images
        '.zip', '.rar', '.7z',  # Archives
        '.py', '.js', '.html', '.css', '.java', '.cpp', '.c',  # Code files
        '.xlsx', '.xls', '.csv',  # Spreadsheets
        '.ppt', '.pptx',  # Presentations
        '.mp4', '.avi', '.mov', '.wmv',  # Videos (for media assignments)
        '.mp3', '.wav', '.ogg',  # Audio
    ]

    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB in bytes

    @staticmethod
    def can_submit_assignment(student, assignment, enrollment):
        """
        Check if student can submit assignment based on:
        1. Deadline (if exists)
        2. Late submission policy
        3. Previous submissions
        4. Enrollment status
        """
        # Check if enrollment is active
        if enrollment.status != 'active':
            return False, "Enrollment is not active"

        # Check if assignment is active
        if not assignment.is_active:
            return False, "Assignment is not available"

        # Check if student already has a submission
        existing_submission = AssignmentSubmission.objects.filter(
            assignment=assignment,
            student=student
        ).first()

        current_time = timezone.now()
        is_late = False

        # Check deadline
        if assignment.due_date:
            is_late = current_time > assignment.due_date

            if is_late and not assignment.allow_late_submission:
                return False, "Assignment deadline has passed and late submissions are not allowed"

        # If resubmitting, check if late submissions are allowed
        if existing_submission and is_late and not assignment.allow_late_submission:
            return False, "Cannot resubmit after deadline when late submissions are not allowed"

        return True, "Can submit assignment"

    @staticmethod
    def validate_submission_file(file):
        """
        Validate uploaded file based on:
        1. File size (max 50MB)
        2. File extension
        3. File type
        """
        if not file:
            return True, "No file provided"

        # Check file size
        if file.size > AssignmentService.MAX_FILE_SIZE:
            return False, f"File size exceeds {AssignmentService.MAX_FILE_SIZE // (1024*1024)}MB limit"

        # Check file extension
        file_extension = os.path.splitext(file.name)[1].lower()
        if file_extension not in AssignmentService.ALLOWED_EXTENSIONS:
            return False, f"File type '{file_extension}' not allowed. Allowed types: {', '.join(AssignmentService.ALLOWED_EXTENSIONS)}"

        return True, "File is valid"

    @staticmethod
    def submit_assignment(student, assignment, enrollment, submission_text='', submission_file=None):
        """
        Submit or resubmit an assignment
        """
        can_submit, message = AssignmentService.can_submit_assignment(student, assignment, enrollment)

        if not can_submit:
            raise ValidationError(message)

        # Validate file if provided
        if submission_file:
            file_valid, file_message = AssignmentService.validate_submission_file(submission_file)
            if not file_valid:
                raise ValidationError(file_message)

        # Check if this is a resubmission
        existing_submission = AssignmentSubmission.objects.filter(
            assignment=assignment,
            student=student
        ).first()

        current_time = timezone.now()
        is_late = False

        if assignment.due_date:
            is_late = current_time > assignment.due_date

        if existing_submission:
            # Update existing submission (resubmission)
            if existing_submission.graded_at:
                # Create new submission if previous one was already graded
                submission = AssignmentSubmission.objects.create(
                    assignment=assignment,
                    student=student,
                    enrollment=enrollment,
                    submission_text=submission_text,
                    submission_file=submission_file,
                    is_late=is_late
                )
            else:
                # Update ungraded submission
                existing_submission.submission_text = submission_text
                if submission_file:
                    # Delete old file if exists
                    if existing_submission.submission_file:
                        existing_submission.submission_file.delete()
                    existing_submission.submission_file = submission_file
                existing_submission.is_late = is_late
                existing_submission.submitted_at = current_time
                existing_submission.save()
                submission = existing_submission
        else:
            # Create new submission
            submission = AssignmentSubmission.objects.create(
                assignment=assignment,
                student=student,
                enrollment=enrollment,
                submission_text=submission_text,
                submission_file=submission_file,
                is_late=is_late
            )

        # Update progress tracking
        AssignmentService._update_assignment_progress(submission)

        return submission

    @staticmethod
    def unsubmit_assignment(student, assignment):
        """
        Allow student to unsubmit assignment (if allowed and not graded)
        """
        submission = AssignmentSubmission.objects.filter(
            assignment=assignment,
            student=student
        ).first()

        if not submission:
            raise ValidationError("No submission found to unsubmit")

        if submission.graded_at:
            raise ValidationError("Cannot unsubmit graded assignment")

        # Check if late submission is allowed (for resubmission)
        current_time = timezone.now()
        if assignment.due_date and current_time > assignment.due_date:
            if not assignment.allow_late_submission:
                raise ValidationError("Cannot unsubmit after deadline when late submissions are not allowed")

        # Delete the submission
        if submission.submission_file:
            submission.submission_file.delete()
        submission.delete()

        return True

    @staticmethod
    def grade_assignment(submission, grade, feedback, graded_by):
        """
        Grade an assignment submission
        """
        if submission.graded_at:
            raise ValidationError("Assignment already graded")

        # Validate grade
        if grade < 0 or grade > submission.assignment.max_points:
            raise ValidationError(f"Grade must be between 0 and {submission.assignment.max_points}")

        # Apply late penalty if applicable
        final_grade = grade
        if submission.is_late and submission.assignment.late_penalty_percent > 0:
            penalty = (submission.assignment.late_penalty_percent / 100) * grade
            final_grade = max(0, grade - penalty)

        # Update submission
        submission.grade = final_grade
        submission.feedback = feedback
        submission.graded_by = graded_by
        submission.graded_at = timezone.now()
        submission.save()

        # Update progress tracking
        AssignmentService._update_assignment_progress(submission)

        return submission

    @staticmethod
    def _update_assignment_progress(submission):
        """Update lecture progress when assignment is submitted/graded"""
        from enrollments.progress_models import EnhancedLectureProgress

        if submission.assignment.lecture:
            progress, created = EnhancedLectureProgress.objects.get_or_create(
                enrollment=submission.enrollment,
                lecture=submission.assignment.lecture,
                defaults={
                    'assignment_submitted': True,
                    'assignment_grade': submission.grade
                }
            )

            if not created:
                progress.assignment_submitted = True
                if submission.grade is not None:
                    progress.assignment_grade = submission.grade

            # Mark lecture complete if assignment is graded and passed
            if (submission.grade is not None and
                submission.grade >= (submission.assignment.passing_score / 100 * submission.assignment.max_points) and
                not progress.is_completed):
                progress.mark_completed('assignment_graded')
            else:
                progress.save()

    @staticmethod
    def get_assignment_statistics(assignment):
        """Get assignment statistics for instructors"""
        submissions = AssignmentSubmission.objects.filter(assignment=assignment)

        if not submissions.exists():
            return {
                'total_submissions': 0,
                'unique_students': 0,
                'average_grade': 0,
                'late_submissions': 0,
                'graded_submissions': 0,
                'pending_grading': 0,
                'submission_rate': 0
            }

        total_submissions = submissions.count()
        unique_students = submissions.values('student').distinct().count()
        graded_submissions = submissions.filter(grade__isnull=False)
        average_grade = graded_submissions.aggregate(avg_grade=models.Avg('grade'))['avg_grade'] or 0
        late_submissions = submissions.filter(is_late=True).count()
        pending_grading = submissions.filter(grade__isnull=True).count()

        # Calculate submission rate
        enrolled_students = Enrollment.objects.filter(
            course=assignment.course,
            status='active'
        ).count()
        submission_rate = (unique_students / enrolled_students * 100) if enrolled_students > 0 else 0

        return {
            'total_submissions': total_submissions,
            'unique_students': unique_students,
            'average_grade': round(average_grade, 2),
            'late_submissions': late_submissions,
            'graded_submissions': graded_submissions.count(),
            'pending_grading': pending_grading,
            'submission_rate': round(submission_rate, 2)
        }