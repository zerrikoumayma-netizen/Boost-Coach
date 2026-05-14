import { apiFetch } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getAdminDashboard() {
  const data = await apiFetch("/admin/dashboard");
  return fixDeep(data);
}

export async function getAdminUsers() {
  const data = await apiFetch("/admin/users");
  return fixDeep(data);
}
