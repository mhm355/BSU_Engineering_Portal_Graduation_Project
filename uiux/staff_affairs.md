# UI/UX Specification: Staff Affairs Role

## 1. Design System & Visual Language

### Typography
Focuses on directory management, assignments, and personnel tracking.
- **Primary Font Family:** `Inter`, sans-serif
- **Secondary Font Family:** `Roboto`, sans-serif

**Typographic Scale:**
- **H1:** 32px (2rem), Bold
- **H2:** 24px (1.5rem), Semi-Bold
- **Table Headers:** 13px (0.8125rem), Bold, Uppercase
- **Body Default:** 14px (0.875rem), Regular

### Color Palette
- **Primary:** `#6D28D9` (Purple 700) - Distinct from Student Affairs to prevent role confusion.
- **Secondary:** `#8B5CF6` (Purple 500)
- **Background:** `#F5F3FF` (Purple 50) for navigation; `#FFFFFF` for content surfaces.
- **Border Default:** `#E5E7EB` (Gray 200)

### Spacing & Geometry
- **Spacing Scale:** 4, 8, 16, 24px.
- **Border Radii:** Sharp and professional (`4px` to `8px`).

---

## 2. Information Architecture & Navigation

### Complete Staff Affairs Sitemap
- `/staff-affairs` - Base route
- `/staff-affairs/dashboard` - Main Dashboard Overview
- `/staff-affairs/upload-doctors` - Bulk creation of Doctor accounts (CSV)
- `/staff-affairs/upload-staff` - Bulk creation of other Staff accounts
- `/staff-affairs/assign-doctors` - Mapping doctors to specific courses/departments
- `/staff-affairs/manage-doctors` - Directory and CRUD operations for Doctors
- `/staff-affairs/view-users` - Master list of all staff personnel
- `/staff-affairs/academic-structure` - View structure to aid in assignment routing
- `/staff-affairs/grading-templates` - Configure GPA/Grading algorithms
- `/staff-affairs/assignment-history` - Audit log of who assigned what
- `/staff-affairs/news` - Announcements targeted specifically at staff/doctors
- `/profile` - Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Contains role badge "STAFF AFFAIRS", search bar for Staff IDs.
- **Sidebar:** Grouped by Users (Manage, View), Onboarding (Uploads), Operations (Assignments, History, News).

### Step-by-Step User Journeys (Top 3 Core Actions)

**Action 1: Assigning a Doctor to a Course**
1. User navigates to `/staff-affairs/assign-doctors`.
2. Left panel lists all Departments -> Courses. Right panel lists available Doctors.
3. User selects a Course (e.g., "Advanced Mechanics").
4. User searches for a Doctor in the right panel and clicks "Assign".
5. A relationship is created, appearing in a "Current Assignments" table below.

**Action 2: Bulk Uploading Doctors**
1. Navigates to `/staff-affairs/upload-doctors`.
2. Downloads Excel template.
3. Uploads filled template (Name, Email, Degree, Department).
4. System validates and registers users, automatically sending them temporary passwords via email.

**Action 3: Managing Doctor Information**
1. Navigates to `/staff-affairs/manage-doctors`.
2. Filters the data table by Department.
3. Clicks on a specific doctor's row to open a side drawer with their full profile.
4. Clicks "Edit" to update phone number or title, then "Save".

**Action 4: Configuring a Grading Template**
1. Navigates to `/staff-affairs/grading-templates`.
2. Clicks "Create Template".
3. Form asks for Template Name, Min/Max thresholds, and maps grading components to weights.
4. Clicks Save.

---

## 3. Page-by-Page Layout & Interface Elements

### Screen 1: Dashboard
- **Layout:** Top widgets showing counts: Total Doctors, Total TAs, Total Staff. A primary table showing "Recent Personnel Changes".

### Screen 2: Assign Doctors (`/assign-doctors`)
- **Layout:** Dual-pane list builder or drag-and-drop interface.
- **UI Components:** Searchable lists with multi-select checkboxes. "Transfer" buttons (left/right arrows) between the unassigned pool and the course list.

### Screen 3: Assignment History (`/assignment-history`)
- **Layout:** Full width log table.
- **UI Components:** Columns for Timestamp, Action (Assigned/Removed), Doctor Name, Course Name, Performed By.
