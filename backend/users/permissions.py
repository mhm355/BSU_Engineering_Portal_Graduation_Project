from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsDoctorRole(permissions.BasePermission):
    """Doctor role - manages courses, attendance, grades"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['DOCTOR', 'ADMIN']


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


class IsHODRole(permissions.BasePermission):
    """Head of Department role - manages department specific academic aspects"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['HOD', 'ADMIN']


class IsStaffAffairsOrHODRole(permissions.BasePermission):
    """Either Staff Affairs or HOD role"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['STAFF_AFFAIRS', 'HOD', 'ADMIN']


class IsDeanRole(permissions.BasePermission):
    """Dean role - ultimate approver for grades and publishing"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['DEAN', 'ADMIN']


class HasPaidTuition(permissions.BasePermission):
    """Checks if a student has paid tuition to access locked services"""
    message = "عذراً، يرجى سداد المصروفات الدراسية للتمكن من الوصول لهذه الخدمة."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Admin and staff always have permission
        if request.user.role != 'STUDENT':
            return True
            
        # Check if student exists and has paid
        if hasattr(request.user, 'student_profile'):
            return request.user.student_profile.has_paid_tuition
        
        # Fallback check looking up Student model directly
        from academic.models import Student
        try:
            student = Student.objects.get(user=request.user)
            return student.has_paid_tuition
        except Student.DoesNotExist:
            return False
