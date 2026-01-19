// Minimal structured logger: one JSON object per line on stdout.
// Docker / CloudWatch / any log shipper can parse these without extra config.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

export function createLogger({ level = "info", base = {}, write = (line) => process.stdout.write(line + "\n") } = {}) {
