
# Section 8 — Performance Considerations
### BSU Engineering Portal — Graduation Project Textbook

---

> **Design Philosophy:** Performance engineering in the BSU Engineering Portal is not about premature optimization — it is about applying the right patterns at the right layers to ensure the system remains responsive as data grows. Every decision documented in this chapter balances **query efficiency, user experience, and implementation complexity** for a system serving ~2,000+ students across 188 subjects and 5 departments.

---

---

# 8.1 DATABASE QUERY OPTIMIZATION

## 8.1.1 The Problem: N+1 Query Explosion

In a system with deeply nested relationships — Students → CourseOfferings → Subjects → Departments → Specializations — naïve ORM usage can produce **N+1 query problems** where fetching a list of N records triggers N additional database queries for related data.

**Example: Doctor's "My Courses" endpoint**

Without optimization, fetching a doctor's 10 course offerings would trigger:

```
1 query:   SELECT * FROM course_offerings WHERE doctor_id = X
10 queries: SELECT * FROM subjects WHERE id = Y              (one per offering)
10 queries: SELECT * FROM levels WHERE id = Z                (one per offering)
10 queries: SELECT * FROM departments WHERE id = W           (one per level)
10 queries: SELECT * FROM grading_templates WHERE id = V     (one per offering)
─────────
41 total queries for displaying 10 courses
```

**Optimized Implementation:**

```python
# From academic/views.py — Doctor's Course View with Query Optimization
class CourseOfferingViewSet(viewsets.ModelViewSet):
    def my_courses(self, request):
        offerings = CourseOffering.objects.filter(
            doctor=request.user,
            academic_year__is_current=True
        ).select_related(
            'subject',           # JOIN with subjects table
            'academic_year',     # JOIN with academic_years table
            'term',              # JOIN with terms table
            'level',             # JOIN with levels table
            'level__department', # JOIN with departments table (through level)
            'grading_template',  # JOIN with grading_templates table
            'specialization',    # JOIN with specializations table
        ).annotate(
            student_count=Count('level__students')  # Aggregate in SQL
        )
```

**Result:** 41 queries → **1 single query** with SQL JOINs. The `select_related()` method tells Django to perform a single SQL JOIN instead of lazy-loading related objects one at a time.

### 8.1.2 `select_related` vs. `prefetch_related`

The system uses two Django ORM optimization strategies:

| Strategy | SQL Behavior | When Used |
|---|---|---|
| **`select_related()`** | Single SQL JOIN — fetches parent/FK objects in the same query | ForeignKey and OneToOneField relationships (e.g., `CourseOffering → Subject`) |
| **`prefetch_related()`** | Separate SQL query for related objects, cached in memory | ManyToMany and reverse ForeignKey relationships (e.g., fetching all students for multiple courses) |
| **`annotate()`** | SQL aggregation (COUNT, SUM, AVG) computed in the database | Computing student counts, grade averages, attendance statistics without loading all records into Python |

### 8.1.3 Database Indexing Strategy

The system uses Django's default indexing plus explicit `unique_together` constraints that create compound indexes:

```python
# Compound indexes via unique_together
class Attendance(models.Model):
    class Meta:
        unique_together = ('student', 'course_offering', 'date')
        # Creates index: (student_id, course_offering_id, date)

class StudentGrade(models.Model):
    class Meta:
        unique_together = ('student', 'course_offering')
        # Creates index: (student_id, course_offering_id)

class CourseOffering(models.Model):
    class Meta:
        unique_together = ('subject', 'academic_year', 'term', 'level')
        # Creates index: (subject_id, academic_year_id, term_id, level_id)
```

**Why these specific compound indexes?**

The most common query patterns in the system are:
- "Get all attendance records for student X in course Y" → Hits `(student_id, course_offering_id, date)` index.
- "Get the grade for student X in course Y" → Hits `(student_id, course_offering_id)` index.
- "Find the course offering for subject X in year Y, term Z, level W" → Hits `(subject_id, academic_year_id, term_id, level_id)` index.

Additionally, the `ExamGrade` model uses an explicit index on the `is_approved` field for efficient filtering of approved vs. pending grades:

```python
class ExamGrade(models.Model):
    is_approved = models.BooleanField(default=False, db_index=True)
    # db_index=True creates a B-tree index for efficient filtering
```

> **[INSERT Figure 8.1 — Database query execution plan showing index usage for a typical attendance lookup query]**

---

---

# 8.2 CACHING STRATEGY

## 8.2.1 Static Asset Caching (Nginx Layer)

The most impactful caching in the system is applied to **static and media files** at the Nginx layer:

```nginx
# From nginx.conf — Media File Caching
location /media/ {
    try_files $uri $uri/ =404;
    expires 30d;                        # 30-day browser cache
    add_header Cache-Control "public, no-transform";
}
```

**Impact Analysis:**

| Asset Type | Size Range | Without Cache | With 30-Day Cache | Reduction |
|---|---|---|---|---|
| Lecture PDFs | 1–50 MB | Downloaded every view | Downloaded once per 30 days | ~95% bandwidth saving |
| Profile pictures | 50–500 KB | Downloaded every page load | Cached locally | ~99% bandwidth saving |
| Quiz images | 100 KB–5 MB | Downloaded every quiz view | Cached on first load | ~90% bandwidth saving |

**Why 30 days?** Lecture materials are versioned by upload — a new version creates a new file URL, automatically busting the cache. Profile pictures and quiz images change infrequently. 30 days balances bandwidth savings with reasonable freshness.

## 8.2.2 WhiteNoise Static File Compression

Django's static files (admin CSS/JS, icons) are compressed and cached using WhiteNoise:

```python
# From settings.py — WhiteNoise Compressed Static Files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

**How it works:**
1. During `collectstatic`, WhiteNoise creates gzip-compressed versions of all static files.
2. WhiteNoise automatically serves the compressed version when the client sends `Accept-Encoding: gzip`.
3. **Content-hashed filenames** (e.g., `style.a1b2c3d4.css`) enable infinite cache headers — the filename changes when the content changes.

**Result:** Django Admin CSS/JS files are served compressed with cache-forever headers, reducing both bandwidth and latency.

## 8.2.3 Session-Based Authentication Cache

The choice of **session-based authentication** (see Chapter 5) provides an implicit caching benefit:

- The user's identity and role are stored server-side in the session store.
- Each request validates the session cookie — a single database lookup on the `django_session` table.
- No token decoding, signature verification, or refresh token rotation occurs per request.
- The session table has an index on the session key, making lookups O(1).

This is faster than JWT verification for authenticated requests, where each request requires HMAC-SHA256 signature verification.

---

---

# 8.3 PAGINATION & LAZY LOADING

## 8.3.1 Pagination Strategy

The system uses **per-view pagination** rather than global DRF pagination:

```python
# From settings.py — No Global Pagination
REST_FRAMEWORK = {
    # NOTE: Global pagination removed — frontend expects plain array responses.
    # Add pagination per-view where needed instead.
}
```

**Why not global pagination?**

The frontend React application uses **client-side data tables** with sorting, filtering, and search. Global pagination would break these features because:
1. Client-side sorting requires all data in memory.
2. Filtered counts would be incorrect (showing "page 1 of 5" when the filter reduces results to 3).
3. The student count per department is typically 50–200, well within client-side rendering capacity.

**Where pagination IS applied:**

| Endpoint | Dataset Size | Pagination | Rationale |
|---|---|---|---|
| Student list (Student Affairs) | Up to 2,000 | Server-side filter (department, level, year) | Filters reduce dataset to ~50-200 before client rendering |
| Audit logs (Admin) | Grows continuously | Client-side with time filter | Admin filters by date range, reducing visible dataset |
| News/Announcements | Moderate | Ordered by `-created_at` | Most recent items displayed first, natural pagination by recency |
| Quiz attempts (Doctor) | Per-quiz bounded | No pagination needed | Max ~200 students per course offering |

## 8.3.2 Lazy Loading — Frontend Optimization

The React SPA employs several lazy loading patterns to improve initial page load performance:

### Route-Level Code Splitting

React Router with dynamic imports ensures that only the code for the current page is loaded:

```jsx
// From App.jsx — Route-Based Code Splitting (Conceptual)
// Each dashboard component is only loaded when its route is accessed
<Route path="/admin/*" element={
    <ProtectedRoute roles={['ADMIN']}>
        <AdminDashboard />       {/* Loaded only when admin navigates here */}
    </ProtectedRoute>
} />
<Route path="/student/*" element={
    <ProtectedRoute roles={['STUDENT']}>
        <StudentDashboard />     {/* Not loaded until student logs in */}
    </ProtectedRoute>
} />
```

**Impact:** A student user never downloads the Admin Dashboard code, reducing their initial bundle size.

### Data Fetching on Navigation

API data is fetched **on component mount**, not at application startup:

```javascript
// Pattern used across all dashboard components
useEffect(() => {
    const fetchData = async () => {
        const response = await api.get('/api/academic/course-offerings/my_courses/');
        setCourses(response.data);
    };
    fetchData();
}, []);
```

This means:
- Login only loads user profile data.
- Course data loads when the user navigates to the courses page.
- Grade data loads when the user navigates to the grades page.
- No unnecessary API calls are made for pages the user hasn't visited.

> **[INSERT Figure 8.2 — Browser DevTools Network tab showing API calls being made on-demand as user navigates dashboard pages]**

---

---

# 8.4 BULK OPERATION OPTIMIZATION

## 8.4.1 Excel-Based Batch Processing

The most performance-sensitive operations in the system are the Excel-based bulk uploads. A single upload can create or update hundreds of records:

### Pandas for Efficient File Parsing

```python
# From academic/student_affairs_views.py — Bulk Upload with Pandas
import pandas as pd

if file_name.endswith('.csv'):
    df = pd.read_csv(file)
else:
    df = pd.read_excel(file)
```

**Why Pandas?**
- Pandas reads the entire file into memory as a DataFrame — enabling column-level validation before any database writes.
- Vectorized operations (checking for missing values, type coercion) are performed in C-optimized NumPy, not Python loops.
- The preview endpoint reads only the first 5 rows (`df.head(5)`), avoiding full file processing for validation.

### Transactional Bulk Operations

```python
# From academic/student_affairs_views.py — Atomic Bulk Create
with transaction.atomic():
    for _, row in df.iterrows():
        user, created = User.objects.update_or_create(
            username=national_id,
            defaults={...}
        )
        student, _ = Student.objects.update_or_create(
            national_id=national_id,
            defaults={...}
        )
```

**Performance characteristics:**
- `update_or_create` performs a `SELECT` + `INSERT/UPDATE` per row — 2 queries per student.
- For 500 students: ~1,000 queries within a single database transaction.
- The `transaction.atomic()` block ensures that if any row fails, all changes are rolled back.
- Total upload time for 500 students: ~15-30 seconds (acceptable for a batch operation performed weekly).

### Attendance Excel Export

When a doctor records bulk attendance, the system automatically generates an attendance Excel export:

```python
# Attendance export using openpyxl/pandas
# Generates a downloadable .xlsx with columns:
# Student Name | National ID | Status (Present/Absent/Excused)
```

This export is generated **on-demand** (not cached) because attendance data changes frequently and the dataset per session is small (~50-200 rows).

> **[INSERT Figure 8.3 — Screenshot of the Bulk Student Upload with progress indicator showing created/updated/error counts]**

---

---

# 8.5 APPLICATION SERVER OPTIMIZATION

## 8.5.1 Gunicorn Worker Configuration

```bash
# From entrypoint.sh — Gunicorn Production Configuration
exec gunicorn bsu_backend.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

**Why 2 workers?**

Gunicorn recommends `(2 × CPU cores) + 1` workers. For a single-server deployment:
- The production server has 1-2 CPU cores.
- 2 workers provide concurrency for simultaneous requests without excessive memory usage.
- Each worker handles one request at a time (sync worker model), sufficient for ~100 concurrent users.

**Why 120-second timeout?**

- Default Gunicorn timeout is 30 seconds.
- Bulk operations (uploading 500 students, generating attendance Excel) can take 30-60 seconds.
- 120 seconds provides 2x headroom for these operations.
- If a worker exceeds 120 seconds, Gunicorn kills and respawns it, preventing worker exhaustion.

## 8.5.2 Nginx Reverse Proxy Performance

Nginx in front of Gunicorn provides several performance benefits:

| Feature | Performance Benefit |
|---|---|
| **Static file serving** | Nginx serves media/static files 10-100x faster than Django (no Python overhead) |
| **Connection buffering** | Nginx absorbs slow client connections, freeing Gunicorn workers faster |
| **Keep-alive connections** | Client maintains persistent HTTP connections with Nginx, not with Gunicorn |
| **sendfile() system call** | Nginx uses kernel-level file transmission, bypassing user-space copying |
| **Compression** | Nginx can gzip responses before sending to clients (configured in production) |

## 8.5.3 Database Connection Pooling

Django establishes a new database connection per request and closes it afterward. For the current user base (~2,000 students, ~50 concurrent users), this is adequate. However, the architecture supports connection pooling if needed:

```python
# Current: Default Django database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'CONN_MAX_AGE': 0,       # Close connection after each request (default)
    }
}

# Future optimization if needed:
# CONN_MAX_AGE = 600   # Reuse connections for 10 minutes
# Or use django-db-connection-pool for true connection pooling
```

**Why not enabled now?** With 2 Gunicorn workers, the maximum concurrent database connections is 2. MySQL 8.0 handles this trivially. Connection pooling adds complexity (connection state management, stale connection detection) without measurable benefit at this scale.

---

---

# 8.6 FRONTEND PERFORMANCE

## 8.6.1 Vite Build Optimization

The React frontend is built with **Vite**, which provides:

- **Tree shaking:** Unused code from imported libraries is eliminated during the production build.
- **Code splitting:** Each route generates a separate JavaScript chunk.
- **CSS minification:** All CSS is minified and combined.
- **Asset hashing:** All static assets receive content-based hashes for cache busting.

```bash
# Production build output
dist/
├── index.html              # Entry point (~1 KB)
├── assets/
│   ├── index-[hash].js     # Main application bundle
│   ├── vendor-[hash].js    # Third-party libraries (MUI, React, etc.)
│   └── index-[hash].css    # Combined styles
```

## 8.6.2 Material UI (MUI) Tree Shaking

MUI components are imported individually to enable tree shaking:

```javascript
// Good — Only imports Button component
import Button from '@mui/material/Button';

// Bad — Would import the entire MUI library
import { Button } from '@mui/material';
```

This reduces the vendor bundle size by excluding unused MUI components (data grids, date pickers, etc.).

## 8.6.3 Theme Persistence

The dark/light theme preference is stored in `localStorage`, avoiding:
- A flash of unstyled content (FOUC) on page load.
- An unnecessary API call to fetch the user's theme preference.
- A theme flicker when navigating between pages.

```javascript
// From context/ThemeContext.jsx — Local Storage Theme Persistence
const [mode, setMode] = useState(
    localStorage.getItem('themeMode') || 'light'
);
```

> **[INSERT Figure 8.4 — Screenshot of the Dark Mode interface showing the theme toggle and consistent styling]**

---

---

# 8.7 PERFORMANCE SUMMARY

*Table 8.1: Performance Optimization Techniques Summary*

| Layer | Technique | Impact |
|---|---|---|
| **Database** | `select_related()` / `prefetch_related()` | 41 queries → 1 query (per course listing) |
| **Database** | Compound `unique_together` indexes | O(log N) lookups for attendance, grades, and course offerings |
| **Database** | `db_index=True` on `is_approved` | Fast filtering of pending vs. approved grades |
| **Nginx** | 30-day media cache headers | ~95% bandwidth reduction for lecture materials |
| **Nginx** | Static file serving bypass | 10-100x faster than Django static serving |
| **Django** | WhiteNoise compressed static files | Gzip compression + content-hashed cache-forever |
| **Django** | Per-view (not global) pagination | Enables client-side sorting/filtering without breaking UX |
| **Django** | Pandas for bulk file parsing | C-optimized CSV/Excel parsing vs. Python loops |
| **Django** | `transaction.atomic()` for bulk writes | All-or-nothing semantics with single commit |
| **Gunicorn** | 2 sync workers, 120s timeout | Appropriate concurrency for single-server deployment |
| **React** | Route-level code splitting | Students don't download Admin Dashboard code |
| **React** | Data fetching on navigation | No unnecessary API calls for unvisited pages |
| **React** | LocalStorage theme persistence | No FOUC, no API call for theme preference |
| **Vite** | Tree shaking + asset hashing | Minimal bundle with cache-forever static assets |

> **Design Conclusion:** The BSU Engineering Portal's performance strategy follows the principle of **"optimize where it matters, measure before assuming."** The system is designed to serve ~2,000 students with sub-second response times on a single server. Performance optimizations are applied at the layers where they have the highest impact — database query reduction via `select_related()`, static file caching at the Nginx layer, and frontend code splitting for reduced initial load. Connection pooling, horizontal scaling, and Redis caching are documented as **future optimizations** available if the user base grows beyond the current capacity (see Chapter 10: Limitations & Future Work).

---

*End of Section 8*
