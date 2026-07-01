# UI/UX Specification: Student Role

## 1. Design System and Visual Language

### Typography
The application uses a modern, highly legible typographic scale optimized for readability and data density.
- **Primary Font Family (Headings and UI Elements):** `Inter`, sans-serif
- **Secondary Font Family (Body Copy and Long Form Text):** `Roboto`, sans-serif
- **Monospace Font Family (Code Snippets and Technical Data):** `JetBrains Mono`, monospace

**Typographic Scale and Weights:**
- **H1 (Page Titles):** 36px (2.25rem), Line Height: 1.2, Weight: 700 (Bold)
- **H2 (Section Headers):** 28px (1.75rem), Line Height: 1.3, Weight: 600 (Semi-Bold)
- **H3 (Card Titles, Modals):** 24px (1.5rem), Line Height: 1.3, Weight: 600 (Semi-Bold)
- **H4 (Sub-sections):** 20px (1.25rem), Line Height: 1.4, Weight: 500 (Medium)
- **H5 (Small Titles):** 18px (1.125rem), Line Height: 1.4, Weight: 500 (Medium)
- **H6 (Overlines):** 14px (0.875rem), Line Height: 1.5, Weight: 600 (Semi-Bold), Text-Transform: Uppercase, Letter-Spacing: 0.05em
- **Body Large:** 18px (1.125rem), Line Height: 1.6, Weight: 400 (Regular)
- **Body Default:** 16px (1rem), Line Height: 1.5, Weight: 400 (Regular)
- **Body Small:** 14px (0.875rem), Line Height: 1.5, Weight: 400 (Regular)
- **Label (Forms, Buttons):** 14px (0.875rem), Line Height: 1, Weight: 500 (Medium)
- **Caption:** 12px (0.75rem), Line Height: 1.4, Weight: 400 (Regular)

### Color Palette
The color system ensures high contrast, accessibility (WCAG AA compliant), and clear semantic meaning.

**Light Mode:**
- **Primary:** `#0056D2` (Deep Blue)
- **Primary Hover:** `#0043A4`
- **Secondary:** `#00A5B5` (Teal)
- **Background (App):** `#F8FAFC` (Cool Off-White)
- **Surface (Cards, Modals):** `#FFFFFF` (Pure White)
- **Text Primary:** `#0F172A` (Slate 900)
- **Text Secondary:** `#475569` (Slate 600)
- **Border Default:** `#E2E8F0` (Slate 200)

**Dark Mode:**
- **Primary:** `#3B82F6` (Blue 500)
- **Primary Hover:** `#60A5FA` (Blue 400)
- **Secondary:** `#2DD4BF` (Teal 400)
- **Background (App):** `#0F172A` (Slate 900)
- **Surface (Cards, Modals):** `#1E293B` (Slate 800)
- **Text Primary:** `#F8FAFC` (Slate 50)
- **Text Secondary:** `#94A3B8` (Slate 400)
- **Border Default:** `#334155` (Slate 700)

### Spacing and Geometry
Built on a consistent 4px baseline grid.
- **Spacing Scale:** 4px, 8px, 16px, 24px, 32px.
- **Border Radii:** Small `6px`, Medium `12px`, Large `24px`.
- **Drop Shadows (Light):** Level 1 `0 4px 6px -1px rgba(0, 0, 0, 0.1)`, Level 2 `0 10px 15px -3px rgba(0, 0, 0, 0.1)`.

---

## 2. Information Architecture and Navigation

### Complete Student Sitemap
- `/student/dashboard` - Main Dashboard Overview
- `/student/grades` - Academic Record / Course Grades
- `/student/attendance` - Detailed Attendance tracking
- `/student/materials` - Course Materials and downloadable resources
- `/student/exams` - Scheduled exams timetable
- `/student/quizzes` - Available and past quizzes hub
- `/student/quiz/:quizId` - Active Quiz Taking Interface
- `/student/quiz/:quizId/results` - Specific Quiz Results and feedback
- `/student/results` - Query public/final results
- `/student/career-portal` - Browse and apply to jobs/events
- `/student/requests` - Submit graduate/document requests
- `/profile` - User Profile settings and personal data
- `/change-password` - Account security settings

### Navigation Flow Map
- **Global Header (Top Bar):** Brand Logo, Theme Toggle, Profile Avatar dropdown (Link to Profile, Change Password, Logout).
- **Sidebar (Left Navigation):** Links exactly matching the sitemap: Dashboard, Grades, Attendance, Materials, Exams, Quizzes, Career Portal, Graduate Requests.
- **Mobile Navigation:** Bottom tab bar for primary sections (Dashboard, Grades, Materials) and a Hamburger menu for the rest.

### Step-by-Step User Journeys (Top 3 Core Actions)

**Action 1: Taking an Online Quiz**
1. User navigates to `/student/quizzes`.
2. Locates an active quiz card and clicks "Start Quiz".
3. System routes to `/student/quiz/:quizId`. A full-screen overlay mode begins.
4. User answers multiple-choice/text questions using radio buttons or text areas.
5. User clicks "Submit Quiz".
6. System routes to `/student/quiz/:quizId/results` showing the score immediately.

**Action 2: Checking Final Grades**
1. User navigates to `/student/grades`.
2. Selects the current academic term from a dropdown.
3. System displays a table with Course Name, Credits, and Final Grade.
4. Cumulative GPA is highlighted in a callout box at the top.

**Action 3: Downloading Course Materials**
1. User navigates to `/student/materials`.
2. Filters by a specific course.
3. Table lists PDFs, Docs, or Links.
4. User clicks the "Download" icon.

**Action 4: Applying for a Job via Career Portal**
1. User navigates to `/student/career-portal`.
2. Browses active job postings and clicks "Apply".
3. Uploads CV/Resume and provides a cover letter.
4. System queues the application for company review via Graduate Affairs.

---

## 3. Page-by-Page Layout and Interface Elements

### General Grid and Responsiveness
- **Desktop (1200px+):** 12-column grid. Sidebar fixed at 260px.
- **Tablet (768px - 1199px):** 8-column grid. Sidebar collapses to icons.
- **Mobile (<768px):** 4-column grid. Sidebar becomes bottom navigation.

### Screen 1: Student Dashboard
- **Layout:** Welcome banner on top. Row of 4 summary cards (Overall GPA, Upcoming Exams, Pending Quizzes, Recent Materials).
- **UI Components:** Summary Cards, Quick Links list, Recent Announcements widget.

### Screen 2: Take Quiz (`/student/quiz/:quizId`)
- **Layout:** Minimal header with a countdown timer locked to the top right. Main container centered, max-width 800px.
- **UI Components:**
  - Timer: Red text `#EF4444` when under 5 minutes.
  - Question Block: Bold question text, distinct radio button list for answers.
  - Progress Bar: Shows X of Y questions answered.
- **States:** Selected radio button border turns `#0056D2`.
- **Feature Lock:** If the student has unpaid tuition, the Start Quiz button is disabled, grayed out, and shows a Lock Icon.

### Screen 3: Grades / Results
- **Layout:** Full width data table.
- **UI Components:** Filter dropdowns (Year, Semester). Data table with alternating row colors `#F8FAFC` and `#FFFFFF`.
