from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import ResultPublishing, Term, Level, AcademicYear, Specialization, CourseOffering, StudentGrade, Student
from users.permissions import IsAdminRole, IsStudentAffairsRole, IsStudentRole, HasPaidTuition, IsDeanRole


class PublishingStatusView(APIView):
    """View and toggle publishing status for results (Dean and Student Affairs)"""
    permission_classes = [IsDeanRole | IsStudentAffairsRole]

    def get(self, request):
        """List result publishing status by specific academic tier (On-Demand Search)"""
        year_name = request.query_params.get('year')
        level_name = request.query_params.get('level')
        term_name = request.query_params.get('term')
        dept_name = request.query_params.get('department')
        spec_id = request.query_params.get('specialization')

        if not all([year_name, level_name, term_name]):
            return Response([])

        try:
            academic_year = AcademicYear.objects.get(name=year_name)
            term = Term.objects.get(name=term_name, academic_year=academic_year)
            
            # Find the exact Level based on level_name and department
            level = None
            if dept_name and dept_name != 'الفرقة الإعدادية' and dept_name != 'عام':
                level = Level.objects.filter(name=level_name, department__name=dept_name, academic_year=academic_year).first()
            else:
                # For preparatory, check explicitly or check null
                level = Level.objects.filter(name=level_name, department__name='الفرقة الإعدادية', academic_year=academic_year).first()
                if not level:
                    level = Level.objects.filter(name=level_name, department__isnull=True, academic_year=academic_year).first()

            if not level:
                return Response([])
            spec = None
            if spec_id:
                spec = Specialization.objects.filter(id=spec_id).first()

            s, created = ResultPublishing.objects.get_or_create(
                academic_year=academic_year,
                term=term,
                level=level,
                specialization=spec
            )

            return Response([{
                'id': s.id,
                'academic_year': s.academic_year.name,
                'term': s.term.get_name_display(),
                'level': s.level.get_name_display(),
                'department': s.level.department.name if s.level.department else 'عام',
                'specialization': s.specialization.name if s.specialization else None,
                'student_affairs_approved': s.student_affairs_approved,
                'admin_approved': s.admin_approved,
                'is_published': s.is_published,
                'updated_at': s.updated_at
            }])

        except (AcademicYear.DoesNotExist, Term.DoesNotExist, Level.DoesNotExist):
            return Response([])

    def post(self, request):
        """Toggle publishing flag based on user role"""
        publishing_id = request.data.get('id')
        if not publishing_id:
            return Response({'error': 'Missing publishing ID'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            pub = ResultPublishing.objects.get(id=publishing_id)
        except ResultPublishing.DoesNotExist:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if pub.academic_year.status != 'OPEN' or pub.term.status != 'OPEN':
            # We allow Deans to publish results even if the term is closed (often happens end of year)
            pass
            
        if request.user.role in ['DEAN', 'ADMIN']:
            pub.admin_approved = not pub.admin_approved
        elif request.user.role == 'STUDENT_AFFAIRS':
            pub.student_affairs_approved = not pub.student_affairs_approved
            
        pub.save()
        
        # Log action
        try:
            from .models import AuditLog
            action_name = "TOGGLE_DEAN_PUBLISH" if request.user.role == 'DEAN' else "TOGGLE_SA_PUBLISH"
            AuditLog.objects.create(
                action=action_name,
                performed_by=request.user,
                entity_type='ResultPublishing',
                entity_id=pub.id,
                details={'new_status': pub.is_published}
            )
        except Exception:
            pass
            
        return Response({'message': 'Status updated successfully', 'is_published': pub.is_published})


class StudentResultsQueryView(APIView):
    """Query student results by National ID. Enforces publishing and grading conditions."""
    permission_classes = [AllowAny]

    def get(self, request):
        national_id = request.query_params.get('national_id')
        if not national_id:
            return Response({'error': 'الرقم القومي مطلوب'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            student = Student.objects.get(national_id=national_id)
        except Student.DoesNotExist:
            return Response({'error': 'طالب غير موجود'}, status=status.HTTP_404_NOT_FOUND)
            
        # Get student's current level and academic year
        level = student.level
        academic_year = student.academic_year
        
        terms = Term.objects.filter(academic_year=academic_year)
        
        results_data = {
            'student': {
                'full_name': student.full_name,
                'national_id': student.national_id,
                'level': level.get_name_display(),
                'department': student.department.name if student.department else 'إعدادي',
                'academic_year': academic_year.name
            },
            'terms': []
        }
        
        for term in terms:
            term_data = {
                'term_name': term.get_name_display(),
                'is_published': False,
                'is_fully_graded': False,
                'courses': []
            }
            
            # Check publishing status
            try:
                pub = ResultPublishing.objects.get(academic_year=academic_year, term=term, level=level)
                term_data['is_published'] = pub.is_published
            except ResultPublishing.DoesNotExist:
                term_data['is_published'] = False
                
            # Get all CourseOfferings for this student's level, term, department/specialization
            # Logic: filtering course offerings that apply to this student
            offerings = CourseOffering.objects.filter(
                academic_year=academic_year,
                term=term,
                level=level
            )
            
            if student.department and level.department:
                offerings = offerings.filter(subject__department=student.department)
            if student.specialization:
                offerings = offerings.filter(specialization=student.specialization)
                
            if not offerings.exists():
                results_data['terms'].append(term_data)
                continue
                
            # Check if fully graded and get grades
            is_fully_graded = True
            courses_grades = []
            
            for offering in offerings:
                # Find StudentGrade
                grade = StudentGrade.objects.filter(student=student, course_offering=offering).first()
                if not grade or grade.final is None:
                    is_fully_graded = False
                    break # Optimization: If one is not graded, the whole term is not fully graded
                    
                total_grade = (grade.attendance or 0) + (grade.quizzes or 0) + (grade.coursework or 0) + (grade.midterm or 0) + grade.final
                
                courses_grades.append({
                    'subject_name': offering.subject.name,
                    'subject_code': offering.subject.code,
                    'attendance': grade.attendance,
                    'quizzes': grade.quizzes,
                    'coursework': grade.coursework,
                    'midterm': grade.midterm,
                    'final': grade.final,
                    'total': total_grade,
                    'max_grade': offering.subject.max_grade
                })
                
            term_data['is_fully_graded'] = is_fully_graded
            
            # Only include courses if both published and fully graded
            if term_data['is_published'] and term_data['is_fully_graded']:
                term_data['courses'] = courses_grades
                
            results_data['terms'].append(term_data)
            
        return Response(results_data)
