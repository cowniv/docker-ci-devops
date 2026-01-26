// Hand-written validation (before I learned Zod)
export function validateNote(body, { partial = false } = {}) {
  const errors = [];
  const out = {};

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== "string" || !body.title.trim()) errors.push("title is required");
    else if (body.title.length > 120) errors.push("title must be at most 120 characters");
    else out.title = body.title.trim();
  }

  if (body.content !== undefined) {
    if (typeof body.content !== "string") errors.push("content must be a string");
    else out.content = body.content;
  } else if (!partial) {
    out.content = "";
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || !body.tags.every((t) => typeof t === "string")) {
      errors.push("tags must be an array of strings");
    } else {
      out.tags = [...new Set(body.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
    }
  } else if (!partial) {
    out.tags = [];
  }

  if (body.pinned !== undefined) {
    if (typeof body.pinned !== "boolean") errors.push("pinned must be a boolean");
    else out.pinned = body.pinned;
  }

  return { errors, data: out };
}
