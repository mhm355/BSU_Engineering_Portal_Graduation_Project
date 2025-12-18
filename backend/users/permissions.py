from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsDoctorRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'DOCTOR'


class IsStudentRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'STUDENT'


class IsStudentAffairsRole(permissions.BasePermission):
    """Student Affairs role - manages students and grades"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['STUDENT_AFFAIRS', 'ADMIN']


class IsStaffAffairsRole(permissions.BasePermission):
    """Staff Affairs role - manages doctors and staff"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['STAFF_AFFAIRS', 'ADMIN']


class IsAdminOrStudentAffairs(permissions.BasePermission):
    """Either Admin or Student Affairs role"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'STUDENT_AFFAIRS']


class IsAdminOrStaffAffairs(permissions.BasePermission):
    """Either Admin or Staff Affairs role"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'STAFF_AFFAIRS']
