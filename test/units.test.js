import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";
import { createLogger } from "../src/logger.js";

test("config picks postgres when DATABASE_URL is set", () => {
