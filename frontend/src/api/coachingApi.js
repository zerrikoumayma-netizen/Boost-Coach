import { apiFetch, jsonBody, withQuery } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getPrograms(filters) {
  try {
    const backendPrograms = await apiFetch(withQuery("/coaching/programs", filters));
    const fixed = fixDeep(backendPrograms) || [];
    return fixed.filter((program) => matchesFilters(program, filters));
  } catch (error) {
    return [];
  }
}

export async function getProgram(id) {
  const data = await apiFetch(`/coaching/programs/${id}`);
  return fixDeep(data);
}

export async function createProgram(program) {
  const data = await apiFetch("/coaching/programs", {
    method: "POST",
    body: jsonBody(program),
  });
  return fixDeep(data);
}

export async function deleteProgram(id) {
  const data = await apiFetch(`/coaching/programs/${id}`, {
    method: "DELETE",
  });
  return fixDeep(data);
}

export async function getSessions() {
  const data = await apiFetch("/coaching/sessions");
  return fixDeep(data);
}

export async function startSession(programId, label) {
  const data = await apiFetch(withQuery("/coaching/sessions/start", { programId, label }), {
    method: "POST",
  });
  return fixDeep(data);
}

export async function completeSession(sessionId) {
  const data = await apiFetch(`/coaching/sessions/${sessionId}/complete`, {
    method: "POST",
  });
  return fixDeep(data);
}

export async function getSessionStats() {
  const data = await apiFetch("/coaching/sessions/stats");
  return fixDeep(data);
}

function matchesFilters(program, filters = {}) {
  const objective = normalize(filters.objective);
  const category = normalize(filters.category);
  const level = normalize(filters.level);
  const searchable = normalize(`${program.title || ""} ${program.description || ""} ${program.objective || ""} ${program.category || ""}`);
  return (!objective || searchable.includes(objective))
    && (!category || normalize(program.category).includes(category))
    && (!level || normalize(program.level).includes(level));
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
