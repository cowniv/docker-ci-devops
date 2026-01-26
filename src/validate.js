// Hand-written validation (before I learned Zod)
export function validateNote(body, { partial = false } = {}) {
  const errors = [];
  const out = {};

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== "string" || !body.title.trim()) errors.push("title is required");
