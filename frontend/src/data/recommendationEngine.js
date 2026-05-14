const PROFILE_KEY = "boostcoach_recommendation_profile";
const HISTORY_KEY = "boostcoach_recommendation_history";

export const sportLevels = [
  { value: "BEGINNER", label: "Debutant" },
  { value: "INTERMEDIATE", label: "Intermediaire" },
  { value: "ADVANCED", label: "Avance" },
];

export const sportObjectives = [
  "Perdre le poids",
  "Prise de poids",
  "Loisir & detente",
  "Preparation competition",
];

export const sportHobbies = [
  "Yoga",
  "Camping",
  "Running",
  "Badminton",
  "Natation",
  "Randonnee",
  "Padel",
  "Fitness",
  "Velo",
  "Marche",
  "Roller",
  "Jeux de plage",
  "Snorkeling",
  "Stretching",
  "Tir a l'arc",
  "Ping-pong",
];

const events = [
  event("Marathon de Casablanca", "Casablanca", "Running", "2026-06-14", "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=900&q=80"),
  event("Tournoi Padel Rabat", "Rabat", "Padel", "2026-06-28", "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80"),
  event("Randonnee Ifrane Atlas", "Ifrane", "Randonnee", "2026-07-05", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"),
  event("Competition Natation Agadir", "Agadir", "Natation", "2026-07-19", "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80"),
  event("Yoga Sunset Marrakech", "Marrakech", "Yoga", "2026-06-22", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80"),
  event("Sortie Velo Tanger", "Tanger", "Velo", "2026-07-12", "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80"),
];

const stores = [
  { city: "Casablanca", name: "Decathlon Casablanca Ain Sebaa", address: "Route de Rabat, Ain Sebaa, Casablanca", distance: 4.2 },
  { city: "Rabat", name: "Decathlon Rabat Hay Riad", address: "Avenue Annakhil, Rabat", distance: 3.5 },
  { city: "Marrakech", name: "Decathlon Marrakech", address: "Route de Casablanca, Marrakech", distance: 5.1 },
  { city: "Agadir", name: "Decathlon Agadir", address: "Zone commerciale Founty, Agadir", distance: 4.8 },
  { city: "Tanger", name: "Decathlon Tanger", address: "Route de Tetouan, Tanger", distance: 6.4 },
  { city: "Fes", name: "Decathlon Fes", address: "Centre commercial Borj Fes", distance: 5.9 },
];

function event(name, city, sport, date, image) {
  return { id: slug(`${name}-${city}`), name, city, sport, date, image };
}

export function saveRecommendationProfile(profile) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getRecommendationProfile(fallback = {}) {
  if (typeof localStorage === "undefined") return fallback;
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

export function buildRecommendations(profile = {}, productCatalog = []) {
  const normalized = normalizeProfile(profile);
  const recommendedProducts = productCatalog
    .map(normalizeCatalogProduct)
    .map((item) => ({ ...item, score: scoreProduct(item, normalized) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const recommendedEvents = events
    .map((item) => ({ ...item, score: scoreEvent(item, normalized) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const nearestStore = findNearestStore(normalized.city);
  saveRecommendationHistory({ profile: normalized, products: recommendedProducts, events: recommendedEvents, nearestStore });
  return { products: recommendedProducts, events: recommendedEvents, nearestStore };
}

export function getRecommendationHistory() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function normalizeProfile(profile) {
  const objectives = Array.isArray(profile.objectives) ? profile.objectives.join(" ") : profile.objective || profile.objectives || "";
  return {
    fullName: profile.fullName || profile.username || "",
    age: Number(profile.age || 0),
    city: profile.city || "Casablanca",
    level: profile.level || "BEGINNER",
    objective: objectives,
    hobby: profile.hobby || "Fitness",
    budget: Number(profile.budget || 0),
  };
}

function scoreProduct(item, profile) {
  let score = 25;
  if (same([item.category, item.name, item.description], profile.hobby)) score += 32;
  if (same([item.category, item.name, item.description], profile.objective)) score += 24;
  if (profile.budget && item.price <= profile.budget) score += 18;
  if (profile.budget && item.price > profile.budget) score -= Math.min(22, Math.round((item.price - profile.budget) / 120));
  return Math.max(0, Math.min(99, score));
}

function scoreEvent(item, profile) {
  let score = 35;
  if (normalize(item.city) === normalize(profile.city)) score += 38;
  if (normalize(profile.hobby).includes(normalize(item.sport))) score += 20;
  return Math.min(99, score);
}

function findNearestStore(city) {
  return stores.find((store) => normalize(store.city) === normalize(city)) || stores[0];
}

function saveRecommendationHistory(entry) {
  if (typeof localStorage === "undefined") return;
  const history = getRecommendationHistory();
  const next = [{ ...entry, createdAt: new Date().toISOString() }, ...history].slice(0, 6);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function same(list, value) {
  const target = normalize(value);
  return list.some((item) => target.includes(normalize(item)) || normalize(item).includes(target));
}

function normalize(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeCatalogProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category || "Sport",
    description: product.description || "",
    price: Number(product.price || 0),
    badge: getStockBadge(product.stockByCity),
    image: product.imageUrl,
  };
}

function getStockBadge(stockByCity = {}) {
  const total = Object.values(stockByCity || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  return total > 0 ? `${total} en stock` : "Disponible";
}

function slug(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
