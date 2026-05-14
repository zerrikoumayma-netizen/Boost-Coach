import { apiFetch, jsonBody } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function login(credentials) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: jsonBody(credentials),
  });
  return fixDeep(data);
}

export async function register(payload) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: jsonBody(payload),
  });
  return fixDeep(data);
}
