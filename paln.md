# System Engineering Plan — Wedding Invitation Platform

Purpose: provide a concise, implementation-ready overview so an engineer or an automated model can understand the system, its components, data model, APIs, ports, and deployment choices.

**High-level architecture**
- Public frontend (Invitation website) — static + client SPA for guests.
- Couple Admin frontend — authenticated SPA for couples.
- Vendor Portal frontend — authenticated SPA for vendors.
- Backend API(s) — REST (and optional GraphQL) microservice(s) for business logic.
- Super Admin backend/UI — admin-only interface and APIs.
- Datastore(s) — primary relational DB (Postgres), optional Redis for cache/session, object storage (S3) for images.
- Background workers & queue — processing tasks (emails, image processing, cleanup) via RabbitMQ or Redis Streams.

**Services & responsibilities**
- API Gateway / Load Balancer: TLS termination, routing, rate-limiting, CORS, auth passthrough.
- Auth Service: issues and validates JWTs, supports OAuth2 (optional), password resets, 2FA hooks.
- Wedding Service (core): manages weddings, settings, templates, site settings.
- Guest Service: guests, RSVPs, tokens, RSVP history.
- Vendor Service: vendor profiles, listings, approvals, bookings.
- Billing Service: plans, subscriptions, webhooks (Stripe/PayPal).
- Media Service (signed uploads): generates signed S3 URLs and validates uploads.
- Admin Service: Super Admin operations, moderation, data cleanup tasks.

**Databases & schema (summary)**
- Primary DB: PostgreSQL (hosted). Key tables:
  - users (id, role [couple, vendor, super_admin], email, password_hash, created_at)
  - weddings (id, user_id, slug, title, date, timezone, settings JSON)
  - guests (id, wedding_id, name, side, contact_whatsapp, email, max_members)
  - rsvps (id, guest_id, wedding_id, status, count, preferences JSON, updated_at)
  - templates (id, name, metadata JSON)
  - vendors (id, user_id, profile JSON, status)
  - listings (id, vendor_id, title, price, availability JSON)
  - bookings (id, listing_id, wedding_id, status, payment_id)
  - payments (id, provider, amount, status, webhook_payload)
  - gallery_images (id, wedding_id/vendor_id, url, meta)
  - audit_logs (id, actor, action, target, data, timestamp)

- Cache & transient store: Redis for session counters, rate-limits, short-lived tokens.

**API design (examples)**
- Authentication
  - POST /auth/login -> { token }
  - POST /auth/refresh
  - POST /auth/register
- Wedding / Site
  - GET /w/:slug -> public invitation content
  - GET /weddings/:id -> private wedding data (auth)
  - PUT /weddings/:id/settings
- Guests & RSVP
  - POST /rsvp -> create/update RSVP (idempotent via token)
  - GET /rsvps/:token
  - GET /weddings/:id/guests
- Vendor
  - POST /vendors -> register vendor
  - GET /vendors/:id
  - POST /vendors/:id/listings
- Admin
  - GET /admin/dashboard
  - POST /admin/vendors/:id/approve

Auth & security
- Use JWTs with short expiry + refresh tokens stored securely.
- Role-based access control: `super_admin`, `couple`, `vendor`.
- Signed URLs for media uploads; validate file types and sizes server-side.
- Rate-limiting at API gateway per IP and per user.
- Enforce HTTPS in production; HSTS and secure cookies.

**Ports & network (recommended defaults)**
- Frontend (static hosting / CDN): 80/443 (HTTP/HTTPS) — typically served via CDN.
- API services: 8000 (backend service) or 8080; expose only through API gateway.
- Admin API: 8081 (internal/admin) — accessible via gateway with strict ACL.
- Postgres DB: 5432 (internal network only)
- Redis: 6379 (internal network only)
- RabbitMQ: 5672 (internal) / 15672 (management, restricted)
- MinIO (S3-compatible dev storage): 9000 (internal/dev only)

Example Docker-compose port mapping (dev):
```powershell
services:
  api:
    image: wedding-api:dev
    ports: ['8000:8000']
  web:
    image: wedding-web:dev
    ports: ['3000:3000']
  db:
    image: postgres:15
    ports: ['5432:5432']
  redis:
    image: redis:7
    ports: ['6379:6379']
```

**Storage & media**
- Use S3 for production media; signed PUT URLs to avoid routing files through app servers.
- Thumbnails and image processing performed by background workers; store derived images with predictable keys.

**Background processing**
- Workers consume tasks: email delivery, image resizing, CSV imports, trial cleanup.
- Use a queue (RabbitMQ/Redis Streams) and a worker pool (e.g., Celery, RQ, or a custom worker).

**Observability & operations**
- Logs: structured JSON logs shipped to centralized service (ELK / Azure Monitor / Splunk).
- Metrics: Prometheus + Grafana for request rates, latencies, queue lengths, worker failures.
- Tracing: OpenTelemetry for tracing cross-service requests.
- Alerts: CPU, error rate, queue backlog thresholds.

**CI/CD**
- Build pipeline: lint, unit tests, build container images, run integration smoke tests.
- Deployment: staging -> canary -> production with health checks and rollbacks.

**Data migration & backups**
- Use migration tool (Flyway / Alembic) for schema changes.
- Daily DB backups and periodic restore drills; object storage backup lifecycle policies.

**Security & compliance**
- Encrypt data at rest and in transit.
- Sensitive data minimization: never store raw payment card data; use PCI-compliant provider (Stripe).
- Regular dependency scans and vulnerability management.

**Implementation milestones (suggested)**
1. Project scaffolding, repository & CI setup, local dev docker-compose.
2. Core Postgres schema + migrations; Auth service + basic user flows.
3. Wedding & Guest CRUD; public GET /w/:slug endpoint.
4. Invitation frontend (static) + preview flows.
5. RSVP flows + idempotent token handling.
6. Vendor portal MVP + Super Admin approval workflow.
7. Media uploads via signed URLs; worker for image processing.
8. Billing & subscription integration.
9. Observability, security hardening, production rollout.

**Next immediate steps (actionable)**
- Create repo skeleton with directories: `./services/api`, `./services/auth`, `./services/web`, `./services/admin`, `./infrastructure`, `./docs`.
- Add `docker-compose.yml` and example `.env.example` with DB, Redis, and S3 settings.
- Implement DB migrations and seed a dev dataset for manual QA.

If you want, I will:
- create the repo skeleton and `docker-compose.yml` here; or
- generate initial DB migration files and an example `.env`.
