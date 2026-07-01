"""
Graduate Affairs Serializers
"""
from rest_framework import serializers
from .models import GraduateRequest, GraduateRequestStatusHistory, GraduationClearance, GraduateInfoUpdateRequest


class GraduateRequestStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = GraduateRequestStatusHistory
        fields = ['id', 'from_status', 'to_status', 'changed_by', 'changed_by_name', 'comment', 'created_at']

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return f"{obj.changed_by.first_name} {obj.changed_by.last_name}".strip() or obj.changed_by.username
        return None


class GraduateRequestSerializer(serializers.ModelSerializer):
    graduate_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_history = GraduateRequestStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = GraduateRequest
        fields = [
            'id', 'graduate', 'graduate_name', 'request_type', 'request_type_display',
            'status', 'status_display', 'notes', 'internal_notes', 'assigned_to',
            'assigned_to_name', 'attachment', 'created_at', 'updated_at', 'status_history'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_graduate_name(self, obj):
        return f"{obj.graduate.first_name} {obj.graduate.last_name}".strip() or obj.graduate.username

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.username
        return None


class StudentGraduateRequestSerializer(GraduateRequestSerializer):
    class Meta(GraduateRequestSerializer.Meta):
        read_only_fields = GraduateRequestSerializer.Meta.read_only_fields + ['graduate', 'status']



class GraduationClearanceSerializer(serializers.ModelSerializer):
    graduate_name = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    overall_status_display = serializers.CharField(source='get_overall_status_display', read_only=True)

    class Meta:
        model = GraduationClearance
        fields = [
            'id', 'graduate', 'graduate_name',
            'library_cleared', 'library_notes',
            'finance_cleared', 'finance_notes',
            'labs_cleared', 'labs_notes',
            'department_cleared', 'department_notes',
            'housing_cleared', 'housing_notes',
            'other_cleared', 'other_notes',
            'overall_status', 'overall_status_display',
            'progress', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_graduate_name(self, obj):
        return f"{obj.graduate.first_name} {obj.graduate.last_name}".strip() or obj.graduate.username

    def get_progress(self, obj):
        return obj.get_progress()


class GraduateInfoUpdateRequestSerializer(serializers.ModelSerializer):
    graduate_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = GraduateInfoUpdateRequest
        fields = [
            'id', 'graduate', 'graduate_name', 'field_name',
            'old_value', 'new_value', 'status', 'status_display',
            'reviewed_by', 'created_at', 'reviewed_at'
        ]
        read_only_fields = ['created_at', 'reviewed_at']

    def get_graduate_name(self, obj):
        return f"{obj.graduate.first_name} {obj.graduate.last_name}".strip() or obj.graduate.username


# =====================================================================
# Phase 2: Employment & Training Portal Serializers
# =====================================================================

from .models import Company, JobPosting, JobApplication, TrainingEvent, EventRegistration, Notification

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class JobPostingSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)

    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'company', 'company_name', 'company_logo', 
            'description', 'requirements', 'job_type', 'job_type_display',
            'location', 'is_active', 'deadline', 'external_link',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'company_name', 'applicant', 'applicant_name',
            'resume', 'cover_letter', 'status', 'status_display',
            'applied_at', 'updated_at'
        ]
        read_only_fields = ['applicant', 'applied_at', 'updated_at']

    def get_applicant_name(self, obj):
        return f"{obj.applicant.first_name} {obj.applicant.last_name}".strip() or obj.applicant.username


class TrainingEventSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = TrainingEvent
        fields = [
            'id', 'title', 'provider', 'provider_name', 'description',
            'event_type', 'event_type_display', 'date', 'location',
            'max_attendees', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class EventRegistrationSerializer(serializers.ModelSerializer):
    attendee_name = serializers.SerializerMethodField()
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateTimeField(source='event.date', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = EventRegistration
        fields = [
            'id', 'event', 'event_title', 'event_date', 'attendee', 'attendee_name',
            'status', 'status_display', 'registered_at'
        ]
        read_only_fields = ['attendee', 'registered_at']

    def get_attendee_name(self, obj):
        return f"{obj.attendee.first_name} {obj.attendee.last_name}".strip() or obj.attendee.username


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'title', 'message', 'notification_type', 
            'notification_type_display', 'link', 'is_read', 'created_at'
        ]
        read_only_fields = ['recipient', 'created_at']
