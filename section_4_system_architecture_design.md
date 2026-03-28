# Chapter 4 — System & Architecture Design

---

## 4.1 Architecture Overview

### 4.1.1 High-Level Architecture

The BSU Engineering Portal follows a **four-tier architecture** pattern, separating concerns into distinct, independently deployable layers:

1. **Presentation Tier** — A React-based Single Page Application (SPA) served as static files from an Nginx container.
2. **API Tier** — A Django REST Framework (DRF) backend, running inside a Gunicorn WSGI server, exposing a stateless RESTful API.
3. **Data Tier** — A MySQL 8.0 relational database, running in its own Docker container with a persistent volume.
4. **Reverse Proxy Tier** — An Nginx server acting as the single entry point, routing `/api/*` requests to the backend and serving the SPA for all other paths.

> **[INSERT Figure 4.1 — Four-Tier Architecture Diagram showing: Browser ↔ Nginx (port 80) ↔ {React SPA (static files), Django/Gunicorn (port 8000)} ↔ MySQL (port 3306, internal only). Include Docker network boundary.]**

### 4.1.2 Why This Architecture?

**Why not a monolith (Django templates)?**
A traditional Django monolith renders HTML server-side. While simpler to deploy, it fundamentally limits the user experience. The BSU Engineering Portal requires:
- Real-time form validation during 500+ row Excel uploads with row-level error highlighting.
- Role-specific dashboards with tab-based navigation, modal dialogs, and dynamic table filtering — all without full-page reloads.
- RTL layout support with dark/light theme switching — capabilities that require a mature client-side framework.

A monolith would have forced us to write custom JavaScript for each of these interactions anyway, resulting in a "worst of both worlds" hybrid. By choosing a clean SPA + API split, we gained full control over the frontend experience while keeping the backend purely concerned with data and business logic.

**Why REST over GraphQL?**
The system's data access patterns are **predictable and role-bounded**. Each dashboard fetches a well-defined set of resources (students, grades, courses). GraphQL's flexibility — allowing clients to compose arbitrary queries — is overkill for this domain and introduces complexity in permission enforcement. With REST, each endpoint has a single permission class, making security auditable.

**Why MySQL over PostgreSQL?**
The faculty's existing infrastructure includes MySQL instances. Using MySQL reduces operational friction for the IT department, which is already familiar with its backup, replication, and monitoring tooling. Django's ORM abstracts 95% of database interactions, making database choice a deployment concern rather than a development one.

### 4.1.3 Technology Stack Summary

| Layer | Technology | Version | Justification |
|---|---|---|---|
| Frontend Framework | React | 18.x | Component-based UI, massive ecosystem, MUI support |
| Build Tool | Vite | 5.x | Near-instant HMR, ES module bundling, 10× faster than CRA |
| UI Component Library | Material UI (MUI) | 5.x | RTL-ready, Cairo font integration, dark mode theming |
| HTTP Client | Axios | 1.x | Interceptors for CSRF injection and 401 redirect |
| Backend Framework | Django + DRF | 6.0 / 3.15 | Mature ORM, built-in auth, session management, admin panel |
| WSGI Server | Gunicorn | 21.x | Production-grade, multi-worker, graceful restart |
| Database | MySQL | 8.0 | Faculty standard, ACID compliance, Docker-ready |
| Reverse Proxy | Nginx | Alpine | Static file serving, API proxying, security headers |
| Containerization | Docker + Compose | 24.x | Single-command deployment, environment parity |
| Data Processing | pandas + openpyxl | 2.x / 3.x | Excel/CSV parsing for batch uploads |

*Table 4.1 — Technology Stack with Version and Justification*

### 4.1.4 Deployment Topology

The production deployment uses Docker Compose to orchestrate three services on a single host:

```yaml
services:
  db:
    image: mysql:8.0
    restart: unless-stopped
    # DB port NOT exposed to host — only accessible within Docker network
    networks:
      - bsu_network

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    networks:
      - bsu_network

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - bsu_network
```

**Key design decisions in the topology:**

- **Database isolation**: The MySQL container does not publish its port (`3306`) to the host. It is accessible *only* from within the `bsu_network` Docker bridge. This eliminates an entire class of external attack vectors.
- **Restart policy**: All three services use `restart: unless-stopped`, meaning Docker will automatically restart any crashed container without human intervention.
- **Volume separation**: Database data (`db_data`) and uploaded media files (`media_data`) are stored in named Docker volumes, surviving container rebuilds.

> **[INSERT Figure 4.2 — Docker Compose Container Topology showing three containers (db, backend, frontend) on bsu_network with port mappings and volume mounts]**

---

## 4.2 System Modeling (UML)

### 4.2.1 Sequence Diagram: Authentication Flow

The login flow involves a three-step handshake between the browser, the React SPA, and the Django backend. This flow is more complex than a simple username/password check because of the **CSRF protection** requirement.

> **[INSERT Figure 4.3 — Sequence Diagram: Login & CSRF Handshake. Actors: Browser, React SPA, Nginx, Django Backend. Steps: (1) GET /api/auth/csrf/ → set csrftoken cookie, (2) POST /api/auth/login/ with X-CSRFToken header → validate credentials → return user data + session cookie, (3) Store user in localStorage, (4) On each subsequent request: Axios interceptor reads csrftoken cookie and attaches X-CSRFToken header]**

The CSRF token is injected into every request by a global Axios interceptor configured in `main.jsx`:

```javascript
axios.interceptors.request.use(config => {
    const token = getCookie('csrftoken');
    if (token) {
        config.headers['X-CSRFToken'] = token;
    }
    return config;
});
```

After successful login, the frontend stores the user object (including `role` and `first_login_required`) in `localStorage` and in React's `AuthContext`. On subsequent page loads, the `AuthProvider` validates the stored session by calling `GET /api/auth/profile/` — ensuring that an expired server-side session is detected and the user is redirected to `/login`.

### 4.2.2 Activity Diagram: Batch Student Upload

The batch student upload is the system's most data-intensive operation, processing hundreds of rows from an Excel file within a single HTTP request. The activity diagram below traces the flow from file selection to database persistence.

> **[INSERT Figure 4.4 — Activity Diagram: Batch Student Upload. Swimlanes: Student Affairs User, React Frontend, Django Backend, MySQL. Steps: Select Department + Year + Level → Choose Excel file → Click "Preview" → API parses first 5 rows → Validate columns + department match + level match → Display preview with errors → Click "Upload" → API reads full file → For each row: check existence → create User + Student or update existing → Log to AuditLog + UploadHistory → Return {created, updated, errors}]**

The backend processes each row inside a `transaction.atomic()` block. This is a deliberate design choice: if a single row in a batch fails (e.g., duplicate national ID), the error is caught and added to the error list *without* rolling back other successful rows. Each row is its own transaction:

```python
for index, row in df.iterrows():
    try:
        with transaction.atomic():
            # Create or update student ...
            created_count += 1
    except Exception as e:
        errors.append(f"Row {index + 2}: {str(e)}")
```

This per-row atomicity is in contrast to wrapping the entire batch in one transaction — which would cause a single bad row to discard all other valid records.

### 4.2.3 State Machine: Quiz Lifecycle

A quiz attempt transitions through four states: `IN_PROGRESS → SUBMITTED → GRADED` (for essays) or `IN_PROGRESS → GRADED` (for MCQ-only quizzes with auto-grading). An additional `TIMEOUT` state exists for time-limited quizzes.

> **[INSERT Figure 4.5 — State Machine Diagram: Quiz Attempt Lifecycle. States: IN_PROGRESS, SUBMITTED, TIMEOUT, GRADED. Transitions: Student starts attempt → IN_PROGRESS; Student submits MCQ quiz → GRADED (auto); Student submits mixed/essay quiz → SUBMITTED; Timer expires → TIMEOUT; Doctor grades essay → GRADED]**

```python
class StudentQuizAttempt(models.Model):
    class AttemptStatus(models.TextChoices):
        IN_PROGRESS = 'IN_PROGRESS', 'جاري الحل'
        SUBMITTED   = 'SUBMITTED', 'تم التسليم'
        TIMEOUT     = 'TIMEOUT', 'انتهى الوقت'
        GRADED      = 'GRADED', 'تم التصحيح'
```

---

## 4.3 Database Design

### 4.3.1 Entity-Relationship Overview

The database consists of **20 tables** organized into four functional domains:

1. **Identity & Access** — `users_user` (custom Django user with 5-role RBAC)
2. **Academic Structure** — `Department`, `Specialization`, `AcademicYear`, `Term`, `Level`, `Subject`
3. **Academic Operations** — `Student`, `CourseOffering`, `Lecture`, `LectureSchedule`, `Attendance`, `StudentGrade`, `ExamGrade`, `Certificate`, `GradingTemplate`
4. **Assessment** — `Quiz`, `QuizQuestion`, `QuizChoice`, `StudentQuizAttempt`, `StudentQuizAnswer`
5. **System & Communication** — `AuditLog`, `ContactMessage`, `Announcement`, `UploadHistory`, `DoctorDeletionRequest`, `News`, `DeleteRequest`

> **[INSERT Figure 4.6 — Full Entity-Relationship Diagram (ERD) showing all 20+ tables with primary keys, foreign keys, and cardinalities. Group by functional domain with color coding.]**

### 4.3.2 Core Entities & Relationships

#### The CourseOffering Pivot

`CourseOffering` is the **central junction entity** of the system. It connects a `Subject` to its `Doctor`, `Level`, `Term`, and `AcademicYear` for a specific semester. Nearly every operational entity — `Lecture`, `Attendance`, `StudentGrade`, `Quiz` — references `CourseOffering` as its parent.

```python
class CourseOffering(models.Model):
    subject       = models.ForeignKey(Subject, ...)
    academic_year = models.ForeignKey(AcademicYear, ...)
    term          = models.ForeignKey(Term, ...)
    level         = models.ForeignKey(Level, ...)
    doctor        = models.ForeignKey(User, limit_choices_to={'role': 'DOCTOR'})
    grading_template = models.ForeignKey(GradingTemplate, null=True, ...)

    class Meta:
        unique_together = ('subject', 'academic_year', 'term', 'level')
```

This design ensures that the same subject can be taught by different doctors in different terms, at different levels, without data collision. The `unique_together` constraint prevents duplicate assignments.

#### Student–User Dual Entity

Students exist as both a `User` instance (for authentication) and a `Student` instance (for academic data). This `OneToOneField` relationship was chosen over embedding academic fields into the User model for two reasons:

1. **Separation of concerns**: Authentication data (password hash, role, session) belongs to the User model. Academic data (level, department, grades) belongs to the Student model.
2. **Lifecycle independence**: A Student record can be deleted (e.g., graduated) without destroying the User account — and vice versa.

```python
class Student(models.Model):
    national_id = models.CharField(max_length=14, unique=True)
    full_name   = models.CharField(max_length=200)
    user        = models.OneToOneField(User, on_delete=models.CASCADE,
                                       related_name='student_profile')
    level       = models.ForeignKey(Level, ...)
    department  = models.ForeignKey(Department, ...)
```

### 4.3.3 Assessment Schema (Quiz Engine)

The quiz subsystem follows a **nested composition** pattern:

```
Quiz ──┬──> QuizQuestion ──┬──> QuizChoice
       │                   └──> StudentQuizAnswer
       └──> StudentQuizAttempt ──> StudentQuizAnswer
```

| Table | Key Columns | Constraint |
|---|---|---|
| `Quiz` | `id`, `course_offering_id`, `quiz_type`, `total_points`, `is_active` | FK to CourseOffering |
| `QuizQuestion` | `id`, `quiz_id`, `question_type` (MCQ/ESSAY), `points`, `order` | FK to Quiz |
| `QuizChoice` | `id`, `question_id`, `choice_text`, `is_correct`, `order` | FK to QuizQuestion |
| `StudentQuizAttempt` | `id`, `student_id`, `quiz_id`, `score`, `status` | UNIQUE(student, quiz) |
| `StudentQuizAnswer` | `id`, `attempt_id`, `question_id`, `selected_choice_id`, `essay_answer` | UNIQUE(attempt, question) |

*Table 4.2 — Quiz Schema Summary*

The `UNIQUE(student, quiz)` constraint on `StudentQuizAttempt` enforces **one attempt per student per quiz** at the database level — not just at the application level.

### 4.3.4 Grading Template Design

The `GradingTemplate` model supports two grading paradigms simultaneously:

| Paradigm | Fields | Use Case |
|---|---|---|
| **New (Official)** | `coursework_weight`, `written_weight`, `practical_weight` | Matches faculty's official grading structure (اعمال فصلية / تحريري / عملي-شفوى) |
| **Legacy (Fine-grained)** | `attendance_weight`, `quizzes_weight`, `midterm_weight`, `final_weight` | Maps to the doctor's detailed grade entry form |

*Table 4.3 — Dual Grading Paradigm*

This dual approach was a pragmatic trade-off: the faculty's official grade sheets use the "New" format, but doctors entering grades need the fine-grained breakdown. The `StudentGrade.total_grade()` method aggregates across both formats:

```python
def total_grade(self):
    total = 0
    if self.coursework: total += float(self.coursework)
    if self.midterm:     total += float(self.midterm)
    if self.final:       total += float(self.final)
    total += self.attendance_grade()
    total += self.quizzes_grade()
    return total
```

### 4.3.5 Normalization & Indexing Strategy

The schema is normalized to **Third Normal Form (3NF)** with the following design rationale:

- **No transitive dependencies**: Student department is stored as a FK to `Department`, not as a text field — preventing update anomalies.
- **Composite unique constraints** enforce business rules at the database level:

| Table | Constraint | Business Rule |
|---|---|---|
| `CourseOffering` | `(subject, academic_year, term, level)` | One offering per subject per term per level |
| `Attendance` | `(student, course_offering, date)` | One attendance record per student per session |
| `StudentGrade` | `(student, course_offering)` | One grade record per student per course |
| `StudentQuizAttempt` | `(student, quiz)` | One attempt per student per quiz |
| `StudentQuizAnswer` | `(attempt, question)` | One answer per question per attempt |
| `Term` | `(name, academic_year)` | Two terms per year (First, Second) |
| `Level` | `(name, department, academic_year)` | One level instance per department per year |

*Table 4.4 — Composite Unique Constraints*

**Indexing**: Django automatically creates B-tree indexes on all primary keys and foreign keys. The `ExamGrade.is_approved` field has an explicit `db_index=True` annotation because the pending-grades query (`is_approved=False`) is a hot path in the Student Affairs workflow.

---

## 4.4 Backend Design

### 4.4.1 Django Application Structure

The backend is organized into **four Django applications**, each with a single responsibility:

```
backend/
├── bsu_backend/           # Project settings, WSGI, root URL config
│   ├── settings.py        # Database, middleware, CORS, REST config
│   ├── urls.py            # Root URL router: /api/auth/, /api/academic/, ...
│   └── health.py          # Health check endpoint for container orchestration
├── users/                 # Authentication & user management
│   ├── models.py          # Custom User model with 5-role RBAC
│   ├── permissions.py     # 7 permission classes (IsAdminRole, IsDoctorRole, ...)
│   ├── views.py           # Login, logout, CSRF, password change, user management
│   └── authentication.py  # CsrfExemptSessionAuthentication
├── academic/              # Core academic operations (largest module)
│   ├── models.py          # 20 models: Student, CourseOffering, Quiz, Attendance, ...
│   ├── views.py           # Department, Level, Subject, CourseOffering, Grade, Attendance
│   ├── student_affairs_views.py  # Batch upload, student listing, certificates
│   ├── staff_affairs_views.py    # Doctor upload, assignment, deletion requests
│   ├── quiz_views.py      # Quiz CRUD, attempt, grading
│   └── exam_grades_views.py      # Exam grade upload and approval workflow
├── content/               # CMS-like features
│   └── models.py          # News articles with target audience and status
└── system/                # System-level operations
    └── models.py          # Delete request workflow
```

> **[INSERT Figure 4.7 — Backend Module Dependency Diagram showing the four Django apps (users, academic, content, system) and their dependencies. Academic depends on Users; Content depends on Users; System depends on Users. No circular dependencies.]**

### 4.4.2 Middleware Pipeline

Every HTTP request passes through nine middleware layers in a **specific order** defined in `settings.py`. The order matters — placing `CorsMiddleware` *before* `SecurityMiddleware` ensures that CORS preflight (OPTIONS) requests are handled before Django's security checks reject them.

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # 1. CORS headers (must be first)
    'django.middleware.security.SecurityMiddleware', # 2. HTTPS redirect, HSTS
    'whitenoise.middleware.WhiteNoiseMiddleware',    # 3. Static file serving
    'django.contrib.sessions.middleware.SessionMiddleware',  # 4. Load/save sessions
    'django.middleware.common.CommonMiddleware',     # 5. URL normalization
    'django.middleware.csrf.CsrfViewMiddleware',     # 6. CSRF token validation
    'django.contrib.auth.middleware.AuthenticationMiddleware', # 7. Attach user
    'django.contrib.messages.middleware.MessageMiddleware',    # 8. Flash messages
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # 9. Clickjacking
]
```

### 4.4.3 API Namespace Hierarchy

The root URL configuration delegates to each Django app's URL module, creating a clean namespace:

| Prefix | Django App | Responsibility |
|---|---|---|
| `/api/auth/` | `users` | Login, logout, CSRF, password change, user CRUD |
| `/api/academic/` | `academic` | All academic operations (120+ endpoints) |
| `/api/content/` | `content` | News articles, CMS content |
| `/api/system/` | `system` | Delete request workflow |
| `/api/health/` | `bsu_backend` | Health check for Docker/Railway probing |

Within the `academic` namespace, endpoints are further organized by **audience**:
- `/api/academic/student-affairs/...` — Student Affairs operations
- `/api/academic/staff-affairs/...` — Staff Affairs operations
- `/api/academic/admin/...` — Admin-only operations (audit logs, deletion approvals)
- `/api/academic/student/...` — Student-facing endpoints (profile, quizzes, courses)
- `/api/academic/exam-grades/...` — Exam grade lifecycle

### 4.4.4 RBAC Enforcement at Three Levels

Authorization is enforced at **three distinct levels**, creating defense in depth:

**Level 1 — URL Routing (Nginx):**
Nginx proxies only `/api/*` requests to the backend. All other paths serve the React SPA. The Django admin panel (`/admin/`) is separately proxied with its own header rules.

**Level 2 — View Permissions (DRF):**
Every view class declares a `permission_classes` attribute. For views where read and write permissions differ, `get_permissions()` dynamically selects the appropriate class:

```python
class CourseOfferingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaffAffairsRole()]
        return [permissions.IsAuthenticated()]
```

**Level 3 — Object-Level Ownership:**
For doctor operations, the backend verifies that the requesting doctor actually *owns* the course offering being accessed:

```python
# Verify doctor owns this course OR user is admin
if not request.user.is_superuser and course_offering.doctor != request.user:
    return Response({'error': 'Not authorized'}, 
                    status=status.HTTP_403_FORBIDDEN)
```

### 4.4.5 Error Handling & Internationalization

All user-facing error messages are written in **Arabic**, matching the faculty's language. Backend errors use consistent HTTP status codes:

| Code | Meaning | Example |
|---|---|---|
| `400` | Validation failure | `"الرقم القومي غير صالح"` (Invalid national ID) |
| `401` | Session expired | Intercepted by Axios → redirect to `/login` |
| `403` | Role not authorized | `"ليست مخصصة لك"` (Not assigned to you) |
| `404` | Entity not found | `"الطالب غير موجود"` (Student not found) |
| `500` | Internal error | Exception traceback + Arabic wrapper |

### 4.4.6 Audit Logging

Every administrative action is recorded in the `AuditLog` table with a structured `details` JSON field. The system tracks 14 distinct action types:

```python
class AuditLog(models.Model):
    class ActionType(models.TextChoices):
        STUDENT_BATCH_UPLOAD   = "STUDENT_BATCH_UPLOAD"
        DOCTOR_BATCH_UPLOAD    = "DOCTOR_BATCH_UPLOAD"
        DOCTOR_ASSIGNMENT      = "DOCTOR_ASSIGNMENT"
        STUDENT_PASSWORD_RESET = "STUDENT_PASSWORD_RESET"
        GRADE_APPROVED         = "GRADE_APPROVED"
        GRADE_REJECTED         = "GRADE_REJECTED"
        # ... 8 more action types

    action       = models.CharField(max_length=50, choices=ActionType.choices)
    performed_by = models.ForeignKey(User, ...)
    entity_type  = models.CharField(max_length=50)
    details      = models.JSONField(null=True, blank=True)
```

The `details` field is a flexible JSON blob — different action types store different context:

| Action | Details Content |
|---|---|
| `STUDENT_BATCH_UPLOAD` | `{department, academic_year, level, created, updated, errors}` |
| `DOCTOR_ASSIGNMENT` | `{doctor_name, subject, level, term, created}` |
| `STUDENT_PASSWORD_RESET` | `{student_name, national_id}` |

*Table 4.5 — Audit Log Event Payload Examples*

---

## 4.5 Frontend & UI/UX Design

### 4.5.1 Component Architecture

The React frontend follows a **page-centric architecture** with shared layout and context providers. The component tree is:

```
<StrictMode>
  <CacheProvider value={cacheRtl}>       ← RTL style cache
    <MuiThemeProvider theme={theme}>      ← Material UI theme (Cairo font, RTL)
      <ThemeProvider>                     ← Dark/Light mode context
        <AuthProvider>                    ← Session + role state
          <ToastProvider>                 ← Notification system
            <OfflineBanner />             ← Network status indicator
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  {/* Public pages */}
                  {/* Protected dashboard pages */}
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  </CacheProvider>
</StrictMode>
```

> **[INSERT Figure 4.8 — React Component Tree showing the provider hierarchy (CacheProvider → ThemeProvider → AuthProvider → ToastProvider → BrowserRouter → Layout → Pages) and the five dashboard branches (Student, Doctor, Student Affairs, Staff Affairs, Admin)]**

### 4.5.2 State Management

The application uses **React Context API** — not Redux — for state management. This decision was deliberate: the application's state is **session-scoped** (user data + UI theme) rather than complex and interconnected. Redux would add unnecessary boilerplate for this use case.

Three context providers manage distinct state domains:

| Context | State | Persistence | Purpose |
|---|---|---|---|
| `AuthContext` | `user`, `loading` | `localStorage` + server validation | Active session, role, first_login flag |
| `ThemeContext` | `mode` (light/dark) | `localStorage` | UI theme preference |
| `ToastProvider` | Toast queue | In-memory | Ephemeral success/error notifications |

*Table 4.6 — Context Providers and State Domains*

The `AuthProvider` is the most critical. It performs **session revalidation** on every page load:

```javascript
useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        api.get('/api/auth/profile/')
            .then(res => {
                setUser(res.data);  // Session valid — refresh data
            })
            .catch(() => {
                localStorage.removeItem('user');  // Session expired
                setUser(null);
            })
            .finally(() => setLoading(false));
    }
}, []);
```

The `{!loading && children}` guard in the provider prevents flash-of-unauthenticated-content by not rendering any child component until the session check completes.

### 4.5.3 Route Protection

Dashboard routes are guarded by a `ProtectedRoute` component that enforces three checks in sequence:

1. **Authentication**: Is the user logged in? If not → redirect to `/login`.
2. **First-login password change**: Is `first_login_required` set? If yes → redirect to `/change-password`.
3. **Role authorization**: Does the user's role match the allowed roles for this route? If not → redirect to `/`.

```jsx
const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();

    if (!user)
        return <Navigate to="/login" replace />;

    if (user.first_login_required)
        return <Navigate to="/change-password" replace />;

    if (roles && !roles.includes(user.role))
        return <Navigate to="/" replace />;

    return children;
};
```

Each dashboard route declares its required role:

```jsx
<Route path="student/dashboard" 
       element={<ProtectedRoute roles={['STUDENT']}>
                    <StudentDashboard />
                </ProtectedRoute>} />
```

The system defines **57 routes** in total: 11 public routes, 8 student routes, 8 doctor routes, 10 student affairs routes, 9 staff affairs routes, and 11 admin routes.

> **[INSERT Figure 4.9 — Route Map showing all 57 routes organized by role group with their corresponding React components]**

### 4.5.4 API Communication Layer

All backend communication flows through a centralized Axios instance configured in `utils/api.js`:

```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

**Design decisions:**
- `withCredentials: true` ensures the browser sends session cookies with every request — required for session-based authentication across origins.
- `baseURL` is empty in development (requests go to the Vite dev server's proxy) and set via `VITE_API_URL` in production.
- The **401 interceptor** acts as a safety net: if the session expires mid-use, the user is redirected to login rather than seeing cryptic errors.

### 4.5.5 RTL-First Design

The entire UI is built **RTL-first** — Arabic is the primary language, not a translation. Three layers ensure correct RTL rendering:

1. **Stylis RTL Plugin** (`stylis-plugin-rtl`): Automatically mirrors all CSS properties (e.g., `margin-left` → `margin-right`) for MUI components:

```javascript
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});
```

2. **MUI Theme Direction**: The global theme sets `direction: 'rtl'`, which MUI uses for layout calculations.

3. **Cairo Font**: Google's "Cairo" font is used throughout — designed specifically for Arabic script with excellent Latin character support.

### 4.5.6 Dark Mode & Theming

The `ThemeProvider` offers a toggle between light and dark modes. Both modes use a curated color palette — not MUI's default — to match the university's brand identity:

```javascript
const theme = createTheme({
    direction: 'rtl',
    palette: {
        mode,
        ...(mode === 'dark' ? {
            background: { default: '#0a1929', paper: '#132f4c' },
            primary:    { main: '#5090d3' },
        } : {
            background: { default: '#f5f7fa', paper: '#ffffff' },
            primary:    { main: '#1976d2' },
        }),
    },
    typography: {
        fontFamily: '"Cairo", "Roboto", "Helvetica", sans-serif',
    },
    shape: { borderRadius: 12 },
});
```

The theme preference persists in `localStorage`, so returning users see their preferred mode without a flash.

> **[INSERT Figure 4.10 — Side-by-side comparison of the Student Dashboard in Light Mode and Dark Mode, showing the Cairo font, RTL layout, and navy/gold color palette]**

### 4.5.7 Reverse Proxy Configuration (Nginx)

The Nginx configuration serves as the unified entry point, implementing four routing rules:

```nginx
server {
    listen 80;
    client_max_body_size 50M;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA — serve index.html for all non-API routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API — reverse proxy to Django/Gunicorn
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
    }

    # Media files — served directly with 30-day cache
    location /media/ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

**Key decisions:**
- `client_max_body_size 50M` allows the upload of large Excel files and lecture videos.
- `try_files $uri $uri/ /index.html` enables **client-side routing**: any URL like `/student/grades` serves `index.html`, letting React Router handle the path.
- `proxy_read_timeout 300s` accommodates long-running batch operations (500+ row uploads).
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) are applied globally.
- Media files are served with a 30-day cache header and directory listing is **disabled** for security.

### 4.5.8 Build & Startup Pipeline

The frontend and backend use **multi-stage Docker builds** to minimize image size:

**Frontend (Nginx image):**
1. **Stage 1 (Builder)**: `node:20-alpine` — install deps, run `npm run build` → produces `/dist`.
2. **Stage 2 (Runtime)**: `nginx:alpine` — copies only the built static files and the custom `nginx.conf`. Final image contains no Node.js, no `node_modules`.

**Backend (Python image):**
1. **Stage 1 (Builder)**: `python:3.11-slim` — installs MySQL client libs, runs `pip install`.
2. **Stage 2 (Runtime)**: `python:3.11-slim` — copies installed packages, cleans `__pycache__`, runs `entrypoint.sh`.

The `entrypoint.sh` script automates startup:

```bash
# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Create admin user if not exists
python manage.py shell -c "..."

# Seed production data (departments, subjects)
python seed_production.py
python seed_subjects.py

# Start Gunicorn (2 workers, 120s timeout)
exec gunicorn bsu_backend.wsgi:application \
    --bind 0.0.0.0:8000 --workers 2 --timeout 120
```

---

## Summary

This chapter has presented the complete system architecture of the BSU Engineering Portal — from the four-tier deployment topology to the database schema, the backend's modular design, and the frontend's context-driven state management. Every architectural decision was justified by a specific engineering constraint: CSRF protection for session security, per-row transaction atomicity for batch reliability, composite unique constraints for data integrity, and multi-stage Docker builds for image optimization.

The next chapter will focus on **Security Design** — examining the authentication flow, password hashing, CSRF/XSS defenses, and rate limiting in detail.
