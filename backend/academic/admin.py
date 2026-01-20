from django.contrib import admin
from .models import (
    Department, Specialization, AcademicYear, Term, Level, Subject,
    GradingTemplate, Student, CourseOffering, Lecture, LectureSchedule,
    Attendance, StudentGrade, TeachingAssignment, ExamGrade, Certificate,
    AuditLog, Quiz, QuizQuestion, QuizChoice, StudentQuizAttempt,
    StudentQuizAnswer, DoctorDeletionRequest
)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'has_specializations')
    search_fields = ('name', 'code')

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'department')
    list_filter = ('department',)

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'is_current')
    list_filter = ('status', 'is_current')

@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ('name', 'academic_year')
    list_filter = ('academic_year',)

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'academic_year')
    list_filter = ('department', 'academic_year')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'specialization', 'level', 'semester')
    list_filter = ('department', 'level', 'semester')
    search_fields = ('code', 'name')

@admin.register(GradingTemplate)
class GradingTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_weight', 'is_default')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'national_id', 'level', 'department')
    list_filter = ('level', 'department')
    search_fields = ('full_name', 'national_id')

@admin.register(CourseOffering)
class CourseOfferingAdmin(admin.ModelAdmin):
    list_display = ('subject', 'doctor', 'term', 'academic_year')
    list_filter = ('academic_year', 'term', 'level')

@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('title', 'course_offering', 'uploaded_at')

@admin.register(LectureSchedule)
class LectureScheduleAdmin(admin.ModelAdmin):
    list_display = ('course_offering', 'day', 'start_time', 'location', 'schedule_type')
    list_filter = ('day', 'schedule_type')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_offering', 'date', 'status')
    list_filter = ('status', 'date', 'course_offering')

@admin.register(StudentGrade)
class StudentGradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_offering', 'total_grade')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'course_offering', 'quiz_type', 'is_active')
    list_filter = ('course_offering', 'quiz_type', 'is_active')

@admin.register(StudentQuizAttempt)
class StudentQuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'status', 'submitted_at')
    list_filter = ('status', 'is_graded')

# Simple registrations for others
admin.site.register(TeachingAssignment)
admin.site.register(ExamGrade)
admin.site.register(Certificate)
admin.site.register(AuditLog)
admin.site.register(QuizQuestion)
admin.site.register(QuizChoice)
admin.site.register(StudentQuizAnswer)
admin.site.register(DoctorDeletionRequest)
