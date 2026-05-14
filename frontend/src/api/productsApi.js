import { apiFetch, jsonBody, withQuery } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getProducts(filters) {
  const data = await apiFetch(withQuery("/products", filters));
  return fixDeep(data);
}

export async function getProduct(id) {
  const data = await apiFetch(`/products/${id}`);
  return fixDeep(data);
}

export async function getProductAvailability(id) {
  const data = await apiFetch(`/products/${id}/availability`);
  return fixDeep(data);
}

export async function getProductCityAvailability(id, city) {
  const data = await apiFetch(`/products/${id}/availability/${encodeURIComponent(city)}`);
  return fixDeep(data);
}

export async function createProduct(product) {
  const data = await apiFetch("/products", {
    method: "POST",
    body: jsonBody(product),
  });
  return fixDeep(data);
}

export async function updateProduct(id, product) {
  const data = await apiFetch(`/products/${id}`, {
    method: "PUT",
    body: jsonBody(product),
  });
  return fixDeep(data);
}

export async function deleteProduct(id) {
  const data = await apiFetch(`/products/${id}`, {
    method: "DELETE",
  });
  return fixDeep(data);
}

export async function updateProductStock(id, city, quantity) {
  const data = await apiFetch(withQuery(`/products/${id}/stock`, { city, quantity }), {
    method: "PATCH",
  });
  return fixDeep(data);
}
