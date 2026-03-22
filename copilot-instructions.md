# We Believe Academics – Project Instructions

## Overview
We Believe Academics is a personalized K-12 tutoring platform combining AI-powered curriculum with real private teachers. The site is at `webelieveacademics.com`.

## Tech Stack
- **Frontend**: Static HTML pages with Bootstrap 5.3, custom CSS (`assets/site.css`), vanilla JS (`assets/app.js`), Google Fonts (Nunito)
- **Backend**: Fastify 5 (TypeScript, ESM) API in `src/` — runs on port 4000
- **Database**: PostgreSQL 16 (schema in `webelieve_schema.sql`, migrations in `db/`)
- **Cache/Queue**: Redis 7 + BullMQ (queues: `ai-jobs`, `reports`)
- **AI**: Anthropic Claude SDK (`@anthropic-ai/sdk`) for curriculum generation
- **Auth**: `@fastify/jwt` + bcrypt password hashing, tokens stored in localStorage
- **Validation**: Zod for runtime schema validation
- **Deployment**: Docker Compose (local), Nginx reverse proxy + systemd (production), Cloudflare DNS

## Project Structure
```
├── assets/
│   ├── app.js              # Frontend API client, auth, form handlers
│   └── site.css            # Design system (teal/coral/cream palette)
├── db/
│   ├── 002_backend_extensions.sql  # Auth credentials + refresh tokens
│   └── 003_consultations.sql       # Consultation requests table
├── ops/
│   ├── nginx/webelieveacademics.com.conf  # Reverse proxy config
│   └── systemd/webelieve-api.service      # Production service
├── src/
│   ├── app.ts              # Fastify app factory
│   ├── server.ts           # API server entry point
│   ├── worker.ts           # BullMQ background worker
│   ├── config/env.ts       # Environment validation (Zod)
│   ├── lib/
│   │   ├── auth.ts         # Password hashing & verification
│   │   ├── db.ts           # PostgreSQL pool, query helper, transactions
│   │   ├── redis.ts        # Redis client (ioredis)
│   │   └── queues.ts       # BullMQ queue instances
│   ├── plugins/auth.ts     # JWT auth middleware (authenticate, authorizeAdmin)
│   ├── routes/
│   │   ├── index.ts        # Route aggregator
│   │   ├── admin.ts        # Admin dashboard & management
│   │   ├── auth.ts         # Register & login
│   │   ├── consultations.ts # Contact form intake
│   │   ├── courses.ts      # Course CRUD
│   │   ├── dashboard.ts    # Student dashboard data
│   │   ├── health.ts       # GET /health, GET /ready
│   │   ├── staff.ts        # Teacher lookup
│   │   ├── standards.ts    # Educational standards search
│   │   ├── students.ts     # Student management
│   │   └── users.ts        # User management (admin only)
│   └── types/fastify.d.ts  # Type extensions
├── index.html              # Homepage
├── about.html              # About us
├── programs.html           # Program listings
├── how-it-works.html       # 5-step process
├── contact.html            # Consultation form
├── portal.html             # Parent/student portal (authenticated)
├── webelieve_schema.sql    # Full database schema (20 tables)
├── webelieve_db_design.md  # Database architecture docs
├── docker-compose.yml      # Local Postgres + Redis
└── CLOUDFLARE_CUTOVER_STEPS.txt  # DNS/deployment checklist
```

## NPM Scripts
- `npm run dev` – Start API in watch mode (tsx)
- `npm run dev:worker` – Start worker in watch mode
- `npm run build` – TypeScript compile to `dist/`
- `npm run start` – Run compiled server
- `npm run typecheck` – Check types without emitting

## Local Development
1. `docker compose up -d` – Start Postgres (port 55432) and Redis (port 6379)
2. Copy `.env.example` to `.env` and fill in secrets
3. `npm install && npm run dev` – Start API on port 4000
4. Open HTML files directly or serve with any static file server

## Database
- 20 tables across 6 domains: Users/Roles, Learning Content, Student Tracking, Pedagogical Tools, Standards, Reporting
- Key enums: `user_role` (student/teacher/parent/admin), `enrollment_status`, `lesson_type` (teacher_led/ai_generated)
- Auth: `auth_local_credentials` for password hashes, `api_refresh_tokens` for JWT refresh
- Consultations: `consultation_requests` tracks intake form submissions through status workflow

## Frontend Conventions
- Color palette: primary teal `#2a9d8f`, accent coral `#e07a5f`, warm backgrounds `#fffcf8`
- `assets/app.js` auto-detects API base URL (localhost:4000 vs production)
- Auth tokens stored in localStorage as `wbaToken`, `wbaUser`
- Contact form submits to `POST /api/v1/consultations` via `bindContactForm()`

## API Conventions
- All API routes prefixed with `/api/v1/`
- Auth: JWT via `authenticate` decorator (any user) or `authorizeAdmin` (admin only)
- Database queries use `query<T>()` helper with parameterized queries
- Transactions via `withTransaction()` wrapper

## Deployment
- See `CLOUDFLARE_CUTOVER_STEPS.txt` for DNS/Cloudflare setup
- See `docker-compose.yml` for local service orchestration
- See `ops/nginx/` for reverse proxy (static files + API proxy to :4000)
- See `ops/systemd/` for production service management
