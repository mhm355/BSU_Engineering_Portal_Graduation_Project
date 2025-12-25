from rest_framework import serializers
from .models import (
    Department, Specialization, AcademicYear, Level, Subject,
    Student, TeachingAssignment, ExamGrade, Certificate,
    Term, GradingTemplate, CourseOffering, Lecture, Attendance, StudentGrade
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class SpecializationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Specialization
        fields = '__all__'


class AcademicYearSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    terms_count = serializers.SerializerMethodField()

    class Meta:
        model = AcademicYear
        fields = '__all__'

    def get_terms_count(self, obj):
        return obj.terms.count()


class TermSerializer(serializers.ModelSerializer):
    name_display = serializers.CharField(source='get_name_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = Term
        fields = '__all__'


class LevelSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    year_name = serializers.CharField(source='academic_year.name', read_only=True)
    display_name = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = Level
        fields = '__all__'


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
        fields = '__all__'

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
        fields = '__all__'

    def get_total_weight(self, obj):
        return obj.total_weight()


class StudentSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.get_name_display', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'


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
        fields = '__all__'

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}".strip() or obj.doctor.username

    def get_department_name(self, obj):
        if obj.level.department:
            return obj.level.department.name
        return 'الفرقة الإعدادية'


class LectureSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course_offering.subject.name', read_only=True)

    class Meta:
        model = Lecture
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_national_id = serializers.CharField(source='student.national_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class StudentGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_national_id = serializers.CharField(source='student.national_id', read_only=True)
    course_name = serializers.CharField(source='course_offering.subject.name', read_only=True)
    attendance_grade = serializers.SerializerMethodField()
    total_grade = serializers.SerializerMethodField()

    class Meta:
        model = StudentGrade
        fields = '__all__'

    def get_attendance_grade(self, obj):
        return obj.attendance_grade()

    def get_total_grade(self, obj):
        return obj.total_grade()


class TeachingAssignmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.username', read_only=True)
    doctor_full_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    level_name = serializers.CharField(source='level.get_name_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = TeachingAssignment
        fields = '__all__'

    def get_doctor_full_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}".strip() or obj.doctor.username


class ExamGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = ExamGrade
        fields = '__all__'


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)

    class Meta:
        model = Certificate
        fields = '__all__'
