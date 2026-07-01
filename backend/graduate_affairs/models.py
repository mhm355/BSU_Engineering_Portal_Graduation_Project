"""
Graduate Affairs Models
Handles graduate requests, clearance, info updates, and certificate management.
"""
from django.db import models
from django.conf import settings


class GraduateRequest(models.Model):
    """Service requests submitted by graduates or on behalf of graduates"""

    class RequestType(models.TextChoices):
        TEMP_CERTIFICATE = 'TEMP_CERTIFICATE', 'شهادة تخرج مؤقتة'
        OFFICIAL_CERTIFICATE = 'OFFICIAL_CERTIFICATE', 'شهادة تخرج رسمية'
        CERTIFICATE_REPLACEMENT = 'CERTIFICATE_REPLACEMENT', 'بدل فاقد شهادة'
        TRANSCRIPT_AR = 'TRANSCRIPT_AR', 'كشف درجات عربي'
        TRANSCRIPT_EN = 'TRANSCRIPT_EN', 'كشف درجات إنجليزي'
        GRADUATION_STATEMENT = 'GRADUATION_STATEMENT', 'إفادة تخرج'
        DEGREE_VERIFICATION = 'DEGREE_VERIFICATION', 'خطاب تأكيد درجة'
        CERTIFICATE_AUTH = 'CERTIFICATE_AUTH', 'توثيق شهادة'
        INFO_UPDATE = 'INFO_UPDATE', 'تحديث بيانات'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'مسودة'
        SUBMITTED = 'SUBMITTED', 'تم التقديم'
        UNDER_REVIEW = 'UNDER_REVIEW', 'قيد المراجعة'
        MISSING_DOCUMENTS = 'MISSING_DOCUMENTS', 'مستندات ناقصة'
        APPROVED = 'APPROVED', 'تمت الموافقة'
        REJECTED = 'REJECTED', 'مرفوض'
        COMPLETED = 'COMPLETED', 'مكتمل'

    graduate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='graduate_requests'
    )
    request_type = models.CharField(max_length=30, choices=RequestType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    notes = models.TextField(blank=True, help_text='ملاحظات من الخريج')
    internal_notes = models.TextField(blank=True, help_text='ملاحظات داخلية للموظف')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_graduate_requests'
    )
    attachment = models.FileField(upload_to='graduate_requests/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_request_type_display()} - {self.graduate.username} ({self.get_status_display()})"


class GraduateRequestStatusHistory(models.Model):
    """Timeline of status changes for a graduate request"""
    request = models.ForeignKey(
        GraduateRequest,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    from_status = models.CharField(max_length=20, choices=GraduateRequest.Status.choices, blank=True)
    to_status = models.CharField(max_length=20, choices=GraduateRequest.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.request.id}: {self.from_status} → {self.to_status}"


class GraduationClearance(models.Model):
    """Graduation clearance checklist for a graduate"""

    class ClearanceStatus(models.TextChoices):
        PENDING = 'PENDING', 'قيد الانتظار'
        IN_PROGRESS = 'IN_PROGRESS', 'جاري التنفيذ'
        COMPLETED = 'COMPLETED', 'مكتمل'

    graduate = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='graduation_clearance'
    )
    library_cleared = models.BooleanField(default=False)
    library_notes = models.CharField(max_length=255, blank=True)
    finance_cleared = models.BooleanField(default=False)
    finance_notes = models.CharField(max_length=255, blank=True)
    labs_cleared = models.BooleanField(default=False)
    labs_notes = models.CharField(max_length=255, blank=True)
    department_cleared = models.BooleanField(default=False)
    department_notes = models.CharField(max_length=255, blank=True)
    housing_cleared = models.BooleanField(default=False)
    housing_notes = models.CharField(max_length=255, blank=True)
    other_cleared = models.BooleanField(default=False)
    other_notes = models.CharField(max_length=255, blank=True)
    overall_status = models.CharField(
        max_length=20,
        choices=ClearanceStatus.choices,
        default=ClearanceStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_progress(self):
        """Calculate clearance completion percentage"""
        fields = [
            self.library_cleared, self.finance_cleared,
            self.labs_cleared, self.department_cleared,
            self.housing_cleared, self.other_cleared
        ]
        cleared = sum(1 for f in fields if f)
        return round((cleared / len(fields)) * 100)

    def __str__(self):
        return f"Clearance for {self.graduate.username} - {self.get_overall_status_display()}"


class GraduateInfoUpdateRequest(models.Model):
    """Pending information change requests from graduates"""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'قيد المراجعة'
        APPROVED = 'APPROVED', 'تمت الموافقة'
        REJECTED = 'REJECTED', 'مرفوض'

    graduate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='info_update_requests'
    )
    field_name = models.CharField(max_length=50, help_text='اسم الحقل المراد تعديله')
    old_value = models.TextField(blank=True)
    new_value = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_info_updates'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.graduate.username} - {self.field_name}: {self.get_status_display()}"


# =====================================================================
# Phase 2: Employment & Training Portal Models
# =====================================================================

class Company(models.Model):
    """Partner companies for employment and training opportunities"""
    name = models.CharField(max_length=200, help_text="اسم الشركة")
    industry = models.CharField(max_length=100, help_text="مجال العمل / الصناعة")
    logo = models.ImageField(upload_to='companies/logos/', null=True, blank=True)
    website = models.URLField(blank=True, help_text="الموقع الإلكتروني")
    description = models.TextField(blank=True, help_text="نبذة عن الشركة")
    contact_email = models.EmailField(blank=True, help_text="البريد الإلكتروني للتواصل")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name


class JobPosting(models.Model):
    """Job and internship postings from partner companies"""
    
    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'دوام كامل'
        PART_TIME = 'PART_TIME', 'دوام جزئي'
        INTERNSHIP = 'INTERNSHIP', 'تدريب / Internship'
        FREELANCE = 'FREELANCE', 'عمل حر / مستقل'

    title = models.CharField(max_length=200, help_text="المسمى الوظيفي")
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        related_name='job_postings'
    )
    description = models.TextField(help_text="الوصف الوظيفي")
    requirements = models.TextField(help_text="متطلبات الوظيفة")
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    location = models.CharField(max_length=200, help_text="مقر العمل")
    is_active = models.BooleanField(default=True, help_text="متاح للتقديم")
    deadline = models.DateField(null=True, blank=True, help_text="آخر موعد للتقديم")
    external_link = models.URLField(blank=True, help_text="رابط التقديم الخارجي (إن وجد)")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_job_postings'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} @ {self.company.name}"


class JobApplication(models.Model):
    """Applications submitted by graduates/students for a job posting"""
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'قيد المراجعة'
        REVIEWED = 'REVIEWED', 'تمت المراجعة'
        SHORTLISTED = 'SHORTLISTED', 'القائمة المختصرة'
        ACCEPTED = 'ACCEPTED', 'مقبول'
        REJECTED = 'REJECTED', 'مرفوض'

    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_applications'
    )
    resume = models.FileField(upload_to='resumes/', help_text="السيرة الذاتية")
    cover_letter = models.TextField(blank=True, help_text="خطاب التغطية / الدافع")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f"{self.applicant.username} -> {self.job.title}"


class TrainingEvent(models.Model):
    """Workshops, seminars, and training events organized for graduates"""
    
    class EventType(models.TextChoices):
        WORKSHOP = 'WORKSHOP', 'ورشة عمل'
        SEMINAR = 'SEMINAR', 'ندوة تعريفية'
        CAREER_FAIR = 'CAREER_FAIR', 'ملتقى توظيفي'
        TRAINING_COURSE = 'TRAINING_COURSE', 'دورة تدريبية'

    title = models.CharField(max_length=200, help_text="عنوان الفعالية")
    provider = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="الجهة المقدمة للتدريب (اختياري إذا كانت الكلية هي المنظمة)",
        related_name='training_events'
    )
    description = models.TextField(help_text="تفاصيل الفعالية")
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.WORKSHOP)
    date = models.DateTimeField(help_text="تاريخ ووقت الفعالية")
    location = models.CharField(max_length=200, help_text="المكان (أو رابط الأونلاين)")
    max_attendees = models.PositiveIntegerField(null=True, blank=True, help_text="الحد الأقصى للحضور (اتركه فارغاً إذا لم يكن هناك حد)")
    is_active = models.BooleanField(default=True, help_text="متاح للتسجيل")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} ({self.get_event_type_display()})"


class EventRegistration(models.Model):
    """Registration records for training events"""
    
    class Status(models.TextChoices):
        REGISTERED = 'REGISTERED', 'تم التسجيل'
        ATTENDED = 'ATTENDED', 'حضر'
        CANCELLED = 'CANCELLED', 'ملغى'

    event = models.ForeignKey(
        TrainingEvent,
        on_delete=models.CASCADE,
        related_name='registrations'
    )
    attendee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_registrations'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REGISTERED)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-registered_at']
        unique_together = ('event', 'attendee')

    def __str__(self):
        return f"{self.attendee.username} -> {self.event.title}"


# =====================================================================
# Phase 3: Notifications
# =====================================================================

class Notification(models.Model):
    """System notifications for graduates and staff"""
    
    class NotificationType(models.TextChoices):
        INFO = 'INFO', 'معلومة'
        SUCCESS = 'SUCCESS', 'نجاح'
        WARNING = 'WARNING', 'تحذير'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices, default=NotificationType.INFO)
    link = models.CharField(max_length=255, blank=True, help_text="رابط للتوجه إليه عند النقر (مثال: /student/career-portal)")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_notification_type_display()}] {self.recipient.username}: {self.title}"

