import io
import zipfile
import pandas as pd
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from users.permissions import IsAdminRole, IsDeanRole
from .models import AcademicYear, Term, Student, CourseOffering, ExamGrade, StudentQuizAttempt, Attendance

class ExportAcademicDataView(APIView):
    """
    Exports all data for a specific Academic Year or Term into a ZIP file of Excel spreadsheets.
    Accessible by Admin and Dean.
    """
    permission_classes = [IsAdminRole | IsDeanRole]

    def get(self, request):
        academic_year_id = request.query_params.get('academic_year_id')
        term_id = request.query_params.get('term_id')

        if not academic_year_id and not term_id:
            return Response({'error': 'Must provide either academic_year_id or term_id'}, status=status.HTTP_400_BAD_REQUEST)

        # Filters
        student_filter = {}
        course_filter = {}
        grade_filter = {}
        quiz_filter = {}
        attendance_filter = {}

        prefix_name = "export"

        if term_id:
            try:
                term = Term.objects.get(id=term_id)
                prefix_name = f"Term_{term.name_display}"
                
                # Students don't belong to a term, they belong to a year/level, but we export students of that year
                student_filter['level__academic_year'] = term.academic_year
                
                course_filter['term'] = term
                grade_filter['academic_year'] = term.academic_year # Grades are per year, but we export them anyway
                quiz_filter['quiz__course_offering__term'] = term
                attendance_filter['lecture__course_offering__term'] = term
            except Term.DoesNotExist:
                return Response({'error': 'Term not found'}, status=status.HTTP_404_NOT_FOUND)
        elif academic_year_id:
            try:
                year = AcademicYear.objects.get(id=academic_year_id)
                prefix_name = f"Year_{year.name}"
                
                student_filter['level__academic_year'] = year
                course_filter['academic_year'] = year
                grade_filter['academic_year'] = year
                quiz_filter['quiz__course_offering__academic_year'] = year
                attendance_filter['lecture__course_offering__academic_year'] = year
            except AcademicYear.DoesNotExist:
                return Response({'error': 'Academic Year not found'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Gather Students
        students = Student.objects.filter(**student_filter).select_related('user', 'level', 'department', 'specialization')
        students_data = []
        for s in students:
            students_data.append({
                'National ID': s.national_id,
                'First Name': s.user.first_name if s.user else '',
                'Last Name': s.user.last_name if s.user else '',
                'Email': s.user.email if s.user else '',
                'Level': s.level.get_name_display() if s.level else '',
                'Department': s.department.name if s.department else '',
                'Specialization': s.specialization.name if s.specialization else '',
                'Tuition Paid': 'Yes' if s.has_paid_tuition else 'No'
            })
        df_students = pd.DataFrame(students_data)

        # 2. Gather Course Offerings
        courses = CourseOffering.objects.filter(**course_filter).select_related('subject', 'doctor', 'level', 'term')
        courses_data = []
        for c in courses:
            doctor_name = f"{c.doctor.first_name} {c.doctor.last_name}" if c.doctor else "Unassigned"
            courses_data.append({
                'Subject Name': c.subject.name if c.subject else '',
                'Subject Code': c.subject.code if c.subject else '',
                'Doctor': doctor_name,
                'Level': c.level.get_name_display() if c.level else '',
                'Term': c.term.get_name_display() if c.term else '',
            })
        df_courses = pd.DataFrame(courses_data)

        # 3. Gather Exam Grades
        grades = ExamGrade.objects.filter(**grade_filter).select_related('student', 'subject', 'level')
        grades_data = []
        for g in grades:
            midterm = float(g.midterm_grade) if g.midterm_grade else 0.0
            final = float(g.final_grade) if g.final_grade else 0.0
            grades_data.append({
                'Student National ID': g.student.national_id if g.student else '',
                'Subject Code': g.subject.code if g.subject else '',
                'Midterm Grade': g.midterm_grade,
                'Final Grade': g.final_grade,
                'Total Score': midterm + final,
                'Approved': 'Yes' if g.is_approved else 'No'
            })
        df_grades = pd.DataFrame(grades_data)

        # 4. Gather Quiz Attempts
        quizzes = StudentQuizAttempt.objects.filter(**quiz_filter).select_related('student', 'quiz', 'quiz__course_offering__subject')
        quizzes_data = []
        for q in quizzes:
            quizzes_data.append({
                'Student National ID': q.student.national_id if q.student else '',
                'Subject Code': q.quiz.course_offering.subject.code if q.quiz and q.quiz.course_offering and q.quiz.course_offering.subject else '',
                'Quiz Title': q.quiz.title if q.quiz else '',
                'Score': q.score,
                'Submitted At': q.submitted_at.strftime('%Y-%m-%d %H:%M') if q.submitted_at else ''
            })
        df_quizzes = pd.DataFrame(quizzes_data)

        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Helper to write dataframe to excel and add to zip
            def add_df_to_zip(df, filename):
                if df.empty:
                    # Write an empty DataFrame but with columns if possible
                    if len(df.columns) == 0:
                        df = pd.DataFrame(["No data available"])
                excel_buffer = io.BytesIO()
                with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False)
                zip_file.writestr(filename, excel_buffer.getvalue())

            add_df_to_zip(df_students, 'students.xlsx')
            add_df_to_zip(df_courses, 'course_offerings.xlsx')
            add_df_to_zip(df_grades, 'exam_grades.xlsx')
            add_df_to_zip(df_quizzes, 'quiz_attempts.xlsx')

        zip_buffer.seek(0)
        
        # Return response
        response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={prefix_name}_database_export.zip'
        return response
