// Every store implements the same interface, so app.js never knows which one it got:
//   all() · get(id) · create(data) · update(id, data) · remove(id) · ping() · close()
import { createJsonStore } from "./json-store.js";
import { createMemoryStore } from "./memory-store.js";
