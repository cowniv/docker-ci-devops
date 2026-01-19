// All settings come from environment variables (12-factor style).
// Defaults are for local development only.
const env = process.env;

function int(value, fallback) {
  const n = Number.parseInt(value ?? "", 10);
