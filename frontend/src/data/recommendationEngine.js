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

const stores = [
  { city: "Casablanca", name: "Decathlon Casablanca Ain Sebaa", address: "Route de Rabat, Ain Sebaa, Casablanca", distance: 4.2 },
  { city: "Rabat", name: "Decathlon Rabat Hay Riad", address: "Avenue Annakhil, Rabat", distance: 3.5 },
  { city: "Marrakech", name: "Decathlon Marrakech", address: "Route de Casablanca, Marrakech", distance: 5.1 },
  { city: "Agadir", name: "Decathlon Agadir", address: "Zone commerciale Founty, Agadir", distance: 4.8 },
  { city: "Tanger", name: "Decathlon Tanger", address: "Route de Tetouan, Tanger", distance: 6.4 },
  { city: "Fes", name: "Decathlon Fes", address: "Centre commercial Borj Fes", distance: 5.9 },
];

export function saveRecommendationProfile(profile) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getRecommendationProfile(fallback = {}) {
  if (typeof localStorage === "undefined") return fallback;
  try {
    return { ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"), ...fallback };
  } catch {
    return fallback;
  }
}

export function buildRecommendations(profile = {}, data = []) {
  const normalized = normalizeProfile(profile);
  const source = Array.isArray(data) ? { products: data } : data || {};
  const productCatalog = source.products || [];
  const eventCatalog = source.events || [];
  const programCatalog = source.programs || [];

  const recommendedProducts = productCatalog
    .map(normalizeCatalogProduct)
    .map((item) => ({ ...item, score: scoreProduct(item, normalized) }))
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score >= 45);

  const recommendedEvents = eventCatalog
    .map(normalizeEvent)
    .map((item) => ({ ...item, score: scoreEvent(item, normalized) }))
    .sort(byScoreThenDate)
    .filter((item) => item.score >= 45 && isEventRelevant(item, normalized));

  const recommendedPrograms = programCatalog
    .map(normalizeProgram)
    .map((item) => ({ ...item, score: scoreProgram(item, normalized) }))
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score >= 45);

  const productAlternatives = recommendedProducts.length
    ? []
    : productCatalog.map(normalizeCatalogProduct).map((item) => ({ ...item, score: scoreAlternativeProduct(item, normalized), alternative: true })).sort((a, b) => b.score - a.score);
  const eventAlternatives = recommendedEvents.length
    ? []
    : eventCatalog.map(normalizeEvent).map((item) => ({ ...item, score: scoreAlternativeEvent(item, normalized), alternative: true })).sort(byScoreThenDate);
  const programAlternatives = recommendedPrograms.length
    ? []
    : programCatalog.map(normalizeProgram).map((item) => ({ ...item, score: scoreAlternativeProgram(item, normalized), alternative: true })).sort((a, b) => b.score - a.score);

  const products = fillWithAlternatives(recommendedProducts, productAlternatives, 6);
  const events = fillWithAlternatives(recommendedEvents, eventAlternatives, 4);
  const programs = fillWithAlternatives(recommendedPrograms, programAlternatives, 3);
  const upcomingEvents = fillWithAlternatives(recommendedEvents, eventAlternatives, 3);
  const quickCatalog = fillWithAlternatives(recommendedProducts, productAlternatives, 4);
  const hasExactMatches = {
    products: recommendedProducts.length > 0,
    events: recommendedEvents.length > 0,
    programs: recommendedPrograms.length > 0,
  };

  const nearestStore = findNearestStore(normalized.city);
  saveRecommendationHistory({ profile: normalized, products, events, programs, nearestStore });
  return {
    products: products.slice(0, 6),
    events: events.slice(0, 4),
    upcomingEvents: upcomingEvents.slice(0, 3),
    programs: programs.slice(0, 3),
    quickCatalog: quickCatalog.slice(0, 4),
    nearestStore,
    hasExactMatches,
  };
}

function fillWithAlternatives(primary, alternatives, limit) {
  const seen = new Set();
  return [...primary, ...alternatives]
    .filter((item) => {
      const id = String(item.id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, limit);
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
    objective: expandObjective(objectives),
    hobby: profile.hobby || "Fitness",
    budget: Number(profile.budget || 0),
  };
}

function expandObjective(value = "") {
  const text = String(value);
  const normalized = normalize(text);
  const aliases = [];
  if (normalized.includes("perdre") || normalized.includes("perte")) aliases.push("perte de poids cardio hiit fitness endurance");
  if (normalized.includes("prise") || (normalized.includes("poids") && !normalized.includes("perdre") && !normalized.includes("perte"))) {
    aliases.push("musculation force renforcement tonification");
  }
  if (normalized.includes("loisir") || normalized.includes("detente")) aliases.push("bien etre yoga marche randonnee mobilite");
  if (normalized.includes("competition") || normalized.includes("preparation")) aliases.push("performance marathon running endurance tournoi");
  return [text, ...aliases].join(" ");
}

function scoreProduct(item, profile) {
  let score = 18;
  if (same([item.category, item.name, item.description], profile.hobby)) score += 32;
  if (same([item.category, item.name, item.description], profile.objective)) score += 24;
  if (profile.budget && item.price <= profile.budget) score += 18;
  if (profile.budget && item.price > profile.budget) score -= Math.min(22, Math.round((item.price - profile.budget) / 120));
  return Math.max(0, Math.min(99, score));
}

function scoreEvent(item, profile) {
  let score = 18;
  if (normalize(item.city) === normalize(profile.city)) score += 38;
  if (same([item.title, item.type, item.description], profile.hobby)) score += 24;
  if (same([item.title, item.type, item.description], profile.objective)) score += 24;
  return Math.max(0, Math.min(99, score));
}

function scoreProgram(item, profile) {
  let score = 18;
  if (normalize(item.level) === normalize(profile.level)) score += 22;
  if (same([item.category, item.title, item.description], profile.hobby)) score += 28;
  if (same([item.objective, item.category, item.title, item.description], profile.objective)) score += 30;
  return Math.max(0, Math.min(99, score));
}

function scoreAlternativeProduct(item, profile) {
  let score = 24;
  if (profile.budget && item.price <= profile.budget) score += 22;
  if (same([item.category, item.name, item.description], profile.hobby)) score += 18;
  return Math.max(0, Math.min(89, score));
}

function scoreAlternativeEvent(item, profile) {
  let score = 24;
  if (normalize(item.city) === normalize(profile.city)) score += 30;
  if (same([item.title, item.type, item.description], profile.hobby)) score += 16;
  return Math.max(0, Math.min(89, score));
}

function isEventRelevant(item, profile) {
  return same([item.title, item.type, item.description], profile.hobby)
    || same([item.title, item.type, item.description], profile.objective);
}

function scoreAlternativeProgram(item, profile) {
  let score = 24;
  if (normalize(item.level) === normalize(profile.level)) score += 26;
  if (same([item.category, item.title, item.description], profile.hobby)) score += 16;
  return Math.max(0, Math.min(89, score));
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
  if (!target) return false;
  return list.some((item) => {
    const current = normalize(item);
    return current && (target.includes(current) || current.includes(target));
  });
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

function normalizeEvent(item) {
  return {
    id: item.id || slug(`${item.title || item.name}-${item.city}-${item.eventDate || item.date}`),
    title: item.title || item.name || "Evenement sportif",
    city: item.city || "Maroc",
    type: item.type || item.sport || "Sport",
    description: item.description || "",
    date: item.eventDate || item.date,
    image: item.image || item.coverImage || "",
  };
}

function normalizeProgram(item) {
  return {
    id: item.id,
    title: item.title || "Programme sportif",
    category: item.category || "Sport",
    objective: item.objective || "",
    description: item.description || "",
    level: item.level || "BEGINNER",
    durationWeeks: item.durationWeeks || "-",
  };
}

function getStockBadge(stockByCity = {}) {
  const total = Object.values(stockByCity || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  return total > 0 ? `${total} en stock` : "Disponible";
}

function slug(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function byScoreThenDate(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  return new Date(a.date || 0) - new Date(b.date || 0);
}
