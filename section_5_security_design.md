
# Section 5 — Security Design
### BSU Engineering Portal — Graduation Project Textbook

---

> **Design Philosophy:** Security in the BSU Engineering Portal is not a bolt-on feature — it is a structural property woven into every layer of the architecture. From session management at the protocol level, through role-based access control at the application level, to database isolation at the infrastructure level, each design decision was made with the principle that **defense must be layered, and every layer must be independently defensible.**

---

---

# 5.1 AUTHENTICATION & SESSION MANAGEMENT

## 5.1.1 Why Session-Based Authentication — Not JWT

The first and most consequential security decision was the choice of **session-based authentication** over **JSON Web Tokens (JWT)**. This was not a default choice — it was a deliberate architectural trade-off:

| Criterion | Session-Based (Chosen) | JWT (Rejected) |
|---|---|---|
| **Server-side invalidation** | ✅ Immediate — delete the session from the server and the user is logged out regardless of any tokens they hold | ❌ Impossible without a blacklist — a compromised JWT remains valid until expiry, creating a window of vulnerability |
| **Forced password change** | ✅ Natural — destroy the session, force re-login with new credentials. The `first_login_required` flag is checked server-side on every request | ❌ Requires token revocation infrastructure (blacklist + Redis), adding operational complexity for a use case that is core to this system |
| **Password reset by admin** | ✅ Simple — reset password + destroy session. User must re-authenticate immediately | ❌ The old JWT remains valid until expiry. Unless a blacklist exists, the user retains access with the old credentials |
| **Refresh token complexity** | ✅ Not needed — sessions are self-contained server-side state | ❌ Requires access/refresh token rotation, secure refresh token storage, and handling of race conditions during rotation |
| **Implementation complexity** | ✅ Django provides battle-tested session middleware out of the box | ❌ Requires `djangorestframework-simplejwt` or similar, plus custom middleware for refresh rotation |

**The Decisive Factor:** The BSU portal has a critical workflow where administrators reset student and staff passwords to their National ID and force a password change on next login. With sessions, this is immediate and atomic. With JWT, it requires a token revocation infrastructure that adds complexity without adding capability.

### 5.1.2 Session Configuration

The session is configured for cross-origin SPA operation:

```python
# From settings.py — Session Cookie Configuration
SESSION_COOKIE_SAMESITE = 'None'   # Required for cross-origin cookie sending
SESSION_COOKIE_SECURE = True       # Required when SameSite=None (HTTPS only)
```

**Why `SameSite=None`?** In a decoupled SPA architecture, the React frontend and Django backend may run on different origins (e.g., `localhost:5173` and `localhost:8000` in development, or different subdomains in production). The browser will only include session cookies in cross-origin requests if `SameSite=None` is set. The `Secure=True` flag ensures this only works over HTTPS, preventing cookie theft over unencrypted connections.

### 5.1.3 Login Flow

The login flow implements Django's built-in `authenticate()` + `login()` sequence, with rate limiting on anonymous requests:

```python
# From users/views.py — LoginView
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]     # Rate-limited: 100/hour

    def post(self, request):
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)              # Creates server-side session
            user_data = UserSerializer(user).data
            user_data['first_login_required'] = user.first_login_required
            return Response(user_data)
        return Response({'error': 'Invalid Credentials'}, status=400)
```

**Key design detail:** The `first_login_required` flag is included in the login response. The frontend uses this to immediately redirect first-time users to the password change page — but the enforcement happens server-side, not just client-side (see Section 5.3).

### 5.1.4 Logout Flow — Server-Side Session Destruction

```python
# From users/views.py — LogoutView
class LogoutView(APIView):
    def post(self, request):
        logout(request)   # Destroys server-side session immediately
        return Response({'message': 'Logged out successfully'})
```

On the frontend, the logout flow clears both the server session and local storage:

```javascript
// From context/AuthContext.jsx — Logout with Server Invalidation
const logout = async () => {
    try {
        await api.post('/api/auth/logout/');   // Server-side session destruction
    } catch {
        // Continue logout even if backend call fails
    }
    localStorage.removeItem('user');           // Clear client-side cache
    setUser(null);
};
```

**Why both?** The server-side `logout()` destroys the session, making the session cookie useless. The client-side cleanup ensures the UI state is consistent. This dual approach handles edge cases where the backend is temporarily unreachable — the user still gets logged out of the frontend, and their session will naturally expire server-side.

---

---

# 5.2 ROLE-BASED AUTHORIZATION (RBAC)

## 5.2.1 The Role Model

The system implements a **five-role authorization model** with role inheritance for administrative access. The roles are defined as choices on the custom `User` model:

```python
# From users/models.py — Role Definitions
class Role(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    STUDENT = 'STUDENT', 'Student'
    DOCTOR = 'DOCTOR', 'Doctor'
    STUDENT_AFFAIRS = 'STUDENT_AFFAIRS', 'Student Affairs'
    STAFF_AFFAIRS = 'STAFF_AFFAIRS', 'Staff Affairs'
```

## 5.2.2 Permission Classes — The Enforcement Layer

Authorization is enforced through **seven custom DRF permission classes**, each implementing a single, clear rule:

```python
# From users/permissions.py — Permission Class Architecture

class IsAdminRole(BasePermission):
    # Exact match: only ADMIN
    return request.user.role == 'ADMIN'

class IsDoctorRole(BasePermission):
    # DOCTOR or ADMIN (admin inherits doctor capabilities)
    return request.user.role in ['DOCTOR', 'ADMIN']

class IsStudentRole(BasePermission):
    # Exact match: only STUDENT
    return request.user.role == 'STUDENT'

class IsStudentAffairsRole(BasePermission):
    # STUDENT_AFFAIRS or ADMIN
    return request.user.role in ['STUDENT_AFFAIRS', 'ADMIN']

class IsStaffAffairsRole(BasePermission):
    # STAFF_AFFAIRS or ADMIN
    return request.user.role in ['STAFF_AFFAIRS', 'ADMIN']

class IsAdminOrStudentAffairs(BasePermission):
    # Composite: ADMIN or STUDENT_AFFAIRS
    return request.user.role in ['ADMIN', 'STUDENT_AFFAIRS']

class IsAdminOrStaffAffairs(BasePermission):
    # Composite: ADMIN or STAFF_AFFAIRS
    return request.user.role in ['ADMIN', 'STAFF_AFFAIRS']
```

**Design Decision — Admin Inheritance:** The Admin role inherits access to Doctor, Student Affairs, and Staff Affairs views. This is implemented per-permission-class rather than through a hierarchy system, making each permission rule explicit, readable, and independently testable.

## 5.2.3 RBAC Permission Matrix

*Table 5.1: Role-Based Permission Matrix — Operations vs. Roles*

| Operation | Admin | Doctor | Student | Student Affairs | Staff Affairs |
|---|---|---|---|---|---|
| **User Management** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Academic Year CRUD** | ✅ Create/Close | ❌ | ❌ | ❌ | ❌ |
| **Grading Template CRUD** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Department CRUD** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Upload Students (Excel)** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Upload Doctors (Excel)** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Assign Doctor to Course** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Record Attendance** | ✅ | ✅ Own courses | ❌ | ❌ | ❌ |
| **Enter Grades** | ✅ | ✅ Own courses | ❌ | ❌ | ❌ |
| **Upload Exam Grades** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Approve Exam Grades** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create Quizzes** | ✅ | ✅ Own courses | ❌ | ❌ | ❌ |
| **Take Quizzes** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **View Own Grades** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **View Own Attendance** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Upload Lectures** | ✅ | ✅ Own courses | ❌ | ❌ | ❌ |
| **Download Lectures** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Manage News** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Send Announcements** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Approve Deletion Requests** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Reset User Passwords** | ✅ | ❌ | ❌ | ✅ Students only | ❌ |
| **Manage Certificates** | ✅ | ❌ | ❌ | ✅ | ❌ |

## 5.2.4 Frontend Route Protection

Authorization is enforced at **two independent layers** — the backend API and the frontend routing:

```jsx
// From components/ProtectedRoute.jsx — Client-Side Route Guard
const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    // Force password change on first login
    if (user.first_login_required && location.pathname !== '/change-password')
        return <Navigate to="/change-password" replace />;

    // Role enforcement
    if (roles && !roles.includes(user.role))
        return <Navigate to="/" replace />;

    return children;
};
```

**Critical Design Principle:** Frontend route protection is a **UX convenience**, not a security measure. A determined user can bypass any client-side guard. The real security enforcement is the backend permission classes — if a student bypasses the frontend guard and calls `/api/academic/course-offerings/1/bulk-attendance/`, the `IsDoctorRole` permission class will reject the request with a `403 Forbidden` regardless of what the frontend allows.

---

---

# 5.3 PASSWORD SECURITY

## 5.3.1 Password Hashing

Django uses **PBKDF2-SHA256** with a **720,000-iteration** key derivation function by default (as of Django 6.0). Passwords are never stored in plaintext:

```python
# Django's default: PBKDF2 with SHA256, 720,000 iterations
# user.set_password('plaintext') → stores hashed version
# user.check_password('plaintext') → compares against hash
```

Each password is salted with a unique, randomly generated salt, making rainbow table attacks computationally infeasible.

## 5.3.2 Password Validation Pipeline

Django's four built-in validators are active, providing defense-in-depth against weak passwords:

```python
# From settings.py — Password Validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': '...UserAttributeSimilarityValidator'},  # Rejects passwords similar to username
    {'NAME': '...MinimumLengthValidator'},             # Minimum 8 characters (Django default)
    {'NAME': '...CommonPasswordValidator'},            # Rejects 20,000 common passwords
    {'NAME': '...NumericPasswordValidator'},           # Rejects all-numeric passwords
]
```

## 5.3.3 First-Login Password Enforcement — The National ID Pattern

New users are created with their **National ID as the initial password**. This is a deliberate institutional choice — the National ID is known to both the institution and the individual, serving as a shared secret for initial authentication. However, it is not a secure long-term password, so the system enforces an immediate change:

**Backend — Password Initialization:**

```python
# From users/models.py — Auto-set password to National ID
def save(self, *args, **kwargs):
    if is_new and not self.is_superuser:
        if not self.password or self.password == '!':
            self.set_password(self.national_id or self.username)
        if self.role in ['STUDENT', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS', 'DOCTOR']:
            self.first_login_required = True
```

**Backend — Password Change Enforcement:**

```python
# From users/views.py — ChangePasswordView (critical validations)
if not user.check_password(current_password):
    return Response({'error': 'Current password is incorrect'}, status=400)

if user.national_id and new_password == user.national_id:
    return Response({'error': 'New password cannot be the same as your National ID'}, status=400)

if len(new_password) < 6:
    return Response({'error': 'Password must be at least 6 characters'}, status=400)

user.set_password(new_password)
user.first_login_required = False    # Clear the first-login flag
user.save()
login(request, user)                 # Re-authenticate with new credentials
```

**Key validations:**
1. Current password must be verified (prevents unauthorized changes).
2. New password cannot equal the National ID (prevents no-op changes).
3. Minimum 6-character length requirement.
4. After successful change, `first_login_required` is set to `False`.
5. The user is immediately re-authenticated to maintain their session.

## 5.3.4 Admin Password Reset

Administrators can reset any user's password back to their National ID:

```python
# From users/views.py — Admin Password Reset
@action(detail=True, methods=['post'], url_path='reset-password')
def reset_password(self, request, pk=None):
    user = self.get_object()
    user.set_password(user.national_id)
    user.first_login_required = True      # Force password change on next login
    user.save()
```

This creates a complete **password lifecycle:** National ID → first login → forced change → secure password → admin reset (if needed) → back to National ID → forced change again.

---

---

# 5.4 CSRF & XSS PROTECTION

## 5.4.1 The CSRF Challenge in Cross-Origin SPA Architecture

Cross-Site Request Forgery (CSRF) protection in a traditional Django application works through a **double-submit cookie pattern**: Django sets a `csrftoken` cookie, and the form includes a hidden field with the same value. The server verifies both match.

In a **cross-origin SPA architecture** (React on `localhost:5173`, Django on `localhost:8000`), this pattern breaks because:

1. The browser may not include the CSRF cookie in cross-origin requests.
2. The React SPA cannot read cookies from a different origin to extract the token.
3. The `SameSite=None` cookie setting required for session cookies does not guarantee CSRF cookie behavior.

### The Solution: CsrfExemptSessionAuthentication

```python
# From users/authentication.py — CSRF Exemption with Security Rationale
class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SECURITY RATIONALE:
    This project uses a cross-origin SPA architecture. The session cookies
    are configured with SameSite=None and Secure=True.

    In this setup, Django's default CSRF double-submit cookie pattern does
    not work reliably. The session itself serves as the authentication
    mechanism, and CORS policy restricts which origins can make credentialed
    requests.

    If frontend and backend are consolidated to the same origin, this class
    should be replaced with default SessionAuthentication to re-enable CSRF.
    """
    def enforce_csrf(self, request):
        return   # CSRF check bypassed — CORS provides origin validation
```

### 5.4.2 Compensating Controls — Why This Is Not Insecure

CSRF exemption is not the same as having no protection. The following compensating controls ensure that cross-origin attacks are prevented:

| Control | How It Works | What It Prevents |
|---|---|---|
| **CORS Origin Whitelist** | Only specific origins can make credentialed requests: `CORS_ALLOWED_ORIGINS = [list of trusted origins]` | Prevents any unauthorized domain from making API calls |
| **CORS Credentials** | `CORS_ALLOW_CREDENTIALS = True` combined with an explicit origin list (not `*`) | Browser enforces that only whitelisted origins receive cookies |
| **Session Cookie Secure** | `SESSION_COOKIE_SECURE = True` | Cookie only transmitted over HTTPS — prevents interception |
| **SameSite=None + Secure** | Both session and CSRF cookies require HTTPS when SameSite=None | Prevents cookie sending over unencrypted connections |
| **Authenticated Endpoints** | Default DRF permission: `IsAuthenticated` — all endpoints require a valid session | No anonymous mutations possible |

**Risk Assessment:** In a same-origin deployment (React served by the same Nginx that proxies Django), CSRF re-enablement is trivial — replace `CsrfExemptSessionAuthentication` with the default `SessionAuthentication`. The system is architecturally prepared for this transition.

### 5.4.3 XSS Prevention

Cross-Site Scripting (XSS) is prevented at multiple layers:

1. **React's built-in escaping:** React automatically escapes all values embedded in JSX, preventing injection of malicious scripts.
2. **Nginx security headers:**

```nginx
# From nginx.conf — Security Headers
add_header X-Content-Type-Options "nosniff" always;       # Prevents MIME-type sniffing
add_header X-Frame-Options "SAMEORIGIN" always;           # Prevents clickjacking
add_header X-XSS-Protection "1; mode=block" always;       # Browser XSS filter
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

3. **Django's template escaping:** Although the primary interface is React, Django Admin uses Django templates which auto-escape HTML by default.
4. **Input validation:** DRF serializers validate all incoming data types, rejecting malformed input before it reaches the database.

---

---

# 5.5 RATE LIMITING & INPUT VALIDATION

## 5.5.1 API Rate Limiting (Throttling)

The system implements **two-tier rate limiting** to protect against brute-force attacks and API abuse:

```python
# From settings.py — DRF Throttle Configuration
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',      # Unauthenticated users: 100 requests/hour
        'user': '1000/hour',     # Authenticated users: 1000 requests/hour
    },
}
```

*Table 5.2: Rate Limiting Thresholds*

| User Type | Limit | Rationale |
|---|---|---|
| **Anonymous** | 100 requests/hour | Protects the login endpoint against brute-force attacks. 100 requests is sufficient for normal browsing of public pages but makes credential stuffing impractical. |
| **Authenticated** | 1000 requests/hour | Allows normal dashboard operation (loading courses, grades, attendance records) but prevents automated scraping or abuse of data export endpoints. |

**Why per-hour, not per-minute?** A per-minute limit would interfere with legitimate bulk operations (e.g., a Student Affairs user uploading 500 students via Excel, then verifying the results). The hourly window provides protection against sustained attacks while accommodating burst usage patterns.

## 5.5.2 Login-Specific Throttling

The login endpoint receives an additional layer of throttle protection:

```python
# From users/views.py — Login with Anonymous Rate Throttle
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]     # 100 attempts/hour max
```

This limits brute-force login attacks to 100 attempts per hour per IP address — far too slow for practical credential guessing against the National ID + password combination space.

## 5.5.3 Input Validation

Input validation is enforced at three layers:

**Layer 1: DRF Serializer Validation**

All API input passes through DRF serializers, which enforce type constraints, field requirements, and custom validators:

- `CharField(max_length=200)` prevents buffer-overflow-style attacks.
- `IntegerField()` rejects non-numeric input.
- `FileField()` with backend validation prevents arbitrary file uploads.

**Layer 2: Model-Level Constraints**

```python
# From academic/models.py — Database-Level Constraints (examples)
class Meta:
    unique_together = ['student', 'course_offering']      # Prevents duplicate attendance
    unique_together = ['code', 'level', 'semester']        # Prevents duplicate subject codes
```

These constraints are enforced by the database engine itself, providing a final safety net even if serializer validation is bypassed.

**Layer 3: Business Logic Validation**

Beyond type and format validation, the system enforces business rules:

- **Doctors can only manage their own courses** — `CourseOffering.objects.filter(doctor=request.user)`.
- **Grades cannot be entered for closed academic years** — checked before any grade mutation.
- **Deletion of sensitive entities requires admin approval** — implemented through `DeleteRequest` and `DoctorDeletionRequest` models.
- **Exam grades require explicit approval** — `ExamGrade.is_approved` must be set by an admin before students can see the grades.

---

---

# 5.6 INFRASTRUCTURE-LEVEL SECURITY

## 5.6.1 Database Isolation

The MySQL container is **not exposed** to the host network. It has no port mapping in `docker-compose-im.yml`:

```yaml
# From docker-compose-im.yml — Database Service (NO ports exposed)
db:
    image: mysql:8.0
    # NOTE: No 'ports' section — database is only accessible
    # via the Docker internal network (bsu_network)
    volumes:
        - db_data:/var/lib/mysql
    networks:
        - bsu_network
```

Even if an attacker gains access to the host machine, they cannot connect to MySQL directly. They would need to either:
1. Enter the running Docker container (requires Docker socket access).
2. Read the persistent volume directly (requires root filesystem access).

## 5.6.2 Secret Management

Sensitive configuration values are externalized through environment variables, never hardcoded:

- `SECRET_KEY` — Django's cryptographic signing key.
- `DB_PASSWORD` — MySQL credentials.
- `CORS_ALLOWED_ORIGINS` — Trusted frontend origins.
- `CSRF_TRUSTED_ORIGINS` — Trusted CSRF origins.

In production, these are loaded from `.env.production` which is **not committed to version control** (listed in `.gitignore`).

## 5.6.3 Nginx as Security Gateway

Nginx serves as a **security gateway**, not just a reverse proxy:

- **Request size limiting:** `client_max_body_size 50M` prevents denial-of-service via oversized uploads.
- **Timeout enforcement:** `proxy_read_timeout 300s` prevents slow-loris style connection exhaustion attacks.
- **Static file isolation:** Media files are served directly by Nginx (`try_files $uri $uri/ =404`), bypassing the Django application entirely. Directory listing is disabled.
- **Security headers** (detailed in Section 5.4.3) are injected on every response.

## 5.6.4 CI/CD Security Scanning (Trivy)

Every Docker image pushed to production is automatically scanned for known vulnerabilities:

```yaml
# From .github/workflows/build_backend_image.yml — Trivy Scan
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
      image-ref: '${{ vars.DOCKERHUB_USERNAME }}/bsu_backend:${{ steps.meta.outputs.version }}'
      format: 'table'
      exit-code: '1'            # Fail the pipeline if vulnerabilities found
      vuln-type: 'os,library'
      severity: 'CRITICAL,HIGH' # Only block on critical and high severity
```

**Key design detail:** The `exit-code: '1'` setting means the CI/CD pipeline **fails** if critical or high-severity vulnerabilities are detected. This prevents deployment of known-vulnerable images and creates a security gate in the release process.

---

---

# 5.7 AUDIT TRAIL

## 5.7.1 The AuditLog Model

Every significant administrative action is recorded in the `AuditLog` table:

```python
# From academic/models.py — AuditLog Model
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('STUDENT_CREATED', 'Student Created'),
        ('STUDENT_UPDATED', 'Student Updated'),
        ('STUDENT_DELETED', 'Student Deleted'),
        ('GRADE_UPDATED', 'Grade Updated'),
        ('GRADE_APPROVED', 'Grade Approved'),
        ('ATTENDANCE_RECORDED', 'Attendance Recorded'),
        ('COURSE_ASSIGNED', 'Course Assigned'),
        ('NEWS_CREATED', 'News Created'),
        # ... 15 total action types
    ]
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    entity_type = models.CharField(max_length=50)
    entity_id = models.IntegerField(null=True)
    details = models.JSONField(default=dict)       # Stores action-specific context
    timestamp = models.DateTimeField(auto_now_add=True)
```

## 5.7.2 What Gets Logged

The audit trail covers **15 distinct action types** across all critical operations:

| Action Category | Logged Events |
|---|---|
| **Student Data** | Created, Updated, Deleted (via bulk upload or manual) |
| **Grades** | Updated, Approved (including who approved and the grade values) |
| **Attendance** | Recorded (including session date and PRESENT/ABSENT/EXCUSED counts) |
| **Course Assignment** | Doctor assigned to course offering |
| **News** | Created (including target audience and title) |
| **Deletion Requests** | Approved, Rejected (including the entity type and reason) |
| **User Management** | Password resets, role changes |

## 5.7.3 Why JSONField for Details

The `details` field uses Django's `JSONField` rather than a fixed schema. This allows each action type to store its own relevant context without requiring schema migrations:

```python
# Example: News creation audit
AuditLog.objects.create(
    action='NEWS_CREATED',
    performed_by=request.user,
    entity_type='News',
    entity_id=news.id,
    details={'title': news.title, 'target_audience': news.target_audience}
)
```

This design ensures the audit trail is **extensible** — new action types with new context fields can be added without database schema changes.

---

---

# 5.8 SECURITY ARCHITECTURE SUMMARY

The following diagram summarizes the security layers from the client to the database:

```
CLIENT BROWSER
    │
    ├─── [Layer 1] HTTPS Transport (Secure=True cookies)
    │
    ├─── [Layer 2] CORS Origin Whitelist (only trusted origins)
    │
NGINX REVERSE PROXY
    │
    ├─── [Layer 3] Security Headers (XSS, Clickjacking, MIME)
    ├─── [Layer 4] Request Size Limiting (50MB max)
    ├─── [Layer 5] Timeout Enforcement (300s max)
    │
DJANGO / DRF
    │
    ├─── [Layer 6] Session Authentication (server-side state)
    ├─── [Layer 7] RBAC Permission Classes (7 classes, 5 roles)
    ├─── [Layer 8] Rate Limiting (100/hr anon, 1000/hr auth)
    ├─── [Layer 9] Input Validation (serializer + model + business logic)
    ├─── [Layer 10] Audit Logging (15 action types, JSONField details)
    │
MYSQL 8.0
    │
    ├─── [Layer 11] Database Isolation (no port mapping, internal network only)
    ├─── [Layer 12] Password Hashing (PBKDF2-SHA256, 720K iterations)
    ├─── [Layer 13] Referential Integrity (unique_together, FK constraints)
    │
CI/CD PIPELINE
    │
    └─── [Layer 14] Trivy Vulnerability Scanning (CRITICAL + HIGH, pipeline-blocking)
```

*Figure 5.2: Defense-in-Depth — 14 Security Layers from Client to Database*

> **Design Conclusion:** No single layer provides complete protection. Each layer is designed to be **independently defensible** — if any one layer is compromised, the remaining layers continue to provide meaningful security. This is the principle of **defense in depth**, and it is the foundation of the BSU Engineering Portal's security architecture.

---

*End of Section 5*
