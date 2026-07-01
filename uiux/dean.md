# UI/UX Specification: Dean / Vice Dean Role

## 1. Design System and Visual Language

### Typography
Focuses on high-level administrative oversight, final approvals, and statistics.
- **Primary Font Family:** `Inter`, sans-serif
- **Secondary Font Family:** `Roboto`, sans-serif

**Typographic Scale:**
- **H1:** 32px (2rem), Bold
- **H2:** 24px (1.5rem), Semi-Bold
- **Table Headers:** 13px (0.8125rem), Bold, Uppercase
- **Body Default:** 14px (0.875rem), Regular

### Color Palette
- **Primary:** `#b91c1c` (Red 700) - Conveys ultimate authority and final approval status.
- **Secondary:** `#ef4444` (Red 500)
- **Background:** `#fef2f2` (Red 50) for navigation; `#FFFFFF` for content surfaces.
- **Border Default:** `#fecaca` (Red 200)

### Spacing and Geometry
- **Spacing Scale:** 4, 8, 16, 24px.
- **Border Radii:** Sharp and formal (`4px` to `8px`) to convey structural integrity.

---

## 2. Information Architecture and Navigation

### Complete Dean Sitemap
- `/dean/dashboard` - Main Analytics Dashboard
- `/dean/publish-results` - Interface to officially release grades to students
- `/profile` - Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Contains role badge "DEAN / VICE DEAN", quick access to pending approvals.
- **Sidebar:** Grouped by Executive Actions (Approve Grades) and Reports (Statistics).

### Step-by-Step User Journeys (Top 2 Core Actions)

**Action 1: Publishing Final Results**
1. User navigates to `/dean/publish-results`.
2. Views a table of courses with their grading status (e.g., "Grades Submitted").
3. Selects the courses ready for publication.
4. Clicks "Publish Selected".
5. The system flips the `is_published` flag, making grades immediately visible on the Student Portal.

**Action 2: Analyzing Academic Performance**
1. User navigates to `/dean/dashboard`.
2. The page presents high-level statistics cards showing total numbers of Students, Doctors, Staff Affairs, Student Affairs, and HODs.
3. The dashboard provides an at-a-glance health overview of the faculty's digital ecosystem.

---

## 3. Page-by-Page Layout and Interface Elements

### Screen 1: Dashboard (`/dean/dashboard`)
- **Layout:** Grid of statistical summary cards.
- **UI Components:** Large numerical indicators with descriptive icons (e.g., Groups, Person, Admin icons). Clean, spacious layout emphasizing data readability.

### Screen 2: Approve Grades (`/dean/approve-grades`)
- **Layout:** Filterable data table of submitted results.
- **UI Components:** Selectors for Academic Year, Term, and Level. Action buttons prominently displayed for publishing. Status badges (e.g., "Pending Dean Approval", "Published") indicating the current state of results.
