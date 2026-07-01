# UI/UX Specification: Doctor Role

## 1. Design System and Visual Language

### Typography
Optimized for dense grading grids and course management.
- **Primary Font Family (Headings and UI Elements):** `Inter`, sans-serif
- **Secondary Font Family (Body Copy):** `Roboto`, sans-serif
- **Monospace Font Family:** `JetBrains Mono`, monospace

**Typographic Scale:**
- **H1:** 36px (2.25rem), Bold
- **H2:** 28px (1.75rem), Semi-Bold
- **H3:** 24px (1.5rem), Semi-Bold
- **Body Default:** 16px (1rem), Regular
- **Data Tables:** 14px (0.875rem)

### Color Palette
- **Primary:** `#0056D2` (Deep Blue)
- **Secondary:** `#6366F1` (Indigo 500) - For action buttons like 'Create Quiz'.
- **Background:** `#F8FAFC` (Cool Off-White)
- **Surface:** `#FFFFFF`
- **Error (Failing Grade/Missing):** `#EF4444`
- **Success (Submitted/Graded):** `#10B981`

### Spacing and Geometry
- **Spacing Scale:** 4px, 8px, 16px, 24px. Dense padding (8px) used in grading tables.
- **Border Radii:** Inputs/Buttons `6px`, Cards `12px`.

---

## 2. Information Architecture and Navigation

### Complete Doctor Sitemap
- `/doctor/dashboard` - Main Dashboard Overview
- `/doctor/courses` - List of assigned courses
- `/doctor/courses/:courseId` - Specific Course Landing Page
- `/doctor/courses/:courseId/manage` - Course Manager (Settings, Material Uploads, Syllabus)
- `/doctor/courses/:courseId/upload-grades` - Grade Upload Interface (CSV/Excel)
- `/doctor/courses/:courseId/quiz` - Create / Manage Quizzes
- `/doctor/courses/:courseId/quiz/:quizId/results` - View aggregate quiz results and analytics
- `/doctor/courses/:courseId/quiz/:quizId/grade/:attemptId` - Grade specific student attempt manually
- `/profile` - Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Contains Breadcrumbs (e.g., `Courses > CS101 > Manage`), Profile Menu.
- **Sidebar:** Dashboard, Courses. Inside a course context, sub-navigation tabs appear (Details, Manage, Grades, Quizzes).

### Step-by-Step User Journeys (Top 3 Core Actions)

**Action 1: Creating a Quiz**
1. User navigates to `/doctor/courses/:courseId/quiz`.
2. Clicks "+ New Quiz".
3. Fills out title, duration, and opens the question builder.
4. Adds multiple questions (selecting type: multiple choice, true/false, text).
5. Sets correct answers and points per question.
6. Clicks "Publish Quiz".

**Action 2: Uploading Course Grades**
1. User navigates to `/doctor/courses/:courseId/upload-grades`.
2. Interface provides a "Download Excel Template" button.
3. User drags and drops the filled `.xlsx` file into the dropzone.
4. System parses the file and displays a preview data table of the grades.
5. User clicks "Confirm and Upload".

**Action 3: Grading a Manual Quiz Attempt**
1. Navigates to `/doctor/courses/:courseId/quiz/:quizId/grade/:attemptId`.
2. Views the student's text response alongside the question prompt.
3. Enters a numeric score in the input field.
4. Adds optional feedback text.
5. Clicks "Save Grade" and automatically loads the next ungraded attempt.

---

## 3. Page-by-Page Layout and Interface Elements

### Screen 1: Doctor Dashboard
- **Layout:** 2-column grid. Left: "My Courses" list cards. Right: "Recent Activity / Pending Grading" alerts.
- **UI Components:** Course Cards display title, code, and enrolled student count. Actionable buttons directly on the card to jump to "Upload Material" or "Grade".

### Screen 2: Course Manager (`/manage`)
- **Layout:** Vertical sections for Syllabus, Upload Materials, and Settings.
- **UI Components:** Drag-and-drop file uploader zone. List of currently uploaded materials with quick-delete icons.

### Screen 3: Quiz Results Matrix (`/results`)
- **Layout:** Full width data table.
- **UI Components:** Columns for Student Name, ID, Attempt Date, Score. Sortable headers. "Export to CSV" button on top right.
