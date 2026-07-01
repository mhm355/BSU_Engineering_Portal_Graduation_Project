from django.contrib import admin
from .models import GraduateRequest, GraduateRequestStatusHistory, GraduationClearance, GraduateInfoUpdateRequest


@admin.register(GraduateRequest)
class GraduateRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'graduate', 'request_type', 'status', 'assigned_to', 'created_at']
    list_filter = ['status', 'request_type']
    search_fields = ['graduate__username', 'graduate__first_name', 'graduate__last_name']


@admin.register(GraduateRequestStatusHistory)
class GraduateRequestStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['request', 'from_status', 'to_status', 'changed_by', 'created_at']


@admin.register(GraduationClearance)
class GraduationClearanceAdmin(admin.ModelAdmin):
    list_display = ['graduate', 'overall_status', 'created_at']
    list_filter = ['overall_status']


@admin.register(GraduateInfoUpdateRequest)
class GraduateInfoUpdateRequestAdmin(admin.ModelAdmin):
    list_display = ['graduate', 'field_name', 'status', 'created_at']
    list_filter = ['status']
