# Chapter 3 — Problem Definition & Requirements Engineering

---

## 3.1 Current Situation & Stakeholder Analysis

### 3.1.1 The Pre-System Workflow

Prior to the BSU Engineering Portal, the Faculty of Engineering at Beni-Suef University operated a predominantly paper-based and spreadsheet-driven academic management process. This workflow exhibited the following systemic failures:

- **Student Records**: Student enrollment data was maintained in Microsoft Excel workbooks, one per department per academic year. Adding a single student required manually editing a shared file and hoping no concurrent edits would introduce corruption.
- **Grade Management**: Faculty members (doctors) recorded attendance and exam grades on paper forms. These forms were physically transported to Student Affairs, where clerks manually re-entered them into another Excel workbook — introducing a human transcription layer with no validation.
- **Course-Doctor Assignment**: The assignment of faculty members to courses each semester was communicated verbally or via internal paper memos, with no central digital record mapping doctors to subjects in the current term.
- **Student Access to Information**: Students had no self-service mechanism to view their own grades, attendance records, or exam schedules. They depended entirely on physical notice boards or direct inquiries to Student Affairs — a process that could take days.
- **Audit Trail**: There was no log of who uploaded which grades, who modified which student record, or when. This made accountability impossible and dispute resolution arbitrary.

### 3.1.2 Stakeholder Identification

The following table identifies every actor in the system, their organizational role, their pain points under the previous process, and their primary interaction with the BSU Engineering Portal.

> **[INSERT Figure 3.1 — Stakeholder Interaction Diagram showing all five roles and their data flows]**

| Stakeholder | Organization Role | Pre-System Pain Point | System Interaction |
|---|---|---|---|
| **Student** | Undergraduate in any department/level | No self-service access to grades, attendance, or materials | View grades, attendance, quizzes, exam schedule, download lectures |
| **Doctor** (Faculty Member) | Lecturer teaching one or more courses | No digital tool for recording attendance or publishing grades/quizzes | Manage assigned courses, record attendance, create quizzes, enter grades, upload lecture materials |
| **Student Affairs** | Administrative staff managing student lifecycle | Manual Excel-based student registration, grade re-entry, certificate handling | Batch-upload students via Excel, view all grades, reset passwords, manage graduation certificates |
| **Staff Affairs** | Administrative staff managing faculty and HR | No structured system for managing doctor records or course assignments | Batch-upload doctors, assign doctors to courses per term, manage deletion requests |
| **Admin** (IT/System Administrator) | Technical administrator of the portal | No central system to configure — everything was ad-hoc | Manage academic years/terms/departments/levels, create announcements, manage users, approve deletion requests, view audit logs |

*Table 3.1 — Stakeholder Summary and System Interaction Points*

### 3.1.3 Stakeholder Permission Boundaries

A critical design decision in the system is that **no stakeholder role has full system access**. Even the Admin role cannot directly enter grades or upload students — those operations are delegated exclusively to the Doctor and Student Affairs roles, respectively. This principle of **least privilege** ensures that operational authority matches organizational responsibility.

The following code snippet from the backend demonstrates how each role is enforced as a distinct permission class:

```python
class IsStudentAffairsRole(permissions.BasePermission):
    """Student Affairs role - manages students and grades"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['STUDENT_AFFAIRS', 'ADMIN']
```

This pattern is replicated for each of the five roles (`IsAdminRole`, `IsDoctorRole`, `IsStudentRole`, `IsStudentAffairsRole`, `IsStaffAffairsRole`), with the Admin role receiving fallback access to administrative operations but not to academic data-entry workflows.

---

## 3.2 Proposed Methodology

### 3.2.1 Why Agile?

The BSU Engineering Portal was developed using an **iterative, sprint-based Agile methodology**. This choice was driven by the nature of the project itself: the faculty's operational requirements were not fully understood at the outset. Stakeholder interviews revealed new requirements throughout the development cycle — for example, the need for a multi-type quiz engine (supporting MCQ, essay, and image-based questions) was identified mid-development when doctors expressed frustration with the absence of any online assessment tool.

A waterfall approach would have locked all requirements before implementation, making it impossible to accommodate these emergent needs without costly rework. Agile allowed us to:

1. **Deliver working features early** — students could view grades while the quiz engine was still under development.
2. **Incorporate feedback incrementally** — the grading template system was redesigned after pilot testing revealed that the initial model did not match the faculty's official grading structure (اعمال فصلية / تحريري / عملي-شفوى).
3. **Maintain a deployable system at all times** — Docker containerization ensured every sprint produced a runnable artifact.

### 3.2.2 Sprint Structure

| Sprint | Focus Area | Key Deliverables |
|---|---|---|
| Sprint 1 | Authentication & Core Data | User model with 5 roles, login/logout, CSRF handshake, Department/Level/Subject models |
| Sprint 2 | Student & Staff Affairs | Batch Excel upload (students, doctors), student listing with filters |
| Sprint 3 | Course Management | CourseOffering model, doctor-to-course assignment, lecture upload |
| Sprint 4 | Attendance & Grading | Bulk attendance recording, grade entry per course, grading templates |
| Sprint 5 | Quiz Engine | Quiz CRUD, MCQ/Essay/Image types, auto-grading for MCQ, manual grading for essays |
| Sprint 6 | Student Portal | Student dashboard with grades, attendance, quizzes, exam schedule, materials |
| Sprint 7 | Admin & Operations | Announcements, audit logs, contact messages, academic year management, deletion approval workflow |
| Sprint 8 | DevOps & Polish | Docker Compose orchestration, Nginx reverse proxy, UI/UX refinements, RTL support |

*Table 3.2 — Sprint Plan Overview*

---

## 3.3 Functional Requirements

The following functional requirements are written in IEEE 830-style format. Each requirement has a unique identifier (FR-XX), a natural-language description, and a priority classification (Must / Should / Could).

### 3.3.1 Authentication & User Management

| ID | Requirement | Priority |
|---|---|---|
| **FR-01** | The system shall authenticate users via session-based login using a username (national ID) and password. | Must |
| **FR-02** | The system shall enforce a mandatory password change on first login for all non-admin user accounts. The default password shall be the user's national ID. | Must |
| **FR-03** | The system shall reject password changes where the new password is identical to the user's national ID or is shorter than 6 characters. | Must |
| **FR-04** | The system shall support five distinct user roles: Admin, Doctor, Student, Student Affairs, and Staff Affairs. Each role shall have an isolated dashboard. | Must |
| **FR-05** | The system shall provide an Admin-only user management interface for listing, searching, creating, editing, and deleting users across all roles. | Must |
| **FR-06** | Admin and authorized role users shall be able to reset any user's password to their national ID, re-activating the first-login-required flag. | Must |

The following snippet demonstrates the first-login enforcement logic embedded in the custom User model:

```python
def save(self, *args, **kwargs):
    is_new = not self.pk
    if is_new and not self.is_superuser:
        if not self.password or self.password == '!':
            self.set_password(self.national_id or self.username)
        if self.role in ['STUDENT', 'STUDENT_AFFAIRS', 
                         'STAFF_AFFAIRS', 'DOCTOR']:
            self.first_login_required = True
    return super().save(*args, **kwargs)
```

### 3.3.2 Student Affairs Operations

| ID | Requirement | Priority |
|---|---|---|
| **FR-07** | Student Affairs shall upload students in bulk via Excel/CSV files containing at minimum: national_id, full_name, department, and level columns. | Must |
| **FR-08** | The system shall provide a preview of the first 5 rows of the uploaded file with per-row validation errors before committing the upload. | Should |
| **FR-09** | The system shall validate that the department and level values in the uploaded file match the selections made in the upload form. Mismatches shall be rejected with descriptive Arabic error messages. | Must |
| **FR-10** | When a student with an existing national_id is uploaded, the system shall update the existing record rather than creating a duplicate (upsert behavior). | Must |
| **FR-11** | Student Affairs shall view a filterable student list (by department, academic year, level, specialization) and shall be able to reset individual student passwords. | Must |
| **FR-12** | Student Affairs shall view all student grades in a read-only table grouped by student and subject, with columns for coursework, midterm, final, attendance, and quizzes. | Must |
| **FR-13** | Student Affairs shall upload exam grades via Excel files and submit them for approval. Grades shall remain in a "pending" state until approved. | Must |
| **FR-14** | Student Affairs shall manage graduation certificates by uploading a ZIP file of PDFs, where each PDF is named by the student's national ID. The system shall automatically match and link certificates to student records. | Should |
| **FR-15** | The system shall maintain a persistent upload history log recording the file name, upload type, total rows, created count, updated count, error count, and timestamp for every batch operation. | Must |

> **[INSERT Figure 3.2 — Screenshot of the Student Affairs Upload Form showing the preview validation step]**

### 3.3.3 Staff Affairs Operations

| ID | Requirement | Priority |
|---|---|---|
| **FR-16** | Staff Affairs shall upload doctors in bulk via Excel/CSV files containing national_id and full_name columns. | Must |
| **FR-17** | Staff Affairs shall upload Student Affairs users in bulk using the same Excel format. | Should |
| **FR-18** | Staff Affairs shall assign doctors to course offerings (subject + level + term + academic year), with optional grading template and specialization selection. | Must |
| **FR-19** | The system shall prevent course assignment if the associated academic year is in a CLOSED state. | Must |
| **FR-20** | Staff Affairs shall submit a deletion request (with a reason) to remove a doctor. The deletion shall require explicit Admin approval before execution. | Must |
| **FR-21** | Staff Affairs shall view an assignment history log showing all doctor assignments and unassignments with timestamps. | Should |

### 3.3.4 Doctor (Faculty) Operations

| ID | Requirement | Priority |
|---|---|---|
| **FR-22** | Doctors shall view all courses assigned to them for the current academic year, with student counts, grading template details, and department information. | Must |
| **FR-23** | Doctors shall record bulk attendance for any session date, specifying each student as Present, Absent, or Excused. The system shall generate an Excel export of the recorded attendance. | Must |
| **FR-24** | Doctors shall enter grades (coursework, midterm, final, attendance, quizzes) for all students in a course offering via a bulk grade entry interface. | Must |
| **FR-25** | The system shall prevent grade entry or modification if the associated academic year is CLOSED or the term is CLOSED. | Must |
| **FR-26** | Doctors shall create quizzes with support for four types: MCQ, Essay, Image-based, and Mixed (MCQ + Essay). | Must |
| **FR-27** | MCQ quizzes shall be auto-graded immediately upon student submission. Essay quizzes shall require manual grading by the doctor through a dedicated grading interface. | Must |
| **FR-28** | Doctors shall view quiz results showing all student attempts, scores, and individual question-level answers. | Must |
| **FR-29** | Doctors shall upload quizzes in bulk via a structured JSON file. | Could |
| **FR-30** | Doctors shall upload lecture materials (PDF, slides, video) per course. The system shall validate that the uploaded file type matches the declared content type. | Must |
| **FR-31** | Doctors shall manage weekly lecture schedules (day, time, location, type: lecture/tutorial/lab) per course offering. | Should |

### 3.3.5 Student Operations

| ID | Requirement | Priority |
|---|---|---|
| **FR-32** | Students shall view their academic profile including department, level, specialization, and academic year. | Must |
| **FR-33** | Students shall view their grades across all subjects, broken down by coursework, midterm, final, attendance, and quizzes. | Must |
| **FR-34** | Students shall view their attendance records per course, with per-session presence/absence status. | Must |
| **FR-35** | Students shall take available quizzes and receive immediate feedback on MCQ scores. Essay-type quiz scores shall display after doctor grading. | Must |
| **FR-36** | Students shall view their exam schedule (date, time, location) for current course offerings. | Should |
| **FR-37** | Students shall download lecture materials (PDFs, slides, videos) uploaded by their course doctors. | Must |
| **FR-38** | Students shall view graduation certificates uploaded to their profile. | Should |

### 3.3.6 Admin Operations

| ID | Requirement | Priority |
|---|---|---|
| **FR-39** | Admin shall create and manage academic years, with the ability to set the current year, toggle Open/Closed status, and auto-create terms and levels for all departments upon year creation. | Must |
| **FR-40** | Admin shall manage departments (including preparatory) and specializations (e.g., ECE, Power for Electrical Engineering). | Must |
| **FR-41** | Admin shall manage grading templates defining weight distributions across coursework, written exam, and practical/oral components. | Must |
| **FR-42** | Admin shall create system-wide announcements targeted to specific roles (All, Students, Doctors, Student Affairs, Staff Affairs). | Must |
| **FR-43** | Admin shall approve or reject doctor deletion requests submitted by Staff Affairs. Approved deletions shall permanently remove the doctor's user account. | Must |
| **FR-44** | Admin shall view a comprehensive audit log of all system actions, including batch uploads, password resets, grade approvals, and user creation/deletion events. | Must |
| **FR-45** | Admin shall view and manage contact messages submitted through the public contact form, with read/unread status tracking. | Should |

### 3.3.7 Public (Unauthenticated) Features

| ID | Requirement | Priority |
|---|---|---|
| **FR-46** | The system shall provide a public-facing homepage, department pages, faculty vision/mission page, ethics page, and dean's word page — accessible without authentication. | Should |
| **FR-47** | The system shall provide a public contact form allowing visitors to submit inquiries by category (general, admission, academic, technical, complaint). | Must |
| **FR-48** | The system shall display a public staff directory showing faculty members and their departments. | Could |

> **[INSERT Figure 3.3 — Screenshot of the Public Homepage showing navigation to departments, about, and contact]**

---

## 3.4 Non-Functional Requirements

Non-functional requirements define the quality attributes that the system must exhibit. These are not features — they are constraints on **how** the features behave.

| ID | Category | Requirement | Metric / Target |
|---|---|---|---|
| **NFR-01** | **Security** | All passwords shall be stored using Django's PBKDF2-SHA256 hashing algorithm. Plain-text passwords shall never be stored or logged. | 0 plain-text passwords in DB |
| **NFR-02** | **Security** | API endpoints shall enforce CSRF protection via Django's CSRF middleware with SameSite=None cookies for cross-origin deployments. | All state-changing requests require CSRF token |
| **NFR-03** | **Security** | The system shall throttle unauthenticated API requests to 100/hour and authenticated requests to 1,000/hour. | Configurable in `settings.py` |
| **NFR-04** | **Availability** | The system shall automatically restart any crashed container via Docker's `restart: unless-stopped` policy. | Zero manual intervention for container crashes |
| **NFR-05** | **Scalability** | The database shall be isolated in a dedicated Docker container accessible only from the internal Docker network — not exposed to the host. | DB port not published to host |
| **NFR-06** | **Performance** | API responses for listing endpoints (students, grades, courses) shall complete within 2 seconds for datasets of up to 5,000 records. | <2s response time |
| **NFR-07** | **Usability** | The interface shall fully support RTL (Right-to-Left) layout for Arabic text, using `stylis-plugin-rtl` for MUI components. | All UI elements render correctly in Arabic |
| **NFR-08** | **Maintainability** | The backend shall be organized into four Django applications (`users`, `academic`, `content`, `system`), each with a single responsibility. | Modular codebase with clear boundaries |
| **NFR-09** | **Portability** | The entire system shall be deployable on any machine with Docker installed, using a single `docker-compose up --build` command. | Works on Linux, macOS, and Windows |
| **NFR-10** | **Auditability** | Every administrative action (user creation, grade upload, password reset, deletion) shall be recorded in an AuditLog table with timestamp, actor, and action details. | Full audit trail of all admin operations |

*Table 3.3 — Non-Functional Requirements*

The rate-limiting configuration from `settings.py` demonstrates NFR-03:

```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
}
```

---

## 3.5 Use Case Definitions

### 3.5.1 Use Case Diagram — Actor-Permission Mapping

> **[INSERT Figure 3.4 — UML Use Case Diagram showing all five actors (Admin, Doctor, Student, Student Affairs, Staff Affairs) and their connected use cases. Group use cases into packages: Authentication, Academic Management, Grade Management, Quiz Engine, Content & Communication, System Administration]**

### 3.5.2 Use Case Summary Table

The following table maps every use case to its primary actor, the API endpoint group that serves it, and the backend permission class that guards it.

| UC-ID | Use Case | Primary Actor | Endpoint Group | Permission Guard |
|---|---|---|---|---|
| UC-01 | Login with session + CSRF handshake | All | `/api/users/login/` | `AllowAny` |
| UC-02 | Change password (first login) | All (authenticated) | `/api/users/change-password/` | `IsAuthenticated` |
| UC-03 | Batch-upload students via Excel | Student Affairs | `/api/academic/student-affairs/upload/` | `IsStudentAffairsRole` |
| UC-04 | Preview upload before commit | Student Affairs | `/api/academic/student-affairs/upload-preview/` | `IsStudentAffairsRole` |
| UC-05 | Filter & list students | Student Affairs | `/api/academic/student-affairs/students/` | `IsStudentAffairsRole` |
| UC-06 | Reset student password | Student Affairs | `/api/academic/student-affairs/students/<id>/reset-password/` | `IsStudentAffairsRole` |
| UC-07 | View student grades (read-only) | Student Affairs | `/api/academic/student-affairs/grades/` | `IsStudentAffairsRole` |
| UC-08 | Upload exam grades for approval | Student Affairs | `/api/academic/exam-grades/upload/` | `IsStudentAffairsRole` |
| UC-09 | Upload certificates (ZIP of PDFs) | Student Affairs | `/api/academic/student-affairs/bulk-certificates/` | `IsStudentAffairsRole` |
| UC-10 | Batch-upload doctors via Excel | Staff Affairs | `/api/academic/staff-affairs/upload-doctors/` | `IsStaffAffairsRole` |
| UC-11 | Assign doctor to course offering | Staff Affairs | `/api/academic/staff-affairs/assign-doctor/` | `IsStaffAffairsRole` |
| UC-12 | Request doctor deletion | Staff Affairs | `/api/academic/staff-affairs/doctors/<id>/delete-request/` | `IsStaffAffairsRole` |
| UC-13 | View my assigned courses | Doctor | `/api/academic/course-offerings/my_courses/` | `IsDoctorRole` |
| UC-14 | Record bulk attendance | Doctor | `/api/academic/attendance/bulk/` | `IsDoctorRole` |
| UC-15 | Enter bulk student grades | Doctor | `/api/academic/student-grades/bulk/` | `IsDoctorRole` |
| UC-16 | Create quiz (MCQ/Essay/Image/Mixed) | Doctor | `/api/academic/quizzes/` | `IsDoctorRole` |
| UC-17 | Grade essay quiz attempts | Doctor | `/api/academic/quizzes/<id>/attempts/<id>/grade/` | `IsDoctorRole` |
| UC-18 | Upload lecture materials | Doctor | `/api/academic/lectures/` | `IsDoctorRole` |
| UC-19 | View my grades | Student | `/api/academic/student-grades/bulk/?course_offering=` | `IsStudentRole` |
| UC-20 | Take a quiz | Student | `/api/academic/student/quizzes/<id>/attempt/` | `IsStudentRole` |
| UC-21 | View quiz results | Student | `/api/academic/student/quizzes/<id>/results/` | `IsStudentRole` |
| UC-22 | View attendance records | Student | `/api/academic/attendance/` | `IsStudentRole` |
| UC-23 | View exam schedule | Student | `/api/academic/exams/` | `IsStudentRole` |
| UC-24 | Download lecture materials | Student | `/api/academic/lectures/` | `IsStudentRole` |
| UC-25 | Manage academic years & terms | Admin | `/api/academic/years/` | `IsAdminRole` |
| UC-26 | Manage departments & specializations | Admin | `/api/academic/departments/` | `IsAdminRole` |
| UC-27 | Manage grading templates | Admin | `/api/academic/grading-templates/` | `IsAdminRole` |
| UC-28 | Approve/reject deletion requests | Admin | `/api/academic/admin/deletion-requests/` | `IsAdminRole` |
| UC-29 | Create announcements | Admin | `/api/academic/announcements/` | `IsAdminRole` |
| UC-30 | View audit logs | Admin | `/api/academic/admin/audit-logs/` | `IsAdminRole` |
| UC-31 | Submit contact inquiry (public) | Visitor (unauthenticated) | `/api/academic/contact/` | `AllowAny` |

*Table 3.4 — Use Case Summary with Actors and API Mapping*

### 3.5.3 Detailed Use Case: Batch Student Upload (UC-03)

This use case is expanded in detail because it represents the system's most complex data validation flow — replacing the error-prone Excel-to-Excel manual process that previously took Student Affairs hours per department.

**Use Case Name:** Batch-Upload Students via Excel

**Primary Actor:** Student Affairs

**Preconditions:**
1. User is authenticated with `STUDENT_AFFAIRS` or `ADMIN` role.
2. At least one Department, Academic Year, and Level exist in the system.

**Main Flow:**
1. Student Affairs selects a Department, Academic Year, and optionally a Level from dropdown menus.
2. Student Affairs uploads an Excel/CSV file with columns: `national_id`, `full_name`, `department`, `level`, and optionally `email`, `specialization`.
3. The system parses the file using `pandas` and validates:
   - Required columns are present.
   - The `department` column in every row matches the selected department (by name, code, or ID).
   - The `level` column in every row matches the selected level (by name or display name).
   - The `specialization` column, if present, matches the selected specialization.
4. If validation passes, the system processes each row within a `transaction.atomic()` block:
   - If the `national_id` already exists → **update** the student record.
   - If the `national_id` does not exist → **create** a new User account (with password = national_id) and a linked Student record.
5. The system creates an AuditLog entry and an UploadHistory entry recording the results.
6. The system returns a JSON response: `{created: N, updated: M, errors: [...]}`.

**Alternative Flows:**
- **A1:** Validation fails → system returns descriptive Arabic error messages identifying which rows failed and why.
- **A2:** File format is not `.csv`, `.xlsx`, or `.xls` → system rejects with a "format unsupported" error.

**Postconditions:**
- All valid students are registered in the database with linked User accounts.
- All created students have `first_login_required = True`.
- Upload is recorded in UploadHistory for audit.

> **[INSERT Figure 3.5 — Sequence Diagram showing the Batch Student Upload flow: Frontend → API → Pandas Validation → Database Transaction → AuditLog]**

The following snippet shows the core atomic transaction that creates both the User and Student records:

```python
with transaction.atomic():
    user = User.objects.create_user(
        username=national_id,
        password=national_id,
        role='STUDENT',
        first_login_required=True
    )
    Student.objects.create(
        national_id=national_id,
        full_name=full_name,
        user=user,
        level=row_level,
        academic_year=academic_year,
        department=department,
    )
```

### 3.5.4 Detailed Use Case: Quiz Lifecycle (UC-16, UC-20, UC-17)

This composite use case covers the full lifecycle of a quiz: creation by the doctor, attempt by the student, and grading.

> **[INSERT Figure 3.6 — Activity Diagram showing the Quiz Lifecycle: Doctor Creates → Student Starts Attempt → Student Submits → System Auto-Grades MCQ / Doctor Manually Grades Essay → Results Published]**

**Phase 1 — Quiz Creation (Doctor):**
1. Doctor selects an assigned course offering.
2. Doctor specifies quiz type (MCQ, Essay, Image, or Mixed), title, total points, and optional time limit.
3. For each question, doctor enters the question text (or uploads an image), specifies points, and defines choices (for MCQ) with the correct answer marked.
4. The system persists `Quiz → QuizQuestion → QuizChoice` in nested creation.

**Phase 2 — Quiz Attempt (Student):**
1. Student views available quizzes filtered by their level and academic year.
2. Student starts an attempt — the system creates a `StudentQuizAttempt` record with status `IN_PROGRESS`.
3. Student answers questions and submits.
4. For MCQ-only quizzes: auto-grading is performed immediately by comparing `selected_choice.is_correct`. The score is calculated and the attempt status is set to `GRADED`.
5. For quizzes containing essay questions: the attempt status is set to `SUBMITTED` (awaiting manual grading).

**Phase 3 — Manual Grading (Doctor, essay only):**
1. Doctor views all submitted attempts for a quiz.
2. For each essay answer, the doctor assigns `points_earned` (capped at `question.points`).
3. The system updates the total score and sets the attempt status to `GRADED`.

The auto-grading logic for MCQ questions:

```python
if question.question_type == 'MCQ':
    choice = QuizChoice.objects.get(id=choice_id, question=question)
    answer.selected_choice = choice
    if choice.is_correct:
        answer.points_earned = question.points
        total_score += float(question.points)
    else:
        answer.points_earned = 0
```

### 3.5.5 Detailed Use Case: Doctor Deletion Approval Workflow (UC-12, UC-28)

This use case demonstrates a **two-phase approval pattern** — a design decision made to prevent accidental or unauthorized user deletion.

**Why not allow direct deletion?** Deleting a doctor cascades through CourseOfferings, StudentGrades, Attendance records, and Quizzes. Unrestricted deletion by Staff Affairs could destroy an entire semester's academic data. The two-phase approval pattern ensures that:
1. Staff Affairs can *request* a deletion with a justification reason.
2. Only the Admin can *approve* the deletion after reviewing the impact.

**Main Flow:**
1. Staff Affairs navigates to a doctor's profile and clicks "Request Deletion."
2. The system creates a `DoctorDeletionRequest` with status `PENDING`.
3. Admin views pending deletion requests on the Admin Dashboard (with the doctor's name, the requester's name, and the stated reason).
4. Admin approves → the system deletes the doctor's User record and all associated data. An AuditLog entry is created.
5. Admin rejects → the request status is updated to `REJECTED`. The doctor account remains unchanged.

> **[INSERT Figure 3.7 — Screenshot of the Admin Approval Center showing pending deletion requests with Approve/Reject buttons]**

---

## Summary

This chapter has established the engineering foundation of the BSU Engineering Portal through rigorous requirements analysis. **48 functional requirements** across 7 stakeholder groups and **10 non-functional requirements** across 6 quality attribute categories have been defined. The chapter introduced **31 use cases** mapped to specific API endpoints and permission guards, with three complex use cases (batch upload, quiz lifecycle, deletion approval) expanded in full detail with sequence flows and code-level justification.

The next chapter will translate these requirements into a concrete system architecture and database design.
