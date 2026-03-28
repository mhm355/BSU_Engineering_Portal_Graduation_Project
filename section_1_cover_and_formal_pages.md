
# Section 1 — Cover & Formal Pages
### BSU Engineering Portal — Graduation Project Textbook

---

> **⚠️ AUTHOR'S NOTE:**
> Fields marked with `[FILL IN]` require your personal information (names, supervisor, exact academic year). All technical descriptions below are derived directly from your codebase and are accurate.

---

---

# TITLE PAGE

&nbsp;

&nbsp;

<div align="center">

**FACULTY OF ENGINEERING**
**BENI-SUEF UNIVERSITY**

&nbsp;

---

## BSU Engineering Portal

### A Role-Based Academic Information System for the Faculty of Engineering

&nbsp;

*Graduation Project submitted in partial fulfillment of the requirements for the degree of*
*Bachelor of Engineering*

&nbsp;

---

**Submitted by:**

| Student Name | Department |
|---|---|
| [FILL IN — Student 1 Full Name] | [FILL IN — e.g., Computer & Systems Engineering] |
| [FILL IN — Student 2 Full Name] | [FILL IN] |
| [FILL IN — Student 3 Full Name] | [FILL IN] |
| [FILL IN — Student 4 Full Name] | [FILL IN] |

&nbsp;

**Under the Supervision of:**
[FILL IN — Dr. / Prof. Supervisor Full Name]
[FILL IN — Title, Department, Faculty of Engineering, Beni-Suef University]

&nbsp;

---

**Department of [FILL IN]**
**Faculty of Engineering — Beni-Suef University**
**Academic Year: [FILL IN — e.g., 2024 / 2025]**

</div>

---

---

# ABSTRACT

The Faculty of Engineering at Beni-Suef University manages complex administrative and academic workflows spanning multiple stakeholder groups: students, faculty members (doctors), student affairs staff, and administrative personnel. Prior to this project, these workflows were fragmented across manual processes and disconnected tools — student records maintained in spreadsheets, grade collection conducted via physical paper forms, and attendance tracking left to individual instructors with no central repository. This fragmentation introduced compounding problems: data inconsistency, delayed grade publication, the absence of a verifiable audit trail, and a complete lack of real-time access for students to their own academic records.

This graduation project presents the **BSU Engineering Portal** — a production-grade, role-based web platform designed to digitize, centralize, and secure the full academic lifecycle of the Faculty of Engineering. The system is built on a decoupled architecture: a **Django REST Framework** backend serving a structured REST API, a **React** (Vite) frontend delivering a dynamic single-page application, a **MySQL** relational database for persistent and structured academic data, and an **Nginx** reverse proxy managing request routing and serving static assets in production. The entire stack is containerized using **Docker** and orchestrated with **Docker Compose**, enabling environment-agnostic deployment from a developer laptop to a cloud server with a single command.

The platform implements a five-role authorization model — **Admin, Doctor, Student, Student Affairs, and Staff Affairs** — each with a strictly isolated dashboard, enforced through a custom Role-Based Access Control (RBAC) layer built on top of session-based authentication and CSRF protection. Core functional capabilities include: bulk student and staff registration via Excel import, real-time attendance recording and export, a multi-type online quiz engine supporting MCQ and essay formats, a structured grade management pipeline with staff approval workflows, comprehensive announcement and contact systems, and a full audit log of all administrative actions.

The result is a platform that replaces a paper-and-spreadsheet environment with a secure, scalable, and auditable digital system — measurably improving data accuracy, administrative response time, and the student experience of the Faculty of Engineering at Beni-Suef University.

---

---

# ACKNOWLEDGMENTS

We would like to express our sincere gratitude to all who contributed to the successful completion of this project.

First and foremost, we thank our supervisor, **[FILL IN — Supervisor Name]**, for the continuous guidance, technical insight, and constructive feedback throughout the duration of this project. Their mentorship was instrumental in shaping the system's design and ensuring its academic rigor.

We extend our appreciation to the Faculty of Engineering at Beni-Suef University for providing the academic environment and institutional context that motivated this work. The administrative challenges we observed within the faculty were the primary driver for the engineering solutions we developed.

We are grateful to the open-source communities behind **Django**, **React**, **Docker**, and all the libraries that formed the foundation of this system. Software engineering at scale is a collaborative discipline, and this project stands on the shoulders of thousands of contributors worldwide.

Finally, we thank our families for their patience, encouragement, and unwavering support throughout the long hours that this project demanded.

---

# DEDICATION

*To every student who ever waited weeks for a grade that could have been published the same day.*

*To every faculty administrator who spent hours reconciling Excel sheets that a database could reconcile in milliseconds.*

*To the principle that engineering should solve real problems for real people.*

*This work is dedicated to the Faculty of Engineering at Beni-Suef University — may it serve you well.*

---

---

# TABLE OF CONTENTS

| Chapter | Title | Page |
|---|---|---|
| **1** | **Cover & Formal Pages** | |
| | Abstract | |
| | Acknowledgments & Dedication | |
| | Table of Contents | |
| | List of Figures | |
| | List of Tables | |
| **2** | **Executive Summary / Introduction** | |
| | 2.1 Problem Statement | |
| | 2.2 Motivation | |
| | 2.3 Proposed Solution | |
| | 2.4 Project Scope | |
| **3** | **Problem Definition & Requirements Engineering** | |
| | 3.1 Current Situation & Stakeholders | |
| | 3.2 Proposed Methodology | |
| | 3.3 Functional Requirements | |
| | 3.4 Non-Functional Requirements | |
| | 3.5 Use Case Definitions | |
| **4** | **System & Architecture Design** | |
| | 4.1 Architecture Overview | |
| | 4.2 System Modeling (UML) | |
| | 4.3 Database Design | |
| | 4.4 Backend Design | |
| | 4.5 Frontend & UI/UX Design | |
| **5** | **Security Design** | |
| | 5.1 Authentication & Session Management | |
| | 5.2 Role-Based Authorization (RBAC) | |
| | 5.3 Password Security | |
| | 5.4 CSRF & XSS Protection | |
| | 5.5 Rate Limiting & Input Validation | |
| **6** | **DevOps & Deployment** | |
| | 6.1 Containerization Strategy | |
| | 6.2 Docker Compose Orchestration | |
| | 6.3 Nginx Reverse Proxy & HTTPS | |
| | 6.4 CI/CD Pipeline | |
| | 6.5 Deployment Strategy | |
| **7** | **Testing & Quality Assurance** | |
| | 7.1 Unit & Integration Testing | |
| | 7.2 Manual Test Cases | |
| | 7.3 Load & Performance Benchmarking | |
| **8** | **Performance Considerations** | |
| | 8.1 Database Query Optimization | |
| | 8.2 Caching Strategy | |
| | 8.3 Pagination & Lazy Loading | |
| **9** | **Results & Evaluation** | |
| | 9.1 System Screenshots & Feature Analysis | |
| | 9.2 Before vs. After Comparison | |
| **10** | **Limitations & Future Work** | |
| **11** | **Conclusion & References** | |

---

# LIST OF FIGURES

| Figure | Caption | Page |
|---|---|---|
| Figure 4.1 | System Architecture — Three-Tier Deployment Diagram | |
| Figure 4.2 | Entity-Relationship (ER) Diagram for Academic Data Layer | |
| Figure 4.3 | Sequence Diagram — Student Login & First-Login Password Flow | |
| Figure 4.4 | Sequence Diagram — Grade Submission and Staff Approval Pipeline | |
| Figure 4.5 | Activity Diagram — Quiz Lifecycle (Creation → Attempt → Grading) | |
| Figure 4.6 | React Component Hierarchy — Dashboard Layout | |
| Figure 5.1 | RBAC Permission Matrix — Roles vs. Capabilities | |
| Figure 5.2 | Authentication Flow — Session Cookie & CSRF Handshake | |
| Figure 6.1 | Docker Compose Service Topology | |
| Figure 6.2 | Nginx Reverse Proxy Request Routing Diagram | |
| Figure 9.1 | Admin Dashboard — User and Announcement Management | |
| Figure 9.2 | Doctor Dashboard — Course Offering and Grade Entry View | |
| Figure 9.3 | Student Dashboard — Grade and Schedule Portal | |
| Figure 9.4 | Quiz Engine — Student MCQ Attempt Interface | |
| Figure 9.5 | Staff Affairs — Batch Excel Grade Upload and Audit Log | |

---

# LIST OF TABLES

| Table | Caption | Page |
|---|---|---|
| Table 3.1 | Stakeholder Summary and System Interaction Points | |
| Table 3.2 | Functional Requirements — IEEE FR-XX Format | |
| Table 3.3 | Non-Functional Requirements — Quality Attributes | |
| Table 3.4 | Use Case Summary — Actors and Primary Use Cases | |
| Table 4.1 | Technology Stack Summary and Justification | |
| Table 4.2 | Core Database Tables — Primary Key, Foreign Key, and Index Strategy | |
| Table 4.3 | API Endpoint Groups by Django Application | |
| Table 5.1 | Role-Based Permission Matrix | |
| Table 5.2 | Rate Limiting Thresholds by User Type | |
| Table 6.1 | Docker Services and Responsibilities | |
| Table 7.1 | Manual Test Case Register | |
| Table 9.1 | Before vs. After — Administrative Workflow Comparison | |
| Table 10.1 | Known Limitations and Proposed Mitigations | |
