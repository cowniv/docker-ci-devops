// Minimal structured logger: one JSON object per line on stdout.
// Docker / CloudWatch / any log shipper can parse these without extra config.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

export function createLogger({ level = "info", base = {}, write = (line) => process.stdout.write(line + "\n") } = {}) {
  const min = LEVELS[level] ?? LEVELS.info;

  function log(lvl, msg, fields = {}) {
    if (LEVELS[lvl] < min) return;
    const entry = { time: new Date().toISOString(), level: lvl, msg, ...base, ...fields };
    if (fields.err instanceof Error) {
      entry.err = { message: fields.err.message, stack: fields.err.stack };
    }
    write(JSON.stringify(entry));
  }

  return {
    debug: (msg, f) => log("debug", msg, f),
    info: (msg, f) => log("info", msg, f),
    warn: (msg, f) => log("warn", msg, f),
