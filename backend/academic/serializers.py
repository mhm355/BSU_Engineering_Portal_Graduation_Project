from rest_framework import serializers
from .models import (
    Department, Specialization, AcademicYear, Level, Subject,
    Student, TeachingAssignment, ExamGrade, Certificate,
    Term, GradingTemplate, CourseOffering, Lecture, Attendance, StudentGrade,
    Quiz, AuditLog, ContactMessage, Announcement, UploadHistory
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'has_specializations', 'is_preparatory', 'created_at']


class SpecializationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Specialization
        fields = ['id', 'department', 'department_name', 'name', 'code']


class AcademicYearSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    terms_count = serializers.SerializerMethodField()

    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'status', 'status_display', 'is_current', 'created_at', 'terms_count']

    def get_terms_count(self, obj):
        return obj.terms.count()


class TermSerializer(serializers.ModelSerializer):
    name_display = serializers.CharField(source='get_name_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Term
        fields = ['id', 'name', 'name_display', 'academic_year', 'academic_year_name', 'status', 'status_display']


class LevelSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    year_name = serializers.CharField(source='academic_year.name', read_only=True)
    display_name = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = Level
        fields = ['id', 'name', 'display_name', 'department', 'department_name', 'academic_year', 'year_name']


class SubjectSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    specialization_name = serializers.CharField(source='specialization.name', read_only=True)
    level_display = serializers.SerializerMethodField()
    semester_display = serializers.SerializerMethodField()
    default_grading_template_name = serializers.CharField(
        source='default_grading_template.name', read_only=True
    )

    class Meta:
        model = Subject
        fields = [
            'id', 'code', 'name', 'department', 'department_name',
            'specialization', 'specialization_name', 'level', 'level_display',
            'semester', 'semester_display', 'lecture_hours', 'tutorial_hours',
            'lab_hours', 'credit_hours', 'max_grade', 'is_elective',
            'elective_group', 'default_grading_template', 'default_grading_template_name',
        ]

    def get_level_display(self, obj):
        levels = {
            'PREPARATORY': 'الفرقة الإعدادية',
            'FIRST': 'الفرقة الأولى',
            'SECOND': 'الفرقة الثانية',
            'THIRD': 'الفرقة الثالثة',
            'FOURTH': 'الفرقة الرابعة',
        }
        return levels.get(obj.level, obj.level)

    def get_semester_display(self, obj):
        return 'الفصل الدراسي الأول' if obj.semester == 1 else 'الفصل الدراسي الثاني'


class GradingTemplateSerializer(serializers.ModelSerializer):
    total_weight = serializers.SerializerMethodField()

    class Meta:
        model = GradingTemplate
        fields = [
            'id', 'name', 'attendance_weight', 'attendance_slots',
            'quizzes_weight', 'quiz_count', 'coursework_weight',
            'written_weight', 'practical_weight', 'midterm_weight',
            'final_weight', 'is_default', 'created_at', 'total_weight',
        ]

    def get_total_weight(self, obj):
        return obj.total_weight()


class StudentSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.get_name_display', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'national_id', 'full_name', 'user', 'level', 'level_name',
            'academic_year', 'academic_year_name', 'department', 'department_name',
            'specialization', 'created_at', 'updated_at',
        ]


class CourseOfferingSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    doctor_name = serializers.SerializerMethodField()
    level_name = serializers.CharField(source='level.get_name_display', read_only=True)
    department_name = serializers.SerializerMethodField()
    department_code = serializers.CharField(source='level.department.code', read_only=True)
    term_name = serializers.CharField(source='term.get_name_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    grading_template_name = serializers.CharField(source='grading_template.name', read_only=True)
    specialization_name = serializers.CharField(source='specialization.name', read_only=True)
    specialization_code = serializers.CharField(source='specialization.code', read_only=True)

    class Meta:
        model = CourseOffering
        fields = [
            'id', 'subject', 'subject_name', 'subject_code', 'academic_year',
            'academic_year_name', 'term', 'term_name', 'level', 'level_name',
            'doctor', 'doctor_name', 'department_name', 'department_code',
            'specialization', 'specialization_name', 'specialization_code',
            'grading_template', 'grading_template_name',
            'final_exam_date', 'final_exam_time', 'final_exam_location', 'created_at',
        ]

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}".strip() or obj.doctor.username

    def get_department_name(self, obj):
        if obj.level.department:
            return obj.level.department.name
        return 'الفرقة الإعدادية'


class LectureSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course_offering.subject.name', read_only=True)
    subject_name = serializers.CharField(source='course_offering.subject.name', read_only=True)
    subject_code = serializers.CharField(source='course_offering.subject.code', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = [
            'id', 'course_offering', 'course_name', 'subject_name',
            'subject_code', 'title', 'description', 'file', 'file_url', 'uploaded_at',
        ]

    def get_file_url(self, obj):
        """Return relative URL for file to avoid docker internal hostname issues"""
        if obj.file:
            url = obj.file.url
            # Strip domain/protocol to return relative path
            if url.startswith('http'):
                try:
                    from urllib.parse import urlparse
                    parsed = urlparse(url)
                    return parsed.path
                except Exception:
                    pass
            return url
        return None


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_national_id = serializers.CharField(source='student.national_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_national_id',
            'course_offering', 'course_name', 'lecture_schedule',
            'date', 'status', 'status_display', 'recorded_at',
        ]
    
    def get_course_name(self, obj):
        """Safely get course name even if relationships are null"""
        try:
            if obj.course_offering and obj.course_offering.subject:
                return obj.course_offering.subject.name
        except Exception:
            pass
        return None


class StudentGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_national_id = serializers.CharField(source='student.national_id', read_only=True)
    course_code = serializers.CharField(source='course_offering.subject.code', read_only=True)
    attendance_weight = serializers.SerializerMethodField()
    quizzes_weight = serializers.SerializerMethodField()
    coursework_weight = serializers.SerializerMethodField()
    midterm_weight = serializers.SerializerMethodField()
    final_weight = serializers.SerializerMethodField()
    course_name = serializers.CharField(source='course_offering.subject.name', read_only=True)
    attendance_grade = serializers.SerializerMethodField()
    quizzes_grade = serializers.SerializerMethodField()
    coursework_grade = serializers.DecimalField(source='coursework', max_digits=5, decimal_places=2, read_only=True)
    midterm_grade = serializers.DecimalField(source='midterm', max_digits=5, decimal_places=2, read_only=True)
    final_grade = serializers.DecimalField(source='final', max_digits=5, decimal_places=2, read_only=True)
    total_grade = serializers.SerializerMethodField()
    year_status = serializers.CharField(source='course_offering.academic_year.status', read_only=True)

    class Meta:
        model = StudentGrade
        fields = [
            'id', 'student', 'student_name', 'student_national_id',
            'course_offering', 'course_code', 'course_name',
            'quiz_grades', 'attendance', 'quizzes', 'coursework', 'midterm', 'final',
            'attendance_grade', 'quizzes_grade', 'coursework_grade',
            'midterm_grade', 'final_grade', 'total_grade',
            'attendance_weight', 'quizzes_weight', 'coursework_weight',
            'midterm_weight', 'final_weight', 'year_status',
            'created_at', 'updated_at',
        ]

    def get_attendance_grade(self, obj):
        if obj.attendance is not None:
            return float(obj.attendance)
        return obj.attendance_grade()

    def get_quizzes_grade(self, obj):
        if obj.quizzes is not None:
            return float(obj.quizzes)
        if obj.quiz_grades:
            return sum(obj.quiz_grades.values())
        return 0

    def get_total_grade(self, obj):
        return obj.total_grade()

    def get_Template(self, obj):
        return obj.course_offering.grading_template

    def get_attendance_weight(self, obj):
        tmpl = self.get_Template(obj)
        return tmpl.attendance_weight if tmpl else 0

    def get_quizzes_weight(self, obj):
        tmpl = self.get_Template(obj)
        return tmpl.quizzes_weight if tmpl else 0

    def get_coursework_weight(self, obj):
        tmpl = self.get_Template(obj)
        return tmpl.coursework_weight if tmpl else 0

    def get_midterm_weight(self, obj):
        tmpl = self.get_Template(obj)
        return tmpl.midterm_weight if tmpl else 0

    def get_final_weight(self, obj):
        tmpl = self.get_Template(obj)
        return tmpl.final_weight if tmpl else 0


class TeachingAssignmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.username', read_only=True)
    doctor_full_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    level_name = serializers.CharField(source='level.get_name_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = TeachingAssignment
        fields = [
            'id', 'doctor', 'doctor_name', 'doctor_full_name',
            'subject', 'subject_name', 'subject_code',
            'level', 'level_name', 'academic_year', 'academic_year_name',
        ]

    def get_doctor_full_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}".strip() or obj.doctor.username


class ExamGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = ExamGrade
        fields = [
            'id', 'student', 'student_name', 'subject', 'subject_name',
            'subject_code', 'level', 'academic_year',
            'midterm_grade', 'final_grade', 'is_approved',
            'uploaded_by', 'uploaded_at', 'updated_at',
        ]


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'student', 'student_name', 'file', 'issued_at', 'description']


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'quiz_type', 'total_points', 'is_active', 'time_limit_minutes', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'action_display', 'performed_by', 'performed_by_name',
            'entity_type', 'entity_id', 'details', 'created_at',
        ]

    def get_performed_by_name(self, obj):
        u = obj.performed_by
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username


class ContactMessageSerializer(serializers.ModelSerializer):
    inquiry_type_display = serializers.CharField(source='get_inquiry_type_display', read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'phone', 'inquiry_type', 'inquiry_type_display',
            'department', 'subject', 'message', 'is_read', 'created_at',
        ]
        read_only_fields = ['id', 'is_read', 'created_at']


class AnnouncementSerializer(serializers.ModelSerializer):
    target_role_display = serializers.CharField(source='get_target_role_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    target_roles = serializers.CharField(source='target_role', read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'message', 'target_role', 'target_roles', 'target_role_display',
            'created_by', 'created_by_name', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_created_by_name(self, obj):
        u = obj.created_by
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username


class UploadHistorySerializer(serializers.ModelSerializer):
    upload_type_display = serializers.CharField(source='get_upload_type_display', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = UploadHistory
        fields = [
            'id', 'upload_type', 'upload_type_display', 'file_name',
            'uploaded_by', 'uploaded_by_name', 'total_rows',
            'created_count', 'updated_count', 'error_count',
            'errors_json', 'created_at',
        ]

    def get_uploaded_by_name(self, obj):
        u = obj.uploaded_by
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username

