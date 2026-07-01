# UI/UX Specification: Student Affairs Role

## 1. Design System and Visual Language

### Typography
Requires high clarity for managing large volumes of student records and academic operations.
- **Primary Font Family:** `Inter`, sans-serif
- **Secondary Font Family:** `Roboto`, sans-serif
- **Monospace Font Family:** `JetBrains Mono`, monospace (used for Student IDs and National IDs).

**Typographic Scale:**
- **H1:** 32px (2rem), Bold
- **H2:** 24px (1.5rem), Semi-Bold
- **Data Label:** 12px (0.75rem), Semi-Bold, Uppercase
- **Body Default:** 14px (0.875rem), Regular

### Color Palette
- **Primary:** `#0F766E` (Teal 700) - Differentiates Student Affairs from Doctors (Blue) or Admin (Slate).
- **Secondary:** `#14B8A6` (Teal 500)
- **Background:** `#F0FDFA` (Teal 50) for sidebars to establish context; `#FFFFFF` for main surfaces.
- **Semantic Actions:** `#3B82F6` for standard actions, `#10B981` for successful uploads, `#EF4444` for destructive or blocking actions.

### Spacing and Geometry
- **Spacing Scale:** 4px, 8px, 12px, 16px, 24px.
- **Border Radii:** Medium `8px` for general components to maintain a professional look.

---

## 2. Information Architecture and Navigation

### Complete Student Affairs Sitemap
- `/staff/dashboard` - Alternate entry route
- `/student-affairs/dashboard` - Main Dashboard Overview
- `/student-affairs/hierarchy` - View academic structure (Years, Departments)
- `/student-affairs/upload-students` - Bulk upload student data via CSV/Excel
- `/student-affairs/news` - Manage news/announcements for students
- `/student-affairs/exam-grades` - Upload official exam grades
- `/student-affairs/grades` - View comprehensive student grades
- `/student-affairs/tuition` - Bulk upload and manage student tuition status
- `/student-affairs/upload-history` - Audit logs of all data uploads
- `/profile` - Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Contains Department context, Global Search for Student ID.
- **Sidebar:** Sections grouped by logical operation: Operations (Dashboard, Hierarchy, News), Data Entry (Upload Students, Exam Grades, Tuition), Logs (Upload History).

### Step-by-Step User Journeys (Top 3 Core Actions)

**Action 1: Bulk Uploading Students**
1. User navigates to `/student-affairs/upload-students`.
2. Interface provides "Download CSV Template".
3. User drops the `.csv` file into the designated dropzone.
4. A validation preview table appears, highlighting valid rows (green check) and invalid rows (red warning icon).
5. User clicks "Execute Upload". System shows a progress bar.

**Action 2: Managing Student Tuition**
1. User navigates to `/student-affairs/tuition`.
2. Uploads a CSV/Excel file containing Student IDs and Payment Status.
3. System verifies against the database and updates the `has_paid_tuition` flag.
4. Students who have not paid are automatically locked out of Quizzes and Attendance modules.

**Action 3: Managing Student News**
1. Navigates to `/student-affairs/news`.
2. Views a list of active announcements.
3. Clicks "Create Announcement", opening a rich text editor modal.
4. Fills out Title, Content, and Target Audience.
5. Clicks "Publish".

---

## 3. Page-by-Page Layout and Interface Elements

### Screen 1: Dashboard
- **Layout:** Metric cards across the top (Total Active Students, Pending Requests). Below: Quick links grid for frequent upload tasks.

### Screen 2: Hierarchy View (`/hierarchy`)
- **Layout:** Tree-view or Accordion layout showing Faculty -> Departments -> Levels -> Courses.
- **UI Components:** Expandable nodes with count badges (e.g., "Civil Engineering [450 Students]").

### Screen 3: Upload History (`/upload-history`)
- **Layout:** Standard dense data table.
- **UI Components:** Columns: Date, Upload Type (Grades, Students), File Name, Status (Success/Failed), Operator Name. Action button to download the original file or error log.
