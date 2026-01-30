# 24 · Notes API, Production Edition (Docker + CI + EC2)

**Roadmap stage:** Phase 8 – Full-Stack · January 2026

**Inspired by:** the AWS Cloud Club PUP "Vibe Code to Live" session, and the first time I deployed a NestJS backend to EC2 behind nginx and realized "it works on my machine" is only half the job.

I took my Notes API from project 21 and did everything I skipped the first time: a real PostgreSQL database, a Docker image, nginx in front, a CI pipeline, and a reproducible EC2 deploy. The routes are the same as before. Everything around them changed.

```
                 ┌──────────────── EC2 t3.micro (docker compose) ────────────────┐
  client ──:80──▶│  nginx  ──▶  api (Node/Express, non-root)  ──▶  postgres:16   │
                 │  rate limit    /health  /ready  /notes          volume: pgdata │
                 │  headers       JSON logs → stdout               ▲              │
                 │                                migrate (runs once on start) ─┘ │
                 └───────────────────────────────────────────────────────────────┘
  GitHub push ──▶ Actions: lint → tests (memory + postgres service) → docker build
```

### Features
- **Swappable stores** behind one interface (`all/get/create/update/remove/ping/close`): PostgreSQL for production, the old JSON file for quick local runs, in-memory for tests
- **SQL migrations** with a tiny runner that tracks applied files in `schema_migrations`
- **Environment-based config** (`src/config.js`), fails fast if Postgres is selected without `DATABASE_URL`
- **Structured JSON logging**, one line per request with a request id (`x-request-id` is passed through from nginx)
- **Graceful shutdown** on SIGTERM/SIGINT: stop accepting connections, finish in-flight requests, close the DB pool, with a timeout fallback
- `/health` (liveness) and `/ready` (checks the database)
- **Multi-stage Dockerfile**: production deps only, runs as the `node` user, built-in `HEALTHCHECK`
- **docker compose**: postgres + one-shot migrate + api + nginx, started in the right order with health conditions
- **nginx** reverse proxy with rate limiting, security headers and gzip
- **GitHub Actions**: lint, tests against in-memory and a Postgres service container, then a Docker build
- **deploy/**: EC2 user-data bootstrap script and a small Terraform file (t3.micro + security group, SSH locked to your IP, IMDSv2)

### Tech
Node.js 22 · Express · PostgreSQL 16 (`pg`) · Docker · docker compose · nginx · GitHub Actions · Terraform · AWS EC2 · ESLint

### Run
Locally without Docker (JSON file store):
```bash
npm install
npm run dev        # http://localhost:4000
npm test           # in-memory store
npm run lint
```

Whole stack with Docker:
```bash
cp .env.example .env     # change POSTGRES_PASSWORD
docker compose up -d --build
curl http://localhost:8080/health
docker compose logs -f api
```

Run the tests against a real Postgres:
```bash
TEST_DATABASE_URL=postgres://notes:change-me@localhost:5432/notes_test npm test
```

Deploy to EC2 (see comments in `deploy/`):
```bash
cd deploy/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply
```

### What I practiced
- Keeping routes independent of storage so I could swap JSON for Postgres without touching them
- Writing migrations instead of creating tables by hand
- Multi-stage Docker builds, non-root containers and healthchecks
- Why `CMD ["node", ...]` (exec form) matters for SIGTERM and graceful shutdown
- nginx as a reverse proxy and what `X-Forwarded-For` / `trust proxy` do
- CI with service containers
- Infrastructure as code: one `terraform apply` instead of clicking around the console
- Not committing secrets: `.env.example`, generated passwords on the server
