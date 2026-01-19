import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { validateNote } from "./validate.js";
import { createLogger } from "./logger.js";

export function createApp(store, { logger = createLogger({ level: "silent" }), corsOrigin = "*" } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // we sit behind nginx
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  // request id + structured access log
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    req.id = req.get("x-request-id") || randomUUID();
    res.set("x-request-id", req.id);
    res.on("finish", () => {
      logger.info("request", {
        reqId: req.id,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - start) / 1e6,
      });
    });
    next();
  });

  // liveness: the process is up
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // readiness: the database answers
  app.get("/ready", async (_req, res) => {
    try {
      await store.ping?.();
      res.json({ ok: true });
    } catch (err) {
      logger.warn("readiness check failed", { err });
      res.status(503).json({ ok: false });
    }
  });

  // GET /notes?q=react&tag=school&sort=updated
  app.get("/notes", async (req, res, next) => {
    try {
      const { q = "", tag, sort = "updated" } = req.query;
      let notes = await store.all();

      if (q) {
        const needle = String(q).toLowerCase();
        notes = notes.filter((n) => (n.title + " " + n.content).toLowerCase().includes(needle));
      }
      if (tag) notes = notes.filter((n) => n.tags.includes(String(tag).toLowerCase()));

      const key = sort === "created" ? "createdAt" : sort === "title" ? "title" : "updatedAt";
      notes.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1; // pinned first
        return key === "title" ? a.title.localeCompare(b.title) : b[key].localeCompare(a[key]);
      });

      res.json({ count: notes.length, data: notes });
    } catch (err) {
      next(err);
    }
  });

  app.get("/notes/:id", async (req, res, next) => {
    try {
      const note = await store.get(req.params.id);
      if (!note) return res.status(404).json({ error: "Note not found" });
      res.json(note);
    } catch (err) {
      next(err);
    }
  });

  app.post("/notes", async (req, res, next) => {
    try {
      const { errors, data } = validateNote(req.body ?? {});
      if (errors.length) return res.status(400).json({ errors });
      res.status(201).json(await store.create(data));
    } catch (err) {
      next(err);
    }
  });

  app.patch("/notes/:id", async (req, res, next) => {
    try {
      const { errors, data } = validateNote(req.body ?? {}, { partial: true });
      if (errors.length) return res.status(400).json({ errors });
      const note = await store.update(req.params.id, data);
      if (!note) return res.status(404).json({ error: "Note not found" });
      res.json(note);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/notes/:id", async (req, res, next) => {
    try {
      const ok = await store.remove(req.params.id);
      if (!ok) return res.status(404).json({ error: "Note not found" });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  app.get("/tags", async (_req, res, next) => {
    try {
      const counts = {};
      for (const n of await store.all()) for (const t of n.tags) counts[t] = (counts[t] ?? 0) + 1;
      res.json(counts);
    } catch (err) {
      next(err);
    }
  });

  app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

  // central error handler
  app.use((err, req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
    logger.error("unhandled error", { reqId: req.id, err });
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
