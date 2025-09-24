# assessments/quiz_services.py
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Quiz, QuizAttempt, Question, QuestionResponse
from enrollments.models import Enrollment

class QuizService:
    """Service to handle quiz attempts with proper limits and validation"""

    @staticmethod
    def can_attempt_quiz(student, quiz, enrollment):
        """
        Check if student can attempt a quiz based on:
        1. Max attempts limit
        2. Previous attempts
        3. Enrollment status
        """
        # Check if enrollment is active
        if enrollment.status != 'active':
            return False, "Enrollment is not active"

        # Count existing attempts
        attempts_count = QuizAttempt.objects.filter(
            student=student,
            quiz=quiz
        ).count()

        # Check max attempts limit
        if attempts_count >= quiz.max_attempts:
            return False, f"Maximum {quiz.max_attempts} attempts reached"

        # Check if quiz is active
        if not quiz.is_active:
            return False, "Quiz is not available"

        return True, "Can attempt quiz"

    @staticmethod
    def start_quiz_attempt(student, quiz, enrollment):
        """
        Start a new quiz attempt
        """
        can_attempt, message = QuizService.can_attempt_quiz(student, quiz, enrollment)

        if not can_attempt:
            raise ValidationError(message)

        # Get next attempt number
        last_attempt = QuizAttempt.objects.filter(
            student=student,
            quiz=quiz
        ).order_by('-attempt_number').first()

        attempt_number = (last_attempt.attempt_number + 1) if last_attempt else 1

        # Create new attempt
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            enrollment=enrollment,
            attempt_number=attempt_number,
            start_time=timezone.now()
        )

        return attempt

    @staticmethod
    def submit_quiz_attempt(attempt, responses_data):
        """
        Submit quiz attempt with answers and calculate score
        """
        if attempt.end_time:
            raise ValidationError("Quiz attempt already submitted")

        # Check time limit
        if attempt.quiz.time_limit:
            elapsed_minutes = (timezone.now() - attempt.start_time).total_seconds() / 60
            if elapsed_minutes > attempt.quiz.time_limit:
                raise ValidationError("Time limit exceeded")

        # Save responses and calculate score
        total_points = 0
        earned_points = 0

        for response_data in responses_data:
            question_id = response_data['question_id']
            question = Question.objects.get(id=question_id, quiz=attempt.quiz)

            # Create response
            response = QuestionResponse.objects.create(
                attempt=attempt,
                question=question,
                text_answer=response_data.get('text_answer', '')
            )

            # Add selected options for multiple choice
            if 'selected_options' in response_data:
                response.selected_options.set(response_data['selected_options'])

            # Calculate score based on question type
            is_correct, points = QuizService._grade_question_response(question, response)
            response.is_correct = is_correct
            response.points_earned = points
            response.save()

            total_points += question.points
            earned_points += points

        # Calculate final score
        score_percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        passed = score_percentage >= attempt.quiz.passing_score

        # Update attempt
        attempt.end_time = timezone.now()
        attempt.score = score_percentage
        attempt.passed = passed
        attempt.save()

        # Update progress tracking
        QuizService._update_quiz_progress(attempt)

        return attempt

    @staticmethod
    def _grade_question_response(question, response):
        """Grade individual question response"""
        if question.question_type == 'multiple_choice':
            selected_options = list(response.selected_options.all())
            correct_options = list(question.options.filter(is_correct=True))

            # Single correct answer
            if len(selected_options) == 1 and len(correct_options) == 1:
                if selected_options[0] in correct_options:
                    return True, question.points
                else:
                    return False, 0

        elif question.question_type == 'multiple_select':
            selected_options = set(response.selected_options.all())
            correct_options = set(question.options.filter(is_correct=True))

            # All correct options selected, no incorrect ones
            if selected_options == correct_options:
                return True, question.points
            else:
                return False, 0

        elif question.question_type == 'true_false':
            selected_option = response.selected_options.first()
            if selected_option and selected_option.is_correct:
                return True, question.points
            else:
                return False, 0

        elif question.question_type == 'fill_blank':
            user_answer = response.text_answer.strip().lower()
            correct_answers = [ans.lower() for ans in question.correct_answers]

            if user_answer in correct_answers:
                return True, question.points
            else:
                return False, 0

        elif question.question_type == 'essay':
            # Essay questions need manual grading
            return None, 0

        return False, 0

    @staticmethod
    def _update_quiz_progress(attempt):
        """Update lecture progress when quiz is completed"""
        from enrollments.progress_models import EnhancedLectureProgress

        if attempt.quiz.lecture:
            progress, created = EnhancedLectureProgress.objects.get_or_create(
                enrollment=attempt.enrollment,
                lecture=attempt.quiz.lecture,
                defaults={
                    'quiz_attempts': 1,
                    'quiz_best_score': attempt.score
                }
            )

            if not created:
                progress.quiz_attempts += 1
                if attempt.score > (progress.quiz_best_score or 0):
                    progress.quiz_best_score = attempt.score

            # Mark lecture complete if quiz passed
            if attempt.passed and not progress.is_completed:
                progress.mark_completed('quiz_passed')
            else:
                progress.save()

    @staticmethod
    def get_quiz_statistics(quiz):
        """Get quiz statistics for instructors"""
        attempts = QuizAttempt.objects.filter(quiz=quiz, end_time__isnull=False)

        if not attempts.exists():
            return {
                'total_attempts': 0,
                'unique_students': 0,
                'average_score': 0,
                'pass_rate': 0,
                'completion_rate': 0
            }

        total_attempts = attempts.count()
        unique_students = attempts.values('student').distinct().count()
        average_score = attempts.aggregate(avg_score=models.Avg('score'))['avg_score'] or 0
        passed_attempts = attempts.filter(passed=True).count()
        pass_rate = (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0

        # Calculate completion rate (students who attempted vs enrolled)
        enrolled_students = Enrollment.objects.filter(
            course=quiz.course,
            status='active'
        ).count()
        completion_rate = (unique_students / enrolled_students * 100) if enrolled_students > 0 else 0

        return {
            'total_attempts': total_attempts,
            'unique_students': unique_students,
            'average_score': round(average_score, 2),
            'pass_rate': round(pass_rate, 2),
            'completion_rate': round(completion_rate, 2)
        }