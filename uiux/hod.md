# UI/UX Specification: Head of Department (HOD) Role

## 1. Design System and Visual Language

### Typography
Focuses on department management, assigning doctors, and managing grading templates.
- **Primary Font Family:** `Inter`, sans-serif
- **Secondary Font Family:** `Roboto`, sans-serif

**Typographic Scale:**
- **H1:** 32px (2rem), Bold
- **H2:** 24px (1.5rem), Semi-Bold
- **Table Headers:** 13px (0.8125rem), Bold, Uppercase
- **Body Default:** 14px (0.875rem), Regular

### Color Palette
- **Primary:** `#0284c7` (Light Blue 600) - Distinct to convey academic authority without being aggressive.
- **Secondary:** `#38bdf8` (Light Blue 400)
- **Background:** `#f0f9ff` (Light Blue 50) for navigation; `#FFFFFF` for content surfaces.
- **Border Default:** `#e0f2fe` (Light Blue 100)

### Spacing and Geometry
- **Spacing Scale:** 4, 8, 16, 24px.
- **Border Radii:** Rounded edges (`8px` to `12px`) for an approachable yet professional feel.

---

## 2. Information Architecture and Navigation

### Complete HOD Sitemap
- `/hod` - Base route
- `/hod/dashboard` - Main Dashboard Overview
- `/hod/assign-doctors` - Assigning doctors to courses within their department
- `/hod/grading-templates` - Managing and configuring grading templates
- `/profile` - Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Contains role badge "HEAD OF DEPARTMENT", current department name indicator.
- **Sidebar:** Grouped by Operations (Assign Doctors, Grading Templates).

### Step-by-Step User Journeys (Top Core Actions)

**Action 1: Assigning a Doctor to a Course**
1. User navigates to `/hod/assign-doctors`.
2. The department field is auto-selected and locked to the HOD's department.
3. User selects a level, term, and subject from their department.
4. User selects an available doctor from the dropdown.
5. User clicks "تعيين" (Assign).
6. The assignment appears in the table below, allowing them to track all assignments within their department.

**Action 2: Configuring a Grading Template**
1. Navigates to `/hod/grading-templates`.
2. Clicks "إضافة قالب جديد" (Add New Template).
3. Form asks for Template Name, and weights for coursework, written exam, and practical exam.
4. Clicks "حفظ" (Save).
5. The template can now be used when assigning courses.

---

## 3. Page-by-Page Layout and Interface Elements

### Screen 1: Dashboard (`/hod/dashboard`)
- **Layout:** Top widgets showing summary statistics specific to the HOD's department (e.g., number of courses, assigned doctors).

### Screen 2: Assign Doctors (`/hod/assign-doctors`)
- **Layout:** Form section on top, DataGrid/Table section on the bottom.
- **UI Components:** Dropdowns for Level, Term, Subject, Doctor, and Grading Template. Table showing active assignments with an "إلغاء التعيين" (Unassign) action button for each.
- **Key UX Features:** Department dropdown is pre-filled and disabled to restrict HODs to their own department.

### Screen 3: Manage Grading Templates (`/hod/grading-templates`)
- **Layout:** List view with "Add New" button.
- **UI Components:** Data table with template details, edit/delete actions. Dialog modal for creating/editing templates.
