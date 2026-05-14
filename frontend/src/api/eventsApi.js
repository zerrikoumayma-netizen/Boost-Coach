import { apiFetch, jsonBody, withQuery } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getEvents(filters) {
  const data = await apiFetch(withQuery("/events", filters));
  return fixDeep(data);
}

export async function createEvent(event) {
  const data = await apiFetch("/events", {
    method: "POST",
    body: jsonBody(event),
  });
  return fixDeep(data);
}

export async function updateEvent(id, event) {
  const data = await apiFetch(`/events/${id}`, {
    method: "PUT",
    body: jsonBody(event),
  });
  return fixDeep(data);
}

export async function deleteEvent(id) {
  const data = await apiFetch(`/events/${id}`, {
    method: "DELETE",
  });
  return fixDeep(data);
}
