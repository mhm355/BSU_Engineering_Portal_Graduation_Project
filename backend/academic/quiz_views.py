"""
Quiz API Views for doctors to create quizzes and students to take them
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .models import (
    Quiz, QuizQuestion, QuizChoice, StudentQuizAttempt, StudentQuizAnswer,
    CourseOffering, Student
)
from users.permissions import IsDoctorRole, IsStudentRole


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for Quiz CRUD operations - Doctor only for CUD, Students can list"""
    queryset = Quiz.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDoctorRole()]
        return []

    def get_queryset(self):
        user = self.request.user
        queryset = Quiz.objects.select_related('course_offering', 'course_offering__subject')
        
        # Filter by course_offering if provided
        course_offering_id = self.request.query_params.get('course_offering')
        if course_offering_id:
            queryset = queryset.filter(course_offering_id=course_offering_id)
        
        # If doctor, show only their quizzes
        if hasattr(user, 'role') and user.role == 'DOCTOR':
            queryset = queryset.filter(course_offering__doctor=user)
        
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = []
        for quiz in queryset:
            data.append({
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'quiz_type': quiz.quiz_type,
                'total_points': float(quiz.total_points),
                'is_active': quiz.is_active,
                'time_limit_minutes': quiz.time_limit_minutes,
                'question_count': quiz.questions.count(),
                'course_offering_id': quiz.course_offering_id,
                'subject_name': quiz.course_offering.subject.name,
                'created_at': quiz.created_at,
            })
        return Response(data)

    def retrieve(self, request, pk=None):
        try:
            quiz = Quiz.objects.select_related('course_offering', 'course_offering__subject').get(pk=pk)
        except Quiz.DoesNotExist:
            return Response({'error': 'الكويز غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get questions with choices
        questions = []
        for q in quiz.questions.all():
            question_data = {
                'id': q.id,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'points': float(q.points),
                'order': q.order,
                'choices': []
            }
            if q.question_type == 'MCQ':
                for choice in q.choices.all():
                    choice_data = {
                        'id': choice.id,
                        'choice_text': choice.choice_text,
                        'order': choice.order,
                    }
                    # Only show is_correct to doctor
                    if hasattr(request.user, 'role') and request.user.role == 'DOCTOR':
                        choice_data['is_correct'] = choice.is_correct
                    question_data['choices'].append(choice_data)
            questions.append(question_data)
        
        return Response({
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'quiz_type': quiz.quiz_type,
            'total_points': float(quiz.total_points),
            'is_active': quiz.is_active,
            'time_limit_minutes': quiz.time_limit_minutes,
            'image': quiz.image.url if quiz.image else None,
            'course_offering_id': quiz.course_offering_id,
            'subject_name': quiz.course_offering.subject.name,
            'questions': questions,
        })

    def create(self, request):
        """Create a new quiz with questions and choices"""
        data = request.data
        course_offering_id = data.get('course_offering_id')
        
        # Validate course offering belongs to this doctor
        try:
            course_offering = CourseOffering.objects.get(
                id=course_offering_id,
                doctor=request.user
            )
        except CourseOffering.DoesNotExist:
            return Response(
                {'error': 'المادة غير موجودة أو ليست مخصصة لك'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create quiz
        quiz = Quiz.objects.create(
            course_offering=course_offering,
            title=data.get('title', 'كويز جديد'),
            description=data.get('description', ''),
            quiz_type=data.get('quiz_type', 'MCQ'),
            total_points=data.get('total_points', 10),
            time_limit_minutes=data.get('time_limit_minutes'),
            is_active=data.get('is_active', True),
        )
        
        # Handle image for IMAGE type
        if 'image' in request.FILES:
            quiz.image = request.FILES['image']
            quiz.save()
        
        # Create questions
        questions_data = data.get('questions', [])
        for i, q_data in enumerate(questions_data):
            question = QuizQuestion.objects.create(
                quiz=quiz,
                question_text=q_data.get('question_text', ''),
                question_type=q_data.get('question_type', 'MCQ'),
                points=q_data.get('points', 1),
                order=i + 1
            )
            
            # Create choices for MCQ
            if question.question_type == 'MCQ':
                choices_data = q_data.get('choices', [])
                for j, c_data in enumerate(choices_data):
                    QuizChoice.objects.create(
                        question=question,
                        choice_text=c_data.get('choice_text', ''),
                        is_correct=c_data.get('is_correct', False),
                        order=j + 1
                    )
        
        return Response({'id': quiz.id, 'message': 'تم إنشاء الكويز بنجاح'}, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        try:
            quiz = Quiz.objects.get(pk=pk, course_offering__doctor=request.user)
            quiz.delete()
            return Response({'message': 'تم حذف الكويز'})
        except Quiz.DoesNotExist:
            return Response({'error': 'الكويز غير موجود'}, status=status.HTTP_404_NOT_FOUND)


class StudentQuizListView(APIView):
    """List quizzes available for the student"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'الطالب غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get active quizzes for student's level
        quizzes = Quiz.objects.filter(
            is_active=True,
            course_offering__level=student.level,
            course_offering__academic_year=student.academic_year
        ).select_related('course_offering', 'course_offering__subject')
        
        data = []
        for quiz in quizzes:
            # Check if student has attempted
            attempt = StudentQuizAttempt.objects.filter(student=student, quiz=quiz).first()
            
            data.append({
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'quiz_type': quiz.quiz_type,
                'total_points': float(quiz.total_points),
                'time_limit_minutes': quiz.time_limit_minutes,
                'subject_name': quiz.course_offering.subject.name,
                'question_count': quiz.questions.count(),
                'attempted': attempt is not None,
                'score': float(attempt.score) if attempt and attempt.score else None,
                'submitted_at': attempt.submitted_at if attempt else None,
            })
        
        return Response(data)


class StudentQuizAttemptView(APIView):
    """Start or submit a quiz attempt"""
    permission_classes = [IsStudentRole]

    def get(self, request, quiz_id):
        """Get quiz for taking (start attempt if not started)"""
        try:
            student = Student.objects.get(user=request.user)
            quiz = Quiz.objects.get(id=quiz_id, is_active=True)
        except (Student.DoesNotExist, Quiz.DoesNotExist):
            return Response({'error': 'غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check or create attempt
        attempt, created = StudentQuizAttempt.objects.get_or_create(
            student=student,
            quiz=quiz
        )
        
        if attempt.submitted_at:
            return Response({'error': 'لقد قمت بحل هذا الكويز مسبقاً'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Build quiz data for student
        questions = []
        for q in quiz.questions.all():
            question_data = {
                'id': q.id,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'points': float(q.points),
                'choices': []
            }
            if q.question_type == 'MCQ':
                for choice in q.choices.all():
                    question_data['choices'].append({
                        'id': choice.id,
                        'choice_text': choice.choice_text,
                    })
            questions.append(question_data)
        
        return Response({
            'attempt_id': attempt.id,
            'quiz_id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'total_points': float(quiz.total_points),
            'time_limit_minutes': quiz.time_limit_minutes,
            'image': quiz.image.url if quiz.image else None,
            'questions': questions,
            'started_at': attempt.started_at,
        })

    def post(self, request, quiz_id):
        """Submit quiz answers"""
        try:
            student = Student.objects.get(user=request.user)
            quiz = Quiz.objects.get(id=quiz_id)
            attempt = StudentQuizAttempt.objects.get(student=student, quiz=quiz)
        except (Student.DoesNotExist, Quiz.DoesNotExist, StudentQuizAttempt.DoesNotExist):
            return Response({'error': 'غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        
        if attempt.submitted_at:
            return Response({'error': 'لقد قمت بحل هذا الكويز مسبقاً'}, status=status.HTTP_400_BAD_REQUEST)
        
        answers = request.data.get('answers', [])
        total_score = 0
        
        for answer_data in answers:
            question_id = answer_data.get('question_id')
            try:
                question = QuizQuestion.objects.get(id=question_id, quiz=quiz)
            except QuizQuestion.DoesNotExist:
                continue
            
            answer, _ = StudentQuizAnswer.objects.get_or_create(
                attempt=attempt,
                question=question
            )
            
            if question.question_type == 'MCQ':
                choice_id = answer_data.get('choice_id')
                if choice_id:
                    try:
                        choice = QuizChoice.objects.get(id=choice_id, question=question)
                        answer.selected_choice = choice
                        if choice.is_correct:
                            answer.points_earned = question.points
                            total_score += float(question.points)
                        else:
                            answer.points_earned = 0
                    except QuizChoice.DoesNotExist:
                        pass
            else:
                # Essay - save answer, doctor grades later
                answer.essay_answer = answer_data.get('essay_answer', '')
            
            answer.save()
        
        # Mark attempt as submitted
        attempt.submitted_at = timezone.now()
        attempt.score = total_score
        attempt.is_graded = quiz.quiz_type == 'MCQ'  # Auto-graded for MCQ only
        attempt.save()
        
        return Response({
            'message': 'تم تسليم الكويز بنجاح',
            'score': total_score if attempt.is_graded else None,
            'total_points': float(quiz.total_points),
        })


class QuizResultsView(APIView):
    """View quiz results - Doctor views all attempts, Student views their own"""
    
    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'الكويز غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        
        if hasattr(user, 'role') and user.role == 'DOCTOR':
            # Doctor sees all attempts
            attempts = StudentQuizAttempt.objects.filter(quiz=quiz).select_related('student')
            data = []
            for attempt in attempts:
                data.append({
                    'student_id': attempt.student.id,
                    'student_name': attempt.student.full_name,
                    'score': float(attempt.score) if attempt.score else None,
                    'total_points': float(quiz.total_points),
                    'submitted_at': attempt.submitted_at,
                    'is_graded': attempt.is_graded,
                })
            return Response(data)
        
        elif hasattr(user, 'role') and user.role == 'STUDENT':
            # Student sees their own result
            try:
                student = Student.objects.get(user=user)
                attempt = StudentQuizAttempt.objects.get(student=student, quiz=quiz)
            except (Student.DoesNotExist, StudentQuizAttempt.DoesNotExist):
                return Response({'error': 'لم تقم بحل هذا الكويز'}, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'score': float(attempt.score) if attempt.score else None,
                'total_points': float(quiz.total_points),
                'submitted_at': attempt.submitted_at,
                'is_graded': attempt.is_graded,
            })
        
        return Response({'error': 'غير مصرح'}, status=status.HTTP_403_FORBIDDEN)
