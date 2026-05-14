import { apiFetch, withQuery } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getReactionSummary(targetId, targetType) {
  const data = await apiFetch(withQuery("/reactions/summary", { targetId, targetType }));
  return fixDeep(data);
}

export async function toggleReaction(targetId, targetType) {
  const data = await apiFetch(withQuery("/reactions/toggle", { targetId, targetType }), {
    method: "POST",
  });
  return fixDeep(data);
}
