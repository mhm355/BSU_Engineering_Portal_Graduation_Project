"""
Exam Grades Views for upload, approval, and student access
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.db import transaction
import pandas as pd

from .models import ExamGrade, Student, Subject, Level, AcademicYear
from users.permissions import IsAdminRole, IsStudentAffairsRole, IsStudentRole


class UploadExamGradesView(APIView):
    """Student Affairs uploads exam grades for a level"""
    permission_classes = [IsStudentAffairsRole]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        level_id = request.data.get('level_id')
        grade_type = request.data.get('grade_type')  # 'midterm' or 'final'

        if not file or not level_id or not grade_type:
            return Response(
                {'error': 'يرجى تحديد الملف، الفرقة، ونوع الامتحان'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if grade_type not in ['midterm', 'final']:
            return Response(
                {'error': 'نوع الامتحان يجب أن يكون midterm أو final'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            return Response({'error': 'الفرقة غير موجودة'}, status=status.HTTP_404_NOT_FOUND)

        try:
            df = pd.read_excel(file)
        except Exception as e:
            return Response({'error': f'خطأ في قراءة الملف: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        if 'national_id' not in df.columns:
            return Response(
                {'error': 'الملف يجب أن يحتوي على عمود national_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get subject columns (all columns except national_id)
        subject_columns = [col for col in df.columns if col != 'national_id']
        
        # Validate subject codes
        subjects = {}
        for code in subject_columns:
            try:
                subject = Subject.objects.get(
                    code=code,
                    level=level.name,
                    department=level.department
                )
                subjects[code] = subject
            except Subject.DoesNotExist:
                return Response(
                    {'error': f'المادة {code} غير موجودة لهذه الفرقة'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        success_count = 0
        errors = []

        with transaction.atomic():
            for _, row in df.iterrows():
                national_id = str(row['national_id']).strip()
                
                try:
                    student = Student.objects.get(national_id=national_id, level=level)
                except Student.DoesNotExist:
                    errors.append(f'الطالب {national_id} غير موجود')
                    continue

                for subject_code, subject in subjects.items():
                    grade_value = row.get(subject_code)
                    
                    if pd.isna(grade_value):
                        continue

                    try:
                        grade_value = float(grade_value)
                    except (ValueError, TypeError):
                        errors.append(f'درجة غير صالحة للطالب {national_id} في {subject_code}')
                        continue

                    # Get or create ExamGrade
                    exam_grade, created = ExamGrade.objects.get_or_create(
                        student=student,
                        subject=subject,
                        academic_year=level.academic_year,
                        defaults={
                            'level': level,
                            'uploaded_by': request.user,
                        }
                    )

                    # Update the appropriate grade field
                    if grade_type == 'midterm':
                        exam_grade.midterm_grade = grade_value
                    else:
                        exam_grade.final_grade = grade_value
                    
                    exam_grade.is_approved = False  # Needs approval again
                    exam_grade.uploaded_by = request.user
                    exam_grade.save()
                    success_count += 1

        return Response({
            'message': f'تم رفع {success_count} درجة بنجاح',
            'errors': errors[:10] if errors else [],
            'total_errors': len(errors)
        })


class PendingExamGradesView(APIView):
    """Admin views pending grades (count only, no individual grades)"""
    permission_classes = [IsAdminRole]

    def get(self, request):
        from django.db.models import Count, Q
        
        pending = ExamGrade.objects.filter(is_approved=False).values(
            'level__id',
            'level__name',
            'level__department__name',
            'academic_year__name',
        ).annotate(
            count=Count('id'),
            midterm_count=Count('id', filter=Q(midterm_grade__isnull=False, is_approved=False)),
            final_count=Count('id', filter=Q(final_grade__isnull=False, is_approved=False)),
        ).order_by('-count')

        result = []
        level_names = {
            'PREPARATORY': 'الإعدادية',
            'FIRST': 'الأولى',
            'SECOND': 'الثانية',
            'THIRD': 'الثالثة',
            'FOURTH': 'الرابعة',
        }
        for item in pending:
            result.append({
                'level_id': item['level__id'],
                'level_name': level_names.get(item['level__name'], item['level__name']),
                'department': item['level__department__name'] or 'إعدادي',
                'academic_year': item['academic_year__name'],
                'pending_count': item['count'],
                'midterm_count': item['midterm_count'],
                'final_count': item['final_count'],
            })

        return Response(result)


class ApproveExamGradesView(APIView):
    """Admin approves grades for a level"""
    permission_classes = [IsAdminRole]

    def post(self, request, level_id):
        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            return Response({'error': 'الفرقة غير موجودة'}, status=status.HTTP_404_NOT_FOUND)

        updated = ExamGrade.objects.filter(level=level, is_approved=False).update(is_approved=True)

        return Response({
            'message': f'تمت الموافقة على {updated} درجة',
            'approved_count': updated
        })


class PendingExamGradesCountView(APIView):
    """Get total count of pending grades for dashboard badge"""
    permission_classes = [IsAdminRole]

    def get(self, request):
        count = ExamGrade.objects.filter(is_approved=False).count()
        return Response({'pending_grades_count': count})


class StudentExamGradesView(APIView):
    """Student views their own grades"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'ملف الطالب غير موجود'}, status=status.HTTP_404_NOT_FOUND)

        grades = ExamGrade.objects.filter(
            student=student,
            is_approved=True
        ).select_related('subject')

        result = []
        for grade in grades:
            result.append({
                'subject_name': grade.subject.name,
                'subject_code': grade.subject.code,
                'midterm_grade': float(grade.midterm_grade) if grade.midterm_grade else None,
                'final_grade': float(grade.final_grade) if grade.final_grade else None,
            })

        return Response(result)
