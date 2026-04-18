
# Section 10 — Limitations & Future Work
### BSU Engineering Portal — Graduation Project Textbook

---

> **Engineering Honesty:** A mature engineering project acknowledges its boundaries. This chapter documents the system's known limitations with full transparency — not as failures, but as **deliberate scope decisions** and **honest assessments** of what the current architecture does not yet support. Each limitation is paired with a concrete proposed mitigation, providing a roadmap for future development.

---

---

# 10.1 KNOWN LIMITATIONS

## 10.1.1 Architectural Limitations

*Table 10.1: Known Limitations and Proposed Mitigations*

| # | Limitation | Category | Impact | Proposed Mitigation |
|---|---|---|---|---|
| **L-01** | **No horizontal scaling** | Architecture | The system runs as a single-server deployment. Under extreme load (>5,000 concurrent users), Gunicorn's 2 workers would become a bottleneck. | Add Docker Swarm or Kubernetes orchestration with multiple backend replicas behind a load balancer. Requires session store migration to Redis (see L-06). |
| **L-02** | **Monolithic Django application** | Architecture | All four Django apps (`users`, `academic`, `content`, `system`) share a single database and process. A bug in the quiz engine could affect attendance recording. | For the current scale (~2,000 students), monolithic is the correct choice. Microservices decomposition would be justified only above ~10,000 users or with independent deployment cadence requirements. |
| **L-03** | **No WebSocket / real-time updates** | Architecture | Dashboards require manual page refresh to see new data. A student must refresh to see a newly published grade. | Integrate Django Channels with a Redis channel layer for WebSocket-based push notifications. Estimated effort: 2-3 sprints. |
| **L-04** | **Synchronous Gunicorn workers** | Architecture | Long-running operations (large Excel uploads, bulk grade calculations) block a worker for the entire duration. With 2 workers, this can cause queuing. | Migrate to async workers (`uvicorn` + `ASGI`) or offload long-running tasks to Celery with Redis as the message broker. |
| **L-05** | **No database read replicas** | Infrastructure | All read and write queries hit the same MySQL instance. Heavy reporting queries (audit logs, grade analytics) compete with real-time CRUD operations. | Add a MySQL read replica for reporting queries. Django's `DATABASE_ROUTERS` setting supports routing read queries to a separate database. |
| **L-06** | **File-based session storage** | Infrastructure | Sessions are stored in the default Django database backend. This creates a session table that grows with user count and cannot be shared across multiple backend instances. | Migrate to Redis-backed sessions (`django-redis`). This also enables horizontal scaling (L-01) since all backend instances share the same session store. |

---

## 10.1.2 Feature Limitations

| # | Limitation | Category | Impact | Proposed Mitigation |
|---|---|---|---|---|
| **L-07** | **No mobile native application** | Feature | The responsive web design serves mobile users but lacks offline capability, push notifications, and native camera access for quiz images. | Develop a React Native companion app sharing the existing REST API. Alternatively, implement a Progressive Web App (PWA) with service workers for offline-first capability. |
| **L-08** | **No real-time chat / messaging** | Feature | Communication is one-directional (admin → users via announcements). There is no mechanism for students to message doctors or for peer communication. | Implement Django Channels for WebSocket-based messaging. Requires a Redis/RabbitMQ message broker and a chat UI component. |
| **L-09** | **No email/SMS notifications** | Feature | Users must log in to discover new announcements, grades, or quiz availability. There is no push notification mechanism. | Integrate Django's email backend with an SMTP provider (SendGrid, Mailgun) for email notifications. SMS requires integration with a paid provider (Twilio, Vonage). |
| **L-10** | **No advanced analytics / reporting** | Feature | The system records data but does not generate statistical reports (GPA distributions, attendance trends, department-level performance comparisons). | Build a reporting dashboard using Chart.js or Recharts on the frontend, with Django aggregation queries providing the data. |
| **L-11** | **No automated exam proctoring** | Feature | Online quizzes have no anti-cheating mechanisms beyond time limits. Students can use external resources during quizzes. | Integrate browser lockdown APIs, webcam monitoring, or third-party proctoring services. This is a complex feature requiring AI/ML capabilities. |
| **L-12** | **No multi-language support** | Feature | The interface is Arabic-only. International students or English-speaking faculty have no language option. | Implement Django's i18n framework with `gettext` translations. The React frontend would use `react-i18next` for client-side translations. |
| **L-13** | **Single quiz attempt only** | Feature | Students can only take each quiz once (`unique_together = ['student', 'quiz']`). There is no mechanism for retakes or practice modes. | Add a `max_attempts` field to the `Quiz` model and modify the `unique_together` constraint to `['student', 'quiz', 'attempt_number']`. |
| **L-14** | **No GPA calculation** | Feature | The system records individual course grades but does not compute cumulative GPA or semester GPA. | Add a GPA calculation service that aggregates `StudentGrade.total_grade()` across courses, weighted by credit hours. |

---

## 10.1.3 Operational Limitations

| # | Limitation | Category | Impact | Proposed Mitigation |
|---|---|---|---|---|
| **L-15** | **No automated backup strategy** | Operations | Database persistence relies on Docker volumes. If the host disk fails, all data is lost. | Implement scheduled MySQL dumps (`mysqldump`) to cloud storage (S3, Google Cloud Storage) via a cron job. Recommended: daily backups with 30-day retention. |
| **L-16** | **No monitoring / alerting** | Operations | There is no system health dashboard or automated alerting for container failures, high CPU usage, or database connection exhaustion. | Deploy Prometheus + Grafana for metrics collection and visualization. Add Alertmanager for email/Slack notifications on critical events. |
| **L-17** | **No HTTPS in default configuration** | Operations | The default Nginx configuration serves HTTP on port 80. HTTPS requires manual certificate setup. | Add Let's Encrypt certificate automation using Certbot or the `nginx-proxy` companion container with automatic SSL renewal. |
| **L-18** | **Manual deployment step** | Operations | After CI/CD pushes a new image, an administrator must manually run `docker-compose pull && up -d` on the production server. | Implement a webhook-triggered deployment: GitHub Actions calls a deployment endpoint on the production server, which pulls and restarts containers automatically. |

---

---

# 10.2 FUTURE WORK ROADMAP

## 10.2.1 Short-Term Improvements (1-2 Sprints)

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 🔴 High | **Automated database backups** (L-15) | 1 day | Critical data protection |
| 🔴 High | **HTTPS with Let's Encrypt** (L-17) | 1 day | Security requirement for production |
| 🟠 Medium | **Email notifications for grades** (L-09) | 3-5 days | Improved student experience |
| 🟠 Medium | **GPA calculation** (L-14) | 2-3 days | Academic reporting requirement |
| 🟡 Low | **Multi-attempt quizzes** (L-13) | 1-2 days | Enhanced assessment flexibility |

## 10.2.2 Medium-Term Improvements (3-6 Sprints)

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 🔴 High | **Analytics dashboard** (L-10) | 2-3 sprints | Data-driven academic decisions |
| 🟠 Medium | **WebSocket real-time updates** (L-03) | 2-3 sprints | Live grade/attendance notifications |
| 🟠 Medium | **Monitoring with Prometheus/Grafana** (L-16) | 1-2 sprints | Operational visibility |
| 🟠 Medium | **Celery task queue** (L-04) | 1-2 sprints | Non-blocking bulk operations |
| 🟡 Low | **Redis session store** (L-06) | 1 sprint | Horizontal scaling preparation |

## 10.2.3 Long-Term Vision (6+ Sprints)

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 🟠 Medium | **Mobile application (React Native)** (L-07) | 4-6 sprints | Native mobile experience |
| 🟠 Medium | **Messaging system** (L-08) | 3-4 sprints | Two-way communication |
| 🟡 Low | **Multi-language support** (L-12) | 2-3 sprints | International accessibility |
| 🟡 Low | **Horizontal scaling (K8s)** (L-01) | 3-4 sprints | Enterprise-grade scalability |
| 🟡 Low | **Automated proctoring** (L-11) | 4-6 sprints | Academic integrity enhancement |

## 10.2.4 Architecture Evolution Path

```
Current State (v2.8.2)                    Future State
─────────────────────                    ────────────────────
┌────────────────────┐                   ┌─────────────────────┐
│ Django Monolith    │                   │ Django + Celery      │
│ 2 Gunicorn Workers │        →          │ Async Workers        │
│ MySQL (single)     │                   │ MySQL + Read Replica │
│ File Sessions      │                   │ Redis Sessions       │
│ No Cache           │                   │ Redis Cache Layer    │
│ HTTP               │                   │ HTTPS (Let's Encrypt)│
│ Manual Deploy      │                   │ Auto-Deploy Webhook  │
│ No Monitoring      │                   │ Prometheus + Grafana │
└────────────────────┘                   └─────────────────────┘
```

*Figure 10.1: Architecture Evolution — Current State to Future State*

---

> **Design Conclusion:** The BSU Engineering Portal v2.8.2 is a **production-ready system** that solves the faculty's core problems. The limitations documented here are not deficiencies — they are the natural boundaries of a well-scoped project. Each limitation has a concrete mitigation path, and the architecture was designed from the start to accommodate these future enhancements without requiring a rewrite. The monolithic Django architecture, Docker containerization, and REST API design provide a stable foundation for incremental evolution.

---

*End of Section 10*
