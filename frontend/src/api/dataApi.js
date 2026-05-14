import { apiFetch } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getDataTables() {
  const data = await apiFetch("/data/tables");
  return fixDeep(data);
}

export async function getTablePreview(tableName, limit = 25) {
  const data = await apiFetch(`/data/tables/${encodeURIComponent(tableName)}?limit=${limit}`);
  return fixDeep(data);
}
