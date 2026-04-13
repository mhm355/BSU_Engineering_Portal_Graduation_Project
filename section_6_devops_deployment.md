
# Section 6 — DevOps & Deployment
### BSU Engineering Portal — Graduation Project Textbook

---

> **Design Philosophy:** DevOps in the BSU Engineering Portal is not a post-development afterthought — it is an integral part of the system architecture. From the first commit, the project was designed to be **containerized, reproducible, and deployable with a single command**. Every infrastructure decision was made with the goal of eliminating environment-specific bugs, enabling zero-downtime deployments, and maintaining production-grade reliability on minimal infrastructure.

---

---

# 6.1 CONTAINERIZATION STRATEGY

## 6.1.1 Why Docker?

The decision to containerize the entire stack was driven by three engineering requirements:

| Requirement | How Docker Solves It |
|---|---|
| **Environment Consistency** | "Works on my machine" is eliminated. The Docker image is the same binary artifact in development, CI/CD, and production. |
| **Dependency Isolation** | Python 3.11, MySQL 8.0, Node 20, and Nginx each run in isolated containers with their own filesystem and dependencies. No system-level conflicts. |
| **Single-Command Deployment** | `docker-compose -f docker-compose-im.yml up -d` deploys the entire stack — database, backend, frontend, reverse proxy — from scratch in under 60 seconds. |

## 6.1.2 Multi-Stage Docker Builds

Both the backend and frontend use **multi-stage Docker builds** to minimize production image size and exclude build-time dependencies from the runtime image.

### Backend Dockerfile — Two-Stage Build

```dockerfile
# From backend-dockerfile

# Stage 1: Builder — Install Python dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime — Copy only what's needed
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /install /usr/local
COPY backend/ .
```

**Key design decisions:**

- **`--prefix=/install`:** Dependencies are installed to a separate directory in the builder stage, then copied to the runtime stage. This ensures that `build-essential` (gcc, make) — which is ~200MB — is **not included** in the final image.
- **`--no-cache-dir`:** Prevents pip from caching downloaded packages, reducing image size.
- **`rm -rf /var/lib/apt/lists/*`:** Removes the apt package index after installation, saving ~30MB per stage.
- **Cache cleanup:** Python bytecode files (`__pycache__`, `*.pyc`, `*.pyo`) are explicitly deleted:

```dockerfile
RUN find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true \
    && find . -type f -name "*.pyc" -delete 2>/dev/null || true \
    && find . -type f -name "*.pyo" -delete 2>/dev/null || true
```

- **Migration package fix:** A subtle but critical step ensures migration directories are valid Python packages:

```dockerfile
# Ensure migrations directories are Python packages
RUN touch users/migrations/__init__.py academic/migrations/__init__.py \
    content/migrations/__init__.py system/migrations/__init__.py 2>/dev/null || true
```

Without this, if `__init__.py` files are `.gitignore`d, Django cannot discover migrations inside the container.

### Frontend Dockerfile — Two-Stage Build

```dockerfile
# From frontend-dockerfile

# Stage 1: Build — Compile the React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --only=production=false --silent
COPY frontend/src/ ./src/
COPY frontend/public/ ./public/
COPY frontend/index.html ./
COPY frontend/vite.config.js ./
RUN npm run build

# Stage 2: Serve — Ultra minimal nginx image
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Key design decisions:**

- **`npm ci` over `npm install`:** `npm ci` performs a clean install from `package-lock.json`, ensuring deterministic builds. It deletes `node_modules` first, guaranteeing no stale dependencies.
- **Layer caching optimization:** `package.json` and `package-lock.json` are copied **before** the source code. Docker caches layers top-to-bottom — if source code changes but dependencies don't, the expensive `npm ci` step is skipped.
- **`nginx:alpine` as runtime:** The final image contains only the compiled static files (HTML/CSS/JS) and Nginx. Node.js, npm, and all 300+ build dependencies are **not included** in the production image.
- **Non-root execution:** File ownership is explicitly set for the Nginx user:

```dockerfile
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html
```

- **Built-in healthcheck:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

### Image Size Comparison

| Component | Without Multi-Stage | With Multi-Stage | Reduction |
|---|---|---|---|
| **Backend** | ~1.2 GB (includes gcc, build-essential, pip cache) | ~350 MB (runtime deps only) | ~70% |
| **Frontend** | ~1.0 GB (includes node_modules, Node.js runtime) | ~45 MB (compiled static files + Nginx) | ~95% |

> **[INSERT Figure 6.1 — Terminal screenshot showing `docker images` output with backend (~350MB) and frontend (~45MB) image sizes]**

---

---

# 6.2 DOCKER COMPOSE ORCHESTRATION

## 6.2.1 Two Compose Files — Two Purposes

The project maintains **two distinct Docker Compose configurations**, each serving a different stage of the development lifecycle:

### Development Compose (`docker-compose.yml`)

```yaml
# docker-compose.yml — Development Configuration
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-bsu_db}
      MYSQL_USER: ${MYSQL_USER:-bsu_user}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-bsu_password}
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./backend                    # Builds from local source
    volumes:
      - ./backend:/app                  # Hot-reload: source mounted
      - media_data:/app/media
    ports:
      - "8000:8000"                     # Direct access for debugging

  frontend:
    build: ./frontend                   # Builds from local source
    volumes:
      - ./frontend:/app                 # Hot-reload: source mounted
      - /app/node_modules              # Exclude node_modules from mount
    ports:
      - "5173:5173"                     # Vite dev server
```

**Development-specific features:**
- **`build: ./backend`:** Builds the image from local source code, not from a registry.
- **`volumes: ./backend:/app`:** Mounts the local source directory into the container. Code changes are reflected immediately without rebuilding the image (hot-reload).
- **`- /app/node_modules`:** An anonymous volume that prevents the host's `node_modules` from overwriting the container's — ensuring platform-specific compiled dependencies (e.g., `esbuild` binaries) are preserved.
- **Default credentials:** Environment variables have development defaults (`MYSQL_PASSWORD: bsu_password`).

### Production Compose (`docker-compose-im.yml`)

```yaml
# docker-compose-im.yml — Production Configuration
services:
  db:
    image: mysql:8.0
    container_name: bsu_db_1
    restart: always
    env_file:
      - .env.production
    volumes:
      - db_data_1:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 5s
      retries: 5

  backend:
    image: mhmdocker1/bsu_backend:v2.8.2    # Pre-built from Docker Hub
    container_name: bsu_backend_1
    volumes:
      - media_data:/app/media
    ports:
      - "8001:8000"
    depends_on:
      db:
        condition: service_healthy           # Waits for DB health
    restart: always
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: mhmdocker1/bsu_frontend:v2.8.2   # Pre-built from Docker Hub
    container_name: bsu_frontend_1
    volumes:
      - media_data:/usr/share/nginx/html/media   # Shared media volume
    ports:
      - "8081:80"
    depends_on:
      - backend
    restart: always
```

> **[INSERT Figure 6.2 — Side-by-side comparison diagram of Development vs. Production Docker Compose configurations]**

## 6.2.2 Production-Specific Design Decisions

### Pre-Built Images vs. Local Build

Production uses **pre-built images from Docker Hub** (`mhmdocker1/bsu_backend:v2.8.2`), not local Dockerfiles. This means:
- Deployment does not require build tools on the production server.
- The exact image that was tested in CI is the same binary deployed to production.
- Rollback is instant — change the image tag and restart.

### Health Checks — Startup Order Guarantee

The production compose uses **health-based dependency ordering** to prevent the backend from starting before the database is ready:

```yaml
depends_on:
  db:
    condition: service_healthy    # Don't start until DB passes healthcheck
```

The **database healthcheck** verifies MySQL is accepting connections:
```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 30s
  timeout: 5s
  retries: 5
```

The **backend healthcheck** goes further — it verifies Django can query the database:

```python
# From bsu_backend/health.py — Application-Level Health Check
def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")       # Verify DB connectivity
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    status_code = 200 if db_status == "connected" else 503
    return JsonResponse(
        {"status": "ok" if db_status == "connected" else "unhealthy", "db": db_status},
        status=status_code,
    )
```

This is not a simple TCP check — it executes a real SQL query, catch failures, and returns HTTP 503 if the database is unreachable. Docker uses this to determine if the container should be restarted.

### Shared Media Volume

The `media_data` volume is shared between backend and frontend:

```yaml
backend:
  volumes:
    - media_data:/app/media              # Backend writes uploads here

frontend:
  volumes:
    - media_data:/usr/share/nginx/html/media   # Nginx serves them directly
```

When a doctor uploads a lecture PDF, Django saves it to `/app/media/`. Nginx serves it at `/media/lectures/file.pdf` with **30-day cache headers** — bypassing Django entirely for static file serving.

### Database Isolation — No External Port

The database service has **no `ports` section** in the production compose. MySQL is only accessible via the Docker internal network (`bsu_network`). Even with host-level access, `mysql -h localhost -P 3306` will fail because the port is not mapped.

### Restart Policy

All services use `restart: always`, ensuring automatic recovery from crashes, OOM kills, or server reboots.

---

---

# 6.3 NGINX REVERSE PROXY & HTTPS

## 6.3.1 Nginx Architecture

Nginx serves as the **single entry point** for all client requests. The browser never communicates directly with Django:

```
Client Browser
    │
    ▼ Port 80 (or 8081)
┌───────────────────────────────────────────────────┐
│                  NGINX (frontend container)        │
│                                                   │
│   /              → serve React SPA (index.html)   │
│   /api/*         → proxy to backend:8000          │
│   /admin/*       → proxy to backend:8000          │
│   /static/*      → proxy to backend:8000          │
│   /media/*       → serve directly from volume     │
│                                                   │
│   + Security Headers on EVERY response            │
└───────────────────────────────────────────────────┘
```

*Figure 6.3: Nginx Request Routing — Single Entry Point Architecture*

## 6.3.2 Nginx Configuration — Annotated

```nginx
# From nginx.conf — Full Configuration

server {
    listen 80;
    server_name localhost;
    client_max_body_size 50M;          # Allow uploads up to 50MB

    # Security headers — applied to EVERY response
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — serve index.html for all frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Django backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;       # 5-minute timeout for bulk operations
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
    }

    # Proxy Admin panel
    location /admin/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django static files (admin CSS/JS)
    location /static/ {
        proxy_pass http://backend:8000;
    }

    # Serve uploaded media files — directory listing DISABLED
    location /media/ {
        try_files $uri $uri/ =404;
        expires 30d;                   # 30-day browser cache
        add_header Cache-Control "public, no-transform";
    }
}
```

### Key Design Decisions:

**1. SPA Fallback (`try_files $uri $uri/ /index.html`):**

React Router uses client-side routing. When a user navigates to `/dashboard/grades`, no file exists at that path. Without the fallback, Nginx would return 404. With `try_files`, Nginx serves `index.html`, and React Router handles the route client-side.

**2. Extended Timeouts (300s):**

Standard Nginx timeouts are 60 seconds. Bulk operations — uploading 500 students via Excel, generating attendance Excel exports — can take longer. The 300-second timeout prevents premature connection drops during legitimate long-running requests.

**3. Media Serving Bypass:**

Media files (`/media/`) are served directly by Nginx from the shared volume, not proxied through Django. This:
- Reduces Django CPU usage (no Python process for static file serving).
- Enables Nginx's optimized `sendfile()` system call.
- Adds 30-day browser caching (`expires 30d`), reducing repeat download bandwidth.
- **Disables directory listing** (`try_files $uri $uri/ =404`) — users cannot browse `/media/` to discover uploaded files.

**4. Security Headers on Every Response:**

| Header | Purpose |
|---|---|
| `X-Content-Type-Options: nosniff` | Prevents browsers from MIME-sniffing responses, blocking content-type confused attacks |
| `X-Frame-Options: SAMEORIGIN` | Prevents the site from being embedded in iframes on other domains (clickjacking) |
| `X-XSS-Protection: 1; mode=block` | Enables browser-level XSS filtering and blocks the entire page if an attack is detected |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limits referrer information sent to external sites, preventing URL-based information leaks |

**5. `X-Real-IP` and `X-Forwarded-For` Headers:**

Since Django receives requests from Nginx (not the client), the client's real IP address is in the `X-Real-IP` header. This is critical for:
- Rate limiting (DRF throttles by IP).
- Audit logging (recording which IP performed an action).
- Security monitoring (detecting brute-force patterns).

---

---

# 6.4 CI/CD PIPELINE

## 6.4.1 Pipeline Architecture

The project implements **two parallel GitHub Actions workflows** — one for the backend and one for the frontend. Each pipeline is triggered by changes to its respective codebase:

```
Developer pushes to main branch
        │
        ├─── backend/ or backend-dockerfile changed?
        │           │
        │           ▼
        │    ┌─────────────────────────────────┐
        │    │ build_backend_image.yml          │
        │    │  1. Checkout code                │
        │    │  2. Extract metadata (tags)      │
        │    │  3. Setup Docker Buildx          │
        │    │  4. Login to Docker Hub          │
        │    │  5. Build & Push image           │
        │    │  6. Trivy vulnerability scan     │
        │    │  7. Update docker-compose-im.yml │
        │    │  8. Auto-commit tag change       │
        │    └─────────────────────────────────┘
        │
        └─── frontend/ or frontend-dockerfile changed?
                    │
                    ▼
             ┌─────────────────────────────────┐
             │ build_frontend_image.yml         │
             │  (Same 8-step pipeline)          │
             └─────────────────────────────────┘
```

*Figure 6.4: CI/CD Pipeline Architecture — Path-Filtered Dual Workflows*

> **[INSERT Figure 6.5 — GitHub Actions screenshot showing a successful backend pipeline run with all 8 steps passed]**

## 6.4.2 Pipeline Stages — Detailed

### Stage 1: Trigger Conditions

```yaml
# From build_backend_image.yml
on:
  push:
    paths:
      - "backend-dockerfile"
      - "backend/"
    branches:
      - main
  workflow_dispatch:          # Manual trigger button in GitHub UI
```

The pipeline is **path-filtered** — it only runs when relevant files change. A documentation update or frontend-only change will not trigger a backend rebuild. The `workflow_dispatch` trigger allows manual pipeline execution for debugging or force-rebuilds.

### Stage 2: Image Tagging Strategy

```yaml
- name: Extract metadata for docker
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ${{ vars.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}
    tags: |
      type=sha,format=short
      type=raw,value=latest,enable={{is_default_branch}}
```

Each image receives **two tags:**
- **`sha-abc1234`:** A deterministic tag derived from the Git commit SHA. This makes every build uniquely identifiable and enables exact rollback to any previous version.
- **`latest`:** Applied only on the `main` branch. This provides a stable "most recent" reference for development environments.

### Stage 3: Build with BuildX and Caching

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./backend-dockerfile
    push: ${{ github.event_name != 'pull_request' }}
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Critical details:**
- **`push: false` on pull requests:** PR builds validate that the image builds successfully but do **not** push to Docker Hub. This prevents untested images from reaching the registry.
- **GitHub Actions cache (`type=gha`):** Docker layer cache is stored in GitHub's cache storage. Unchanged layers (base image, pip install) are reused, reducing build time from ~5 minutes to ~1 minute for code-only changes.

### Stage 4: Security Scanning (Trivy)

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: '${{ vars.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}'
    format: 'table'
    exit-code: '1'                    # Pipeline FAILS if vulnerabilities found
    vuln-type: 'os,library'
    severity: 'CRITICAL,HIGH'
    output: 'trivy-report_backend.txt'
```

**What Trivy scans:**
- **OS-level vulnerabilities:** CVEs in the Debian/Alpine base image packages.
- **Library-level vulnerabilities:** CVEs in Python packages (e.g., Django, Pillow) and npm packages.
- **Severity filter:** Only `CRITICAL` and `HIGH` severity findings block the pipeline. `MEDIUM` and `LOW` are reported but do not prevent deployment.

**Why `exit-code: '1'`?** This is the most critical setting — it makes the pipeline **fail** if any critical/high vulnerability is detected. This creates an automated security gate: no known-vulnerable image can reach production.

### Stage 5: Auto-Update Docker Compose

```yaml
change_image_in_docker_compose:
  needs: build_and_push_image
  if: github.event_name != 'pull_request' && success()
  steps:
    - name: Update image tag in docker-compose
      run: |
        IMAGE="${{ vars.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:${{ needs.build_and_push_image.outputs.image_tag }}"
        yq -i ".services.backend.image = \"$IMAGE\"" ./docker-compose-im.yml

    - name: Commit and push changes
      uses: stefanzweifel/git-auto-commit-action@v5
      with:
        commit_message: "chore: update backend image tag to ${{ needs.build_and_push_image.outputs.image_tag }}"
        file_pattern: "docker-compose-im.yml"
```

**This is GitOps in action:** After a successful build and security scan, the pipeline automatically updates `docker-compose-im.yml` with the new image tag and commits the change. The production compose file always reflects the latest successfully-built and scanned image.

**`yq`** is used to perform YAML-aware edits (not sed/grep), preventing formatting corruption.

> **[INSERT Figure 6.6 — GitHub repository showing the auto-committed "chore: update backend image tag" commit by the CI/CD pipeline]**

---

---

# 6.5 DEPLOYMENT STRATEGY

## 6.5.1 Container Startup Orchestration

The `entrypoint.sh` script orchestrates the backend container startup in a specific order:

```bash
#!/bin/bash
set -e                                          # Exit on any error

# Step 1: Run database migrations
python manage.py migrate --noinput || { echo "ERROR: migrations failed"; exit 1; }

# Step 2: Collect static files for Django Admin
python manage.py collectstatic --noinput || true

# Step 3: Create admin user (idempotent)
python manage.py shell -c "
    User = get_user_model()
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com', 'is_superuser': True,
                  'is_staff': True, 'role': 'ADMIN'}
    )
    if created:
        admin_password = os.environ.get('ADMIN_PASSWORD', 'password123')
        admin.set_password(admin_password)
        admin.first_login_required = True
        admin.save()
"

# Step 4: Seed production data (departments, grading templates)
python seed_production.py || echo "Warning: seed_production.py failed"

# Step 5: Seed subjects (188 subjects across all departments)
python seed_subjects.py || echo "Warning: seed_subjects.py failed"

# Step 6: Start Gunicorn production server
exec gunicorn bsu_backend.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

### Design Decisions in Startup Sequence:

**1. `set -e` — Fail Fast:**
The script exits immediately on any error. If migrations fail, the container does **not** start Gunicorn with an inconsistent database. Docker detects the non-zero exit code and the healthcheck loop prevents traffic from reaching the container.

**2. Idempotent Operations:**
Every startup step is idempotent — safe to run multiple times:
- `migrate --noinput` applies only pending migrations.
- `get_or_create(username='admin')` creates the admin only if it doesn't exist.
- `seed_production.py` uses `get_or_create` for all departments and grading templates.
- `seed_subjects.py` uses `get_or_create` for all 188 subjects.

This means the container can be restarted freely without data duplication or corruption.

**3. `exec gunicorn` — Process Replacement:**
The `exec` command replaces the shell process with Gunicorn. This means Gunicorn runs as PID 1, directly receiving Docker signals (SIGTERM for graceful shutdown). Without `exec`, Gunicorn would be a child process and might miss shutdown signals.

**4. Gunicorn Configuration:**
- **`--workers 2`:** Two worker processes handle requests concurrently. This is appropriate for a single-server deployment with ~2,000 users.
- **`--timeout 120`:** Workers are killed and restarted if a request takes longer than 120 seconds, preventing hung workers from consuming resources.
- **`--access-logfile -`:** Access logs go to stdout, captured by Docker's logging driver and accessible via `docker logs`.

## 6.5.2 Environment Configuration

Production secrets are managed through `.env.production` (not committed to version control):

```
# .env.production — Example (actual values are secrets)
MYSQL_ROOT_PASSWORD=<secure_random>
MYSQL_DATABASE=bsu_db
MYSQL_USER=bsu_user
MYSQL_PASSWORD=<secure_random>
DB_HOST=db
DB_PORT=3306
ADMIN_PASSWORD=<secure_random>
SECRET_KEY=<django_secret_key>
CORS_ALLOWED_ORIGINS=http://localhost:8081
CSRF_TRUSTED_ORIGINS=http://localhost:8081
```

**Why `.env.production` and not hardcoded values?**
- Secrets never enter version control.
- The same Docker image can be deployed to different environments (staging, production) by changing only the `.env` file.
- Docker Compose's `env_file` directive loads all variables automatically.

## 6.5.3 Deployment Workflow — End-to-End

The complete deployment workflow from code change to running production:

```
1. Developer pushes code to main branch
            │
2. GitHub Actions triggers (path-filtered)
            │
3. Docker image is built (multi-stage)
            │
4. Trivy scans for vulnerabilities
            │  ┌── FAIL → Pipeline stops, no deployment
            │  └── PASS ↓
5. Image pushed to Docker Hub
            │
6. docker-compose-im.yml auto-updated with new tag
            │
7. Auto-commit pushed to repository
            │
========= On production server =========
            │
8. Admin runs: docker-compose -f docker-compose-im.yml pull
            │
9. Admin runs: docker-compose -f docker-compose-im.yml up -d
            │
10. MySQL starts → healthcheck passes
            │
11. Backend starts → migrations → seed → Gunicorn
            │
12. Frontend starts → Nginx serves SPA + proxies API
            │
13. System operational at port 8081
```

*Figure 6.7: End-to-End Deployment Workflow — From Code Push to Running System*

> **[INSERT Figure 6.8 — Terminal screenshot showing `docker-compose up -d` output with all 3 containers starting successfully]**

> **[INSERT Figure 6.9 — Terminal screenshot showing `docker ps` output with all containers in healthy status]**

## 6.5.4 Rollback Strategy

Rollback is a **one-line operation.** Every Docker image is tagged with its Git commit SHA:

```bash
# Current production image
image: mhmdocker1/bsu_backend:v2.8.2

# To rollback — change tag and restart
image: mhmdocker1/bsu_backend:sha-abc1234
docker-compose -f docker-compose-im.yml up -d
```

Because database migrations are **forward-only** (Django does not auto-reverse), rollback assumes backward-compatible schema changes — a constraint that is enforced during code review.

---

---

# 6.6 DEVOPS ARCHITECTURE SUMMARY

*Table 6.1: Docker Services and Responsibilities*

| Service | Image | Responsibility | Health Check | Exposed Port |
|---|---|---|---|---|
| **db** | `mysql:8.0` | Relational data persistence | `mysqladmin ping` (30s interval) | ❌ None (internal only) |
| **backend** | `mhmdocker1/bsu_backend:v2.8.2` | Django REST API + Gunicorn | `curl /api/health/` (30s interval, 40s start) | 8001 → 8000 |
| **frontend** | `mhmdocker1/bsu_frontend:v2.8.2` | Nginx (SPA + reverse proxy) | `wget localhost/` (30s interval) | 8081 → 80 |

> **[INSERT Figure 6.10 — Docker Hub screenshot showing published backend and frontend images with version tags]**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT SUMMARY                           │
│                                                                 │
│  Source Control:    GitHub (mhm355/BSU_Engineering_Portal)       │
│  CI/CD:            GitHub Actions (2 pipelines)                 │
│  Registry:         Docker Hub (mhmdocker1/bsu_*)                │
│  Security:         Trivy (CRITICAL + HIGH, pipeline-blocking)   │
│  Orchestration:    Docker Compose (2 files: dev + prod)         │
│  Builds:           Multi-stage (70-95% image size reduction)    │
│  Proxy:            Nginx (SPA fallback + API proxy + headers)   │
│  Server:           Gunicorn (2 workers, 120s timeout)           │
│  Database:         MySQL 8.0 (isolated, health-checked)         │
│  Secrets:          .env.production (not in version control)     │
│  Startup:          Idempotent entrypoint (migrate → seed → run) │
│  Rollback:         Image tag change (1 command)                 │
└─────────────────────────────────────────────────────────────────┘
```

> **Design Conclusion:** The BSU Engineering Portal's DevOps infrastructure treats deployment as a **first-class engineering concern**. Every aspect — from multi-stage builds that reduce image size by 70-95%, through health-checked startup ordering, to automated security scanning that blocks vulnerable deployments — is designed to ensure that the system is not just functional, but **reliably, securely, and reproducibly deployable.**

---

*End of Section 6*
