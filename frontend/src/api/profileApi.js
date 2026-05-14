import { apiFetch, jsonBody } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getMe() {
  const data = await apiFetch("/users/me");
  return fixDeep(data);
}

export async function getProfile() {
  const data = await apiFetch("/users/me/profile");
  return fixDeep(data);
}

export async function saveProfile(profile) {
  const data = await apiFetch("/users/me/profile", {
    method: "PUT",
    body: jsonBody(profile),
  });
  return fixDeep(data);
}
