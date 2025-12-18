from django.db import models
from django.conf import settings


class Department(models.Model):
    """Academic departments - fixed data managed by Admin only"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    has_specializations = models.BooleanField(default=False)
    is_preparatory = models.BooleanField(default=False)  # True for Preparatory
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name


class Specialization(models.Model):
    """Specializations within a department (e.g., ECE, Power for Electrical)"""
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='specializations')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)

    class Meta:
        unique_together = ('department', 'code')

    def __str__(self):
        return f"{self.name} ({self.department.name})"


class AcademicYear(models.Model):
    """Academic year - system-wide, managed by Admin"""
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'مفتوح'
        CLOSED = 'CLOSED', 'مغلق'

    name = models.CharField(max_length=20, unique=True)  # e.g., "2024-2025"
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def save(self, *args, **kwargs):
        # Ensure only one academic year is current
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class Term(models.Model):
    """Academic term/semester - fixed: First and Second"""
    class TermName(models.TextChoices):
        FIRST = 'FIRST', 'الترم الأول'
        SECOND = 'SECOND', 'الترم الثاني'

    name = models.CharField(max_length=10, choices=TermName.choices)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='terms')

    class Meta:
        unique_together = ('name', 'academic_year')

    def __str__(self):
        return f"{self.get_name_display()} - {self.academic_year.name}"


class Level(models.Model):
    class LevelName(models.TextChoices):
        PREPARATORY = "PREPARATORY", "الفرقة الإعدادية"
        FIRST = "FIRST", "الفرقة الأولى"
        SECOND = "SECOND", "الفرقة الثانية"
        THIRD = "THIRD", "الفرقة الثالثة"
        FOURTH = "FOURTH", "الفرقة الرابعة"

    name = models.CharField(max_length=50, choices=LevelName.choices)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='levels',
        null=True,
        blank=True
    )
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('name', 'department', 'academic_year')

    def __str__(self):
        if self.department:
            return f"{self.get_name_display()} - {self.department.name} ({self.academic_year.name})"
        return f"{self.get_name_display()} ({self.academic_year.name})"


class Subject(models.Model):
    """Fixed subjects from the official curriculum - NOT editable by users"""
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subjects'
    )
    specialization = models.ForeignKey(
        Specialization,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subjects'
    )
    level = models.CharField(max_length=20, choices=Level.LevelName.choices)
    semester = models.IntegerField(choices=[(1, 'الفصل الدراسي الأول'), (2, 'الفصل الدراسي الثاني')])
    lecture_hours = models.IntegerField(default=2)
    tutorial_hours = models.IntegerField(default=1)
    lab_hours = models.IntegerField(default=0)
    credit_hours = models.IntegerField(default=3)
    max_grade = models.IntegerField(default=100)
    is_elective = models.BooleanField(default=False)
    elective_group = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class GradingTemplate(models.Model):
    """Grading template defining how courses are graded"""
    name = models.CharField(max_length=100)
    attendance_weight = models.IntegerField(default=10, help_text="Weight for attendance (e.g., 10)")
    attendance_slots = models.IntegerField(default=14, help_text="Number of attendance sessions")
    quizzes_weight = models.IntegerField(default=10, help_text="Weight for quizzes")
    quiz_count = models.IntegerField(default=2, help_text="Number of quizzes")
    coursework_weight = models.IntegerField(default=10, help_text="Weight for coursework/assignments")
    midterm_weight = models.IntegerField(default=20, help_text="Weight for midterm exam")
    final_weight = models.IntegerField(default=50, help_text="Weight for final exam")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def total_weight(self):
        return (self.attendance_weight + self.quizzes_weight + 
                self.coursework_weight + self.midterm_weight + self.final_weight)

    def __str__(self):
        return f"{self.name} (A:{self.attendance_weight} Q:{self.quizzes_weight} C:{self.coursework_weight} M:{self.midterm_weight} F:{self.final_weight})"


class Student(models.Model):
    """Academic entity for students"""
    national_id = models.CharField(max_length=14, unique=True)
    full_name = models.CharField(max_length=200)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True,
        blank=True
    )
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='students')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='students'
    )
    specialization = models.ForeignKey(
        Specialization,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='students'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.national_id})"


class CourseOffering(models.Model):
    """A specific offering of a subject in a term/year with assigned doctor"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='offerings')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='course_offerings')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='course_offerings')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='course_offerings')
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'DOCTOR'},
        related_name='course_offerings'
    )
    grading_template = models.ForeignKey(
        GradingTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='course_offerings'
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        unique_together = ('subject', 'academic_year', 'term', 'level')

    def __str__(self):
        dept = self.level.department.name if self.level.department else 'Prep'
        return f"{self.subject.name} - {dept} - {self.level.get_name_display()} - {self.term.get_name_display()}"


class Lecture(models.Model):
    """Lecture materials uploaded by doctor"""
    course_offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='lectures/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.course_offering.subject.name}"


class Attendance(models.Model):
    """Student attendance per session"""
    class AttendanceStatus(models.TextChoices):
        PRESENT = 'PRESENT', 'حاضر'
        ABSENT = 'ABSENT', 'غائب'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    course_offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name='attendance_records')
    session_number = models.IntegerField()
    status = models.CharField(max_length=10, choices=AttendanceStatus.choices, default=AttendanceStatus.ABSENT)
    recorded_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course_offering', 'session_number')

    def __str__(self):
        return f"{self.student.full_name} - Session {self.session_number}: {self.get_status_display()}"


class StudentGrade(models.Model):
    """Comprehensive grades for a student in a course offering"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='course_grades')
    course_offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name='grades')
    quiz_grades = models.JSONField(default=dict, blank=True)  # {1: 8.5, 2: 9.0}
    coursework = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    midterm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    final = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course_offering')

    def attendance_grade(self):
        """Calculate attendance grade based on presence"""
        if not self.course_offering.grading_template:
            return 0
        total_sessions = self.course_offering.grading_template.attendance_slots
        present_count = self.student.attendance_records.filter(
            course_offering=self.course_offering,
            status=Attendance.AttendanceStatus.PRESENT
        ).count()
        if total_sessions == 0:
            return 0
        weight = self.course_offering.grading_template.attendance_weight
        return (present_count / total_sessions) * weight

    def total_grade(self):
        """Calculate total grade"""
        total = 0
        if self.coursework:
            total += float(self.coursework)
        if self.midterm:
            total += float(self.midterm)
        if self.final:
            total += float(self.final)
        total += self.attendance_grade()
        # Add quiz grades
        if self.quiz_grades:
            total += sum(self.quiz_grades.values())
        return total

    def __str__(self):
        return f"{self.student.full_name} - {self.course_offering.subject.name}: {self.total_grade()}"


# Legacy model - keeping for backward compatibility
class TeachingAssignment(models.Model):
    """Doctor assigned to teach a subject - DEPRECATED, use CourseOffering"""
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'DOCTOR'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('subject', 'level', 'academic_year')

    def __str__(self):
        return f"{self.doctor.username} - {self.subject.name}"


class ExamGrade(models.Model):
    """Exam grades for midterm and final exams - Legacy model"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    midterm_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    final_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_exam_grades'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'subject', 'academic_year')

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.code}: M={self.midterm_grade}, F={self.final_grade}"


class Certificate(models.Model):
    """Graduation certificates for students"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'STUDENT'}
    )
    file = models.FileField(upload_to='certificates/')
    issued_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Certificate for {self.student.username}"


class AuditLog(models.Model):
    """Track batch upload and other administrative actions"""
    class ActionType(models.TextChoices):
        STUDENT_BATCH_UPLOAD = "STUDENT_BATCH_UPLOAD", "Student Batch Upload"
        DOCTOR_BATCH_UPLOAD = "DOCTOR_BATCH_UPLOAD", "Doctor Batch Upload"
        STAFF_BATCH_UPLOAD = "STAFF_BATCH_UPLOAD", "Staff Batch Upload"
        GRADE_UPLOAD = "GRADE_UPLOAD", "Grade Upload"

    action = models.CharField(max_length=50, choices=ActionType.choices)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    entity_type = models.CharField(max_length=50)
    entity_id = models.IntegerField(null=True, blank=True)
    details = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} by {self.performed_by.username} at {self.created_at}"
