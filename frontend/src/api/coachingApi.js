import { apiFetch, jsonBody, withQuery } from "./client";
import { fixDeep } from "../utils/fixEncoding.js";

export async function getPrograms(filters) {
  try {
    const backendPrograms = await apiFetch(withQuery("/coaching/programs", filters));
    const fixed = fixDeep(backendPrograms) || [];
    return mergePrograms(fixed).filter((program) => matchesFilters(program, filters));
  } catch (error) {
    return LOCAL_PROGRAMS.filter((program) => matchesFilters(program, filters));
  }
}

export async function getProgram(id) {
  const local = LOCAL_PROGRAMS.find((program) => String(program.id) === String(id));
  if (local) return local;

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
  if (String(programId).startsWith("local-")) {
    return {
      id: `local-session-${Date.now()}`,
      sessionLabel: label,
      completed: false,
      startedAt: new Date().toISOString(),
    };
  }

  const data = await apiFetch(withQuery("/coaching/sessions/start", { programId, label }), {
    method: "POST",
  });
  return fixDeep(data);
}

export async function completeSession(sessionId) {
  if (String(sessionId).startsWith("local-session-")) {
    return {
      id: sessionId,
      completed: true,
    };
  }

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

function mergePrograms(programs) {
  const seen = new Set(programs.map((program) => normalize(program.title)));
  const extras = LOCAL_PROGRAMS.filter((program) => !seen.has(normalize(program.title)));
  return [...programs, ...extras];
}

export const LOCAL_PROGRAMS = [
  {
    id: "local-1",
    title: "Cardio maison 4 semaines",
    description: "Circuit court sans machine pour retrouver du souffle et de l'energie.",
    category: "Cardio",
    objective: "endurance",
    level: "BEGINNER",
    durationWeeks: "4",
    coverImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-2",
    title: "Running debutant 5 km",
    description: "Plan progressif marche-course pour finir un premier 5 km.",
    category: "Running",
    objective: "endurance",
    level: "BEGINNER",
    durationWeeks: "6",
    coverImage: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-3",
    title: "Force full body 6 semaines",
    description: "Renforcement complet avec mouvements simples et charges legeres.",
    category: "Musculation",
    objective: "force",
    level: "INTERMEDIATE",
    durationWeeks: "6",
    coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-4",
    title: "Mobilite et posture",
    description: "Routine douce pour assouplir le dos, les hanches et les epaules.",
    category: "Yoga & Pilates",
    objective: "flexibilite",
    level: "BEGINNER",
    durationWeeks: "5",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-5",
    title: "Cyclisme endurance route",
    description: "Sorties progressives pour rouler plus longtemps avec confort.",
    category: "Cyclisme",
    objective: "endurance",
    level: "INTERMEDIATE",
    durationWeeks: "8",
    coverImage: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-6",
    title: "HIIT express 20 minutes",
    description: "Seances intenses et courtes pour transpirer sans materiel lourd.",
    category: "Fitness",
    objective: "perte de poids",
    level: "INTERMEDIATE",
    durationWeeks: "4",
    coverImage: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-7",
    title: "Natation technique",
    description: "Travail de respiration, glisse et endurance en bassin.",
    category: "Natation",
    objective: "technique",
    level: "BEGINNER",
    durationWeeks: "6",
    coverImage: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-8",
    title: "Trail decouverte",
    description: "Preparation aux sorties nature avec montees, descentes et appuis.",
    category: "Running",
    objective: "trail",
    level: "INTERMEDIATE",
    durationWeeks: "8",
    coverImage: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-9",
    title: "Gainage solide",
    description: "Programme centre du corps pour stabilite, posture et prevention.",
    category: "Fitness",
    objective: "renforcement",
    level: "BEGINNER",
    durationWeeks: "4",
    coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-10",
    title: "Perte de poids progressive",
    description: "Cardio modere, renforcement et habitudes faciles a tenir.",
    category: "Cardio",
    objective: "perte de poids",
    level: "BEGINNER",
    durationWeeks: "8",
    coverImage: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-11",
    title: "Haut du corps tonique",
    description: "Bras, dos, epaules et posture avec halteres ou elastiques.",
    category: "Musculation",
    objective: "tonification",
    level: "INTERMEDIATE",
    durationWeeks: "6",
    coverImage: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-12",
    title: "Bas du corps puissant",
    description: "Cuisses, fessiers et mollets avec progression controlee.",
    category: "Musculation",
    objective: "force",
    level: "INTERMEDIATE",
    durationWeeks: "6",
    coverImage: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-13",
    title: "Yoga anti-stress",
    description: "Respiration, etirements et sequences calmes pour recuperer.",
    category: "Yoga & Pilates",
    objective: "bien-etre",
    level: "BEGINNER",
    durationWeeks: "4",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-14",
    title: "Marathon base endurance",
    description: "Volume progressif, sorties longues et renforcement coureur.",
    category: "Running",
    objective: "marathon",
    level: "ADVANCED",
    durationWeeks: "12",
    coverImage: "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-15",
    title: "Velo maison indoor",
    description: "Seances sur home trainer ou velo statique pour garder le rythme.",
    category: "Cyclisme",
    objective: "cardio",
    level: "BEGINNER",
    durationWeeks: "5",
    coverImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-16",
    title: "Preparation randonnee",
    description: "Jambes, souffle et stabilite pour marcher plus longtemps.",
    category: "Outdoor",
    objective: "randonnee",
    level: "BEGINNER",
    durationWeeks: "6",
    coverImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-17",
    title: "Padel forme et appuis",
    description: "Explosivite douce, coordination et mobilite pour sports de raquette.",
    category: "Raquette",
    objective: "agilite",
    level: "INTERMEDIATE",
    durationWeeks: "5",
    coverImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-18",
    title: "Retour au sport",
    description: "Reprise securisee apres pause avec intensite progressive.",
    category: "Fitness",
    objective: "reprise",
    level: "BEGINNER",
    durationWeeks: "4",
    coverImage: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-19",
    title: "Athlete complet",
    description: "Force, cardio, mobilite et coordination pour une forme globale.",
    category: "Cross Training",
    objective: "performance",
    level: "ADVANCED",
    durationWeeks: "8",
    coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-20",
    title: "Pilates centre du corps",
    description: "Controle, respiration et renforcement profond sans impact.",
    category: "Yoga & Pilates",
    objective: "posture",
    level: "BEGINNER",
    durationWeeks: "6",
    coverImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  },
];
