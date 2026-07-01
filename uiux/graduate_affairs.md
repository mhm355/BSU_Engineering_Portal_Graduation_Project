# UI/UX Specification: Graduate Affairs Role

## 1. Design System and Visual Language

### Typography
Requires high clarity for managing large volumes of alumni records, event coordination, and career tracking.
- **Primary Font Family:** `Inter`, sans-serif
- **Secondary Font Family:** `Roboto`, sans-serif

### Color Palette
- **Primary:** `#00BCD4` (Cyan 500) - Distinct from Student Affairs (Teal) and Doctors (Green).
- **Secondary:** `#0097A7` (Cyan 700)
- **Background:** `#E0F7FA` (Cyan 50) for sidebars to establish context; `#FFFFFF` for main surfaces.
- **Semantic Actions:** `#3B82F6` for standard actions, `#10B981` for successful uploads, `#EF4444` for destructive or blocking actions.

---

## 2. Information Architecture and Navigation

### Complete Graduate Affairs Sitemap
- `/graduate-affairs/dashboard` - Main Dashboard Overview and Analytics
- `/graduate-affairs/clearance` - Manage graduation clearance checklist
- `/graduate-affairs/requests` - Process document requests (transcripts, temp certificates)
- `/graduate-affairs/certificates` - Bulk Official Certificate Uploads
- `/graduate-affairs/companies` - Manage partner companies
- `/graduate-affairs/jobs` - Manage job postings and internships
- `/graduate-affairs/events` - Organize training events and workshops
- `/graduate-affairs/reports` - Export alumni tracking reports
- `/profile` - Profile settings
- `/change-password` - Security settings

### Navigation Flow Map
- **Global Header:** Contains Department context and Global Search for National ID.
- **Sidebar:** Sections grouped by logical operation: Operations (Dashboard, Clearance, Requests, Certificates), Career Portal (Companies, Jobs, Events), and Analytics (Reports).

### Step-by-Step User Journeys (Top Core Actions)

**Action 1: Processing Graduation Clearance**
1. User navigates to `/graduate-affairs/clearance`.
2. Searches for a student by National ID or Student Code.
3. System displays the multi-step checklist (Library, Finance, Labs, Housing).
4. User updates clearance status based on physical department sign-offs.
5. Once 100% complete, the system marks the student as `CLEARED`.

**Action 2: Posting a Job Opportunity**
1. User navigates to `/graduate-affairs/jobs`.
2. Clicks "Add Job Posting".
3. Selects a partner Company from the dropdown.
4. Fills out Title, Description, Requirements, and Deadline.
5. Clicks "Publish". The job immediately becomes visible to students and alumni in the Career Portal.

**Action 3: Uploading Official Certificates**
1. User navigates to `/graduate-affairs/certificates`.
2. Uploads a ZIP file containing numbered PDF certificates.
3. System processes the ZIP and maps the certificates to the respective student profiles.
4. System automatically generates a public verification code for each certificate.

---

## 3. Page-by-Page Layout and Interface Elements

### Screen 1: Dashboard
- **Layout:** Metric cards across the top (Pending Requests, Active Job Postings, Upcoming Events).
- **UI Components:** Quick links to Clearance and Document Processing. Chart showing alumni employment rates (if tracked).

### Screen 2: Document Requests (`/requests`)
- **Layout:** Data table showing Pending, Processing, and Completed requests.
- **UI Components:** Action buttons to "Approve", "Upload Document", or "Reject with Reason".

### Screen 3: Career Portal Management
- **Layout:** Tabbed interface separating Companies, Job Postings, and Applicants.
- **UI Components:** Forms for Company details (with Logo upload), Rich-text editors for Job descriptions.
