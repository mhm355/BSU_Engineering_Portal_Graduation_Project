# UI/UX Specification: Administrator Role

## 1. Design System & Visual Language

### Typography
Maximum data density, system oversight, and technical configurations.
- **Primary Font Family:** `Inter`, sans-serif
- **Secondary Font Family:** `Roboto`, sans-serif
- **Monospace Font Family:** `JetBrains Mono`, monospace

**Typographic Scale:**
- **H1:** 32px (2rem), Bold
- **H2:** 24px (1.5rem), Semi-Bold
- **Data Label:** 12px (0.75rem), Semi-Bold, Uppercase
- **Body Default:** 14px (0.875rem), Regular
- **Monospace Data:** 13px, Regular

### Color Palette
- **Primary (Neutral Control):** `#334155` (Slate 700)
- **Background (App):** `#F1F5F9` (Slate 100)
- **Surface:** `#FFFFFF`
- **Text Primary:** `#0F172A`
- **Semantic (Alert/Delete):** `#DC2626` (Red 600)

### Spacing & Geometry
- **Spacing Scale:** High density. 2, 4, 8, 12, 16px.
- **Border Radii:** Sharp (`4px` to `8px`). Flat design, relying on borders rather than shadows.

---

## 2. Information Architecture & Navigation

### Complete Admin Sitemap
- `/admin/dashboard` - Master System Overview
- `/admin/academic-years` - Manage Academic Years
- `/admin/departments` - Manage Departments
- `/admin/years` - Manage Study Years
- `/admin/levels` - Manage Academic Levels
- `/admin/users` - Master User Management (All roles CRUD)
- `/admin/academic-structure` - Master Academic Structure viewer/editor
- `/admin/approvals` - Approval workflows
- `/admin/pending-approvals` - Queue for pending system approvals
- `/admin/news` - Unified News System management
- `/admin/announcements` - Internal system announcements
- `/admin/deletion-requests` - Handle data privacy/deletion requests
- `/admin/publish-results` - Master override for publishing grades
- `/admin/audit-logs` - System-wide audit trails
- `/admin/complaints` - View and manage user complaints/tickets
- `/admin/password-resets` - Manage manual password resets
- `/profile` - Admin Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Environment Indicator, Server Time clock, Global Search, Admin Profile.
- **Sidebar:** Multi-level accordion menu. Grouped by: Dashboard, Structure (Years, Levels, Departments), Users & Security (Users, Resets, Logs), Workflows (Approvals, Complaints, Deletion), Operations (News, Results, Templates).

### Step-by-Step User Journeys (Top 3 Core Actions)

**Action 1: Resolving a Deletion Request**
1. Navigates to `/admin/deletion-requests`.
2. Views list of users requesting account deletion.
3. Clicks a request to review context.
4. Clicks "Approve & Purge Data".
5. Double confirmation dialog requires typing the exact User ID.
6. System executes soft/hard delete and logs the action.

**Action 2: Investigating Audit Logs**
1. Navigates to `/admin/audit-logs`.
2. Uses advanced filters (Actor ID, Action Type, Date Range).
3. Log rows expand to show full JSON payloads of the database change.

---

## 3. Page-by-Page Layout & Interface Elements

### General Grid & Responsiveness
- **Desktop (1440px+):** Fluid width. 15% Sidebar, 85% Content.
- **Mobile/Tablet:** Not recommended. Warns user to switch to desktop for full functionality.

### Screen 1: Manage Academic Structure
- **Layout:** Complex nested tables or drag-and-drop tree view allowing the Admin to link Departments to Years, and Courses to Levels.

### Screen 2: Master User Management
- **Layout:** Full-screen advanced data table.
- **UI Components:** Pagination, multi-column sorting, batch actions (e.g., Bulk Reset Passwords, Bulk Change Role).

### Screen 3: Complaints Dashboard
- **Layout:** Ticketing system style. Left pane: List of tickets. Right pane: Thread view of the selected complaint with a reply box.
