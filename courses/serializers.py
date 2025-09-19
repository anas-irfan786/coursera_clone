# courses/serializers.py
from rest_framework import serializers
from django.db.models import Avg, Count, Sum, Q
from .models import Course, Section, Lecture, LectureResource, CourseAnnouncement
from enrollments.models import Enrollment, LectureProgress
from assessments.models import Quiz, Assignment, Question, QuestionOption
from reviews.models import CourseReview
from payments.models import InstructorEarning
from accounts.serializers import UserSerializer

class LectureResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureResource
        fields = ['id', 'uuid', 'title', 'file', 'is_downloadable']

class LectureSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    resources = LectureResourceSerializer(many=True, read_only=True)
    completion_rate = serializers.SerializerMethodField()
    quiz_settings = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    assignment_settings = serializers.SerializerMethodField()
    subtitle_file = serializers.SerializerMethodField()
    existing_video_name = serializers.SerializerMethodField()
    existing_subtitle_name = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = ['id', 'title', 'description', 'content_type', 'order',
                 'video_url', 'video_file', 'video_duration', 'article_content',
                 'is_preview', 'is_downloadable', 'resources', 'completion_rate',
                 'quiz_settings', 'questions', 'assignment_settings', 'subtitle_file',
                 'existing_video_name', 'existing_subtitle_name']

    def get_completion_rate(self, obj):
        total = LectureProgress.objects.filter(lecture=obj).count()
        completed = LectureProgress.objects.filter(lecture=obj, is_completed=True).count()
        return (completed / total * 100) if total > 0 else 0

    def get_quiz_settings(self, obj):
        """Return quiz settings if this is a quiz lecture"""
        if obj.content_type != 'quiz':
            return None

        try:
            quiz = Quiz.objects.get(lecture=obj)
            return {
                'passing_score': quiz.passing_score,
                'time_limit': quiz.time_limit,
                'max_attempts': quiz.max_attempts,
                'weight': float(quiz.weight),  # Ensure it's a float for frontend
                'randomize_questions': quiz.randomize_questions,
                'show_answers': quiz.show_answers
            }
        except Quiz.DoesNotExist:
            return {
                'passing_score': 60,
                'time_limit': None,
                'max_attempts': 3,
                'weight': 0.0,
                'randomize_questions': False,
                'show_answers': True
            }

    def get_questions(self, obj):
        """Return quiz questions if this is a quiz lecture"""
        if obj.content_type != 'quiz':
            return []

        try:
            quiz = Quiz.objects.get(lecture=obj)
            questions = []

            for question in quiz.questions.all():
                question_data = {
                    'question_text': question.question_text,
                    'question_type': question.question_type,
                    'points': question.points,
                    'explanation': question.explanation,
                    'options': []
                }

                for option in question.options.all():
                    question_data['options'].append({
                        'option_text': option.option_text,
                        'is_correct': option.is_correct,
                        'order': option.order
                    })

                questions.append(question_data)

            return questions
        except Quiz.DoesNotExist:
            return []

    def get_assignment_settings(self, obj):
        """Return assignment settings if this is an assignment lecture"""
        if obj.content_type != 'assignment':
            return None

        try:
            assignment = Assignment.objects.get(lecture=obj)
            # Format due_date for datetime-local input (remove timezone info)
            due_date_formatted = None
            if assignment.due_date:
                from django.utils import timezone
                # Convert to local timezone and format for datetime-local input
                local_dt = timezone.localtime(assignment.due_date)
                due_date_formatted = local_dt.strftime('%Y-%m-%dT%H:%M')

            return {
                'max_points': assignment.max_points,
                'due_date': due_date_formatted,
                'passing_score': assignment.passing_score,
                'weight': float(assignment.weight),
                'instructions': assignment.instructions,
                'attachment': assignment.attachment.url if assignment.attachment else None,
                'existing_attachment': assignment.attachment.url if assignment.attachment else None,
                'allow_late_submission': assignment.allow_late_submission
            }
        except Assignment.DoesNotExist:
            return {
                'max_points': 100,
                'due_date': None,
                'passing_score': 60,
                'weight': 0.0,
                'instructions': '',
                'attachment': None,
                'existing_attachment': None,
                'allow_late_submission': True
            }

    def get_subtitle_file(self, obj):
        """Return subtitle file URL if it exists"""
        if obj.content_type != 'video':
            return None

        try:
            from content.models import VideoContent
            video_content = VideoContent.objects.get(lecture=obj)
            if hasattr(video_content, 'subtitles') and video_content.subtitles.exists():
                subtitle = video_content.subtitles.first()
                return subtitle.file.url if subtitle.file else None
        except:
            pass
        return None

    def get_existing_video_name(self, obj):
        """Return the name of existing video file"""
        if obj.content_type != 'video':
            return None

        # Check if video file exists in Lecture model
        if obj.video_file:
            import os
            return os.path.basename(obj.video_file.name)

        # Check if video file exists in VideoContent model
        try:
            from content.models import VideoContent
            video_content = VideoContent.objects.get(lecture=obj)
            if video_content.video_file:
                import os
                return os.path.basename(video_content.video_file.name)
        except:
            pass

        return None

    def get_existing_subtitle_name(self, obj):
        """Return the name of existing subtitle file"""
        if obj.content_type != 'video':
            return None

        try:
            from content.models import VideoContent
            video_content = VideoContent.objects.get(lecture=obj)
            if hasattr(video_content, 'subtitles') and video_content.subtitles.exists():
                subtitle = video_content.subtitles.first()
                if subtitle.file:
                    import os
                    return os.path.basename(subtitle.file.name)
        except:
            pass
        return None

class SectionSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    lectures = LectureSerializer(many=True, read_only=True)
    total_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'description', 'order', 'is_preview', 
                 'lectures', 'total_duration']
    
    def get_total_duration(self, obj):
        return sum([lecture.video_duration for lecture in obj.lectures.all()])

class CourseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for course listing"""
    id = serializers.UUIDField(source='uuid', read_only=True)
    total_revenue = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'thumbnail', 'status', 'course_type', 'created_at',
                 'total_enrolled', 'average_rating', 'total_revenue', 'is_featured']
    
    def get_total_revenue(self, obj):
        return InstructorEarning.objects.filter(course=obj).aggregate(
            total=Sum('final_amount'))['total'] or 0

class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for course management"""
    id = serializers.UUIDField(source='uuid', read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['uuid', 'total_enrolled', 'total_reviews', 
                           'average_rating', 'published_date']

class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating courses"""
    class Meta:
        model = Course
        exclude = ['uuid', 'instructor', 'total_enrolled', 'total_reviews', 
                  'average_rating', 'published_date']
    
    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)