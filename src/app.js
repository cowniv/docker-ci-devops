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
