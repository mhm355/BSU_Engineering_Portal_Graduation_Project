# UI/UX Specification: Dean / Vice Dean Role

## 1. Design System & Visual Language

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

### Spacing & Geometry
- **Spacing Scale:** 4, 8, 16, 24px.
- **Border Radii:** Sharp and formal (`4px` to `8px`) to convey structural integrity.

---

## 2. Information Architecture & Navigation

### Complete Dean Sitemap
- `/dean` - Base route
- `/dean/dashboard` - Main Dashboard Overview & Statistics
- `/dean/approve-grades` - Final approval and publishing of student grades
- `/profile` - Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Contains role badge "DEAN / VICE DEAN", quick access to pending approvals.
- **Sidebar:** Grouped by Executive Actions (Approve Grades) and Reports (Statistics).

### Step-by-Step User Journeys (Top Core Actions)

**Action 1: Viewing Faculty Statistics**
1. User navigates to `/dean/dashboard`.
2. The page presents high-level statistics cards showing total numbers of Students, Doctors, Staff Affairs, Student Affairs, and HODs.
3. The dashboard provides an at-a-glance health overview of the faculty's digital ecosystem.

**Action 2: Approving and Publishing Grades**
1. User navigates to `/dean/approve-grades`.
2. System presents a list of pending grades categorized by Level and Term.
3. The Dean reviews the submitted grades (already verified by Student Affairs).
4. Clicks "إعتماد و نشر النتائج" (Approve & Publish Results).
5. A confirmation dialog appears. Upon confirmation, results become visible to students who have paid their tuition.

---

## 3. Page-by-Page Layout & Interface Elements

### Screen 1: Dashboard (`/dean/dashboard`)
- **Layout:** Grid of statistical summary cards.
- **UI Components:** Large numerical indicators with descriptive icons (e.g., Groups, Person, Admin icons). Clean, spacious layout emphasizing data readability.

### Screen 2: Approve Grades (`/dean/approve-grades`)
- **Layout:** Filterable data table of submitted results.
- **UI Components:** Selectors for Academic Year, Term, and Level. Action buttons prominently displayed for publishing. Status badges (e.g., "Pending Dean Approval", "Published") indicating the current state of results.
