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
