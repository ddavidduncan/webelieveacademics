# We Believe Academics Backend

Backend API and worker foundation for `webelieveacademics.com`, built to run entirely on this machine.

## Stack

- Node.js 22
- TypeScript
- Fastify
- PostgreSQL
- Redis
- BullMQ
- Zod
- Anthropic SDK

## Local Infrastructure

This project expects:

- PostgreSQL initialized from:
  - `webelieve_schema.sql`
  - `db/002_backend_extensions.sql`
- Redis for queues and future caching

Ports used by this project on this machine:

- PostgreSQL: `127.0.0.1:55432`
- Redis: `127.0.0.1:6379`

Bring up infra:

```bash
docker compose up -d
```

## Environment

Copy `.env.example` to `.env` and adjust values.

Key settings:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `ANTHROPIC_API_KEY`

## Run

API:

```bash
npm run dev
```

Worker:

```bash
npm run dev:worker
```

Typecheck:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

## Frontend

The static frontend lives in `frontend/` and is now wired to the local API.

Key pages:

- `frontend/index.html`
- `frontend/about.html`
- `frontend/programs.html`
- `frontend/how-it-works.html`
- `frontend/contact.html`
- `frontend/portal.html`

Frontend runtime behavior:

- local browsing uses `http://127.0.0.1:4000/api/v1`
- non-local browsing defaults to `https://webelieveacademics.com/api/v1`
- override is available through `localStorage.wbaApiBase`

Staged NGINX config for this machine:

- `ops/nginx/webelieveacademics.com.conf`

That vhost is designed to:

- serve the static frontend from `frontend/`
- proxy `/api/` to `127.0.0.1:4000`

It is staged in the project and not yet applied to `/etc/nginx`.

## Current API Surface

Health:

- `GET /health`
- `GET /ready`

Auth:

- `POST /api/v1/auth/register-parent`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Users and people:

- `GET /api/v1/users`
- `POST /api/v1/students`
- `GET /api/v1/students/:studentId`
- `GET /api/v1/teachers`

Learning:

- `GET /api/v1/courses`
- `GET /api/v1/courses/:courseId`
- `GET /api/v1/dashboard/student/:studentId`
- `GET /api/v1/standards`

## Notes

- The original relational schema remains the system of record.
- `db/002_backend_extensions.sql` adds local-auth support for this self-hosted stack.
- `db/003_consultations.sql` adds public consultation intake for the marketing site.
- The worker queues are scaffolded now and ready for AI/report job implementation.
- The frontend has now been expanded from brochure pages into a backend-wired marketing + portal surface.
