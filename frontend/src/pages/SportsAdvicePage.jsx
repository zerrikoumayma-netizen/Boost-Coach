import {
  Bike,
  Dumbbell,
  HeartPulse,
  Mountain,
  Search,
  ShieldCheck,
  Waves,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Badge, PageHeader } from "../components/ui.jsx";
import s from "../styles/SportsAdvicePage.module.css";

const categories = [
  {
    id: "running",
    label: "Course et marche",
    icon: HeartPulse,
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
    sports: ["Running", "Trail", "Marche sportive"],
    focus: "Endurance, souffle et régularité",
    overview:
      "La priorité est de construire une habitude durable. Le bon rythme est celui qui vous permet de terminer la séance avec l'envie de recommencer.",
    objectives: [
      "Reprendre sans douleur",
      "Améliorer le souffle",
      "Préparer une première distance",
      "Perdre du poids progressivement",
    ],
    session: [
      "10 min de marche active ou footing très lent",
      "20 à 35 min en alternant aisance respiratoire et courtes accélérations",
      "5 min de retour au calme, puis mobilité chevilles, hanches et mollets",
    ],
    technique: [
      "Gardez le regard loin devant et les épaules relâchées.",
      "Posez le pied sous le centre de gravité, sans chercher à allonger brutalement la foulée.",
      "Utilisez les bras pour stabiliser le rythme et limiter les tensions du haut du corps.",
    ],
    equipment: ["Chaussures adaptées à la foulée", "Textile respirant", "Gourde ou ceinture d'hydratation"],
    nutrition: "Avant une sortie courte, un repas digeste suffit. Au-delà de 60 minutes, prévoyez eau et apport glucidique simple.",
    recovery: "Espacez les séances intenses de 48 heures et augmentez le volume de 10 % maximum par semaine.",
    mistakes: ["Partir trop vite", "Courir avec une douleur persistante", "Changer chaussures et volume d'entraînement la même semaine"],
  },
  {
    id: "fitness",
    label: "Fitness et renforcement",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    sports: ["Musculation", "HIIT", "Cross training"],
    focus: "Force, posture et tonification",
    overview:
      "Un bon entraînement de renforcement repose sur la qualité du mouvement, une progression mesurable et une récupération suffisante.",
    objectives: ["Se tonifier", "Gagner en force", "Protéger les articulations", "Compléter un sport cardio"],
    session: [
      "8 min de mobilité : hanches, épaules, colonne, chevilles",
      "3 à 5 exercices principaux : squat, tirage, poussée, charnière de hanche, gainage",
      "2 à 4 séries par exercice avec 60 à 120 secondes de récupération",
    ],
    technique: [
      "Respirez avant l'effort, bloquez légèrement le tronc si la charge est lourde, expirez en fin de mouvement.",
      "Gardez une amplitude contrôlée et reproductible.",
      "Arrêtez la série quand la posture se dégrade, même s'il reste des répétitions prévues.",
    ],
    equipment: ["Haltères ou bandes élastiques", "Tapis", "Chaussures stables"],
    nutrition: "Visez une alimentation régulière avec protéines à chaque repas, glucides autour des séances et hydratation simple.",
    recovery: "Laissez 48 heures avant de retravailler lourdement le même groupe musculaire.",
    mistakes: ["Confondre vitesse et intensité", "Négliger l'échauffement", "Copier une charge sans tenir compte de sa technique"],
  },
  {
    id: "cycling",
    label: "Cyclisme",
    icon: Bike,
    image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80",
    sports: ["Vélo route", "VTT", "Vélo urbain"],
    focus: "Cardio, puissance et autonomie",
    overview:
      "Le vélo permet de travailler l'endurance avec peu d'impact articulaire, à condition de bien régler le poste de pilotage et de gérer l'effort.",
    objectives: ["Rouler plus longtemps", "Monter plus facilement", "Améliorer la cadence", "Gagner en confiance dehors"],
    session: [
      "10 min de pédalage souple",
      "30 à 60 min en endurance avec 4 à 6 passages de 1 min en cadence rapide",
      "5 min faciles, puis contrôle hydratation et étirements légers",
    ],
    technique: [
      "Réglez la selle pour garder une légère flexion du genou en bas du pédalage.",
      "Gardez une cadence fluide plutôt qu'un braquet trop dur.",
      "Anticipez freinage, trajectoire et obstacles, surtout en groupe ou en ville.",
    ],
    equipment: ["Casque", "Kit anti-crevaison", "Éclairage avant/arrière", "Bidon"],
    nutrition: "Buvez par petites gorgées toutes les 10 à 15 minutes. Sur sortie longue, ajoutez une collation facile à digérer.",
    recovery: "Après une sortie exigeante, roulez facile ou reposez-vous le lendemain.",
    mistakes: ["Partir sans vérifier les freins", "Rouler trop dur en début de sortie", "Attendre la fringale pour manger"],
  },
  {
    id: "team",
    label: "Sports collectifs",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80",
    sports: ["Football", "Basket", "Handball"],
    focus: "Vitesse, coordination et décision",
    overview:
      "Les sports collectifs demandent des accélérations, freinages, appuis et décisions rapides. La prévention est aussi importante que la performance.",
    objectives: ["Être plus explosif", "Mieux tenir un match", "Réduire le risque d'entorse", "Améliorer les changements d'appuis"],
    session: [
      "10 min de mobilité dynamique et appuis progressifs",
      "6 à 10 sprints courts avec récupération complète",
      "Jeu réduit ou situations techniques, puis retour au calme",
    ],
    technique: [
      "Fléchissez les genoux avant les changements de direction.",
      "Travaillez la réception sur l'avant du pied, sans verrouiller les genoux.",
      "Gardez la tête disponible : regard, prise d'information, décision.",
    ],
    equipment: ["Chaussures selon terrain", "Protections adaptées", "Ballon d'entraînement"],
    nutrition: "Mangez suffisamment avant match, mais évitez les repas lourds dans les deux heures qui précèdent.",
    recovery: "Après match, marchez quelques minutes et hydratez-vous avant les étirements légers.",
    mistakes: ["Zapper l'échauffement", "Reprendre trop vite après une entorse", "S'entraîner seulement en match sans préparation physique"],
  },
  {
    id: "outdoor",
    label: "Outdoor",
    icon: Mountain,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80",
    sports: ["Randonnée", "Trekking", "Escalade loisir"],
    focus: "Préparation, autonomie et endurance douce",
    overview:
      "Les activités outdoor se réussissent avant le départ : itinéraire, météo, matériel, alimentation et marge de sécurité.",
    objectives: ["Marcher plus longtemps", "Gérer le dénivelé", "Gagner en autonomie", "Profiter sans surcharge"],
    session: [
      "Choisir un parcours adapté au niveau et au dénivelé",
      "Marcher à une allure qui permet de parler sans essoufflement excessif",
      "Faire une pause courte et régulière plutôt qu'une longue pause tardive",
    ],
    technique: [
      "En montée, raccourcissez le pas et gardez un rythme régulier.",
      "En descente, contrôlez l'appui et évitez de freiner uniquement avec les genoux.",
      "Ajustez le sac près du dos pour limiter les tensions lombaires.",
    ],
    equipment: ["Chaussures accrocheuses", "Sac 15–30 L", "Coupe-vent", "Trousse de secours"],
    nutrition: "Emportez eau, sel si forte chaleur, et petites prises énergétiques régulières.",
    recovery: "Surveillez pieds, mollets et hanches le lendemain ; une marche courte peut aider à récupérer.",
    mistakes: ["Sous-estimer la météo", "Partir avec des chaussures neuves", "Porter trop lourd pour son niveau"],
  },
  {
    id: "water",
    label: "Sports d'eau",
    icon: Waves,
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
    sports: ["Natation", "Surf", "Aquagym"],
    focus: "Respiration, technique et relâchement",
    overview:
      "Dans l'eau, la progression vient surtout de l'économie de mouvement : respirer, se relâcher, puis seulement augmenter l'intensité.",
    objectives: ["Nager plus longtemps", "Mieux respirer", "Renforcer sans impact", "Gagner en confiance aquatique"],
    session: [
      "5 à 10 min faciles pour trouver la respiration",
      "Blocs courts de 25 à 100 m avec récupération contrôlée",
      "Finir par quelques longueurs lentes pour conserver une bonne technique",
    ],
    technique: [
      "Expirez dans l'eau avant de chercher l'inspiration.",
      "Gardez la nuque longue et le corps aligné.",
      "Ralentissez dès que la technique se dégrade : la vitesse viendra ensuite.",
    ],
    equipment: ["Lunettes ajustées", "Bonnet ou combinaison selon température", "Serviette microfibre"],
    nutrition: "Hydratez-vous même si la sensation de soif est plus discrète dans l'eau.",
    recovery: "Rincez-vous, séchez-vous rapidement par temps frais et mobilisez doucement les épaules.",
    mistakes: ["Retenir sa respiration", "Nager trop vite trop tôt", "Ignorer les consignes de surveillance ou de courant"],
  },
];

/* ─────────────────────────────────────────
   Page component
───────────────────────────────────────── */
export default function SportsAdvicePage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) =>
      [cat.label, cat.focus, cat.overview, ...cat.sports, ...cat.objectives, ...cat.technique]
        .some((v) => v.toLowerCase().includes(query))
    );
  }, [search]);

  const visibleCategories = filteredCategories.length ? filteredCategories : categories;
  const selected = visibleCategories.find((cat) => cat.id === activeCategory) || visibleCategories[0];

  return (
    <>
      <PageHeader
        eyebrow="Conseils"
        title="Conseils sportifs par catégorie"
        description="Une approche pratique pour débuter, progresser, bien s'équiper, récupérer et appliquer les bons réflexes selon votre sport."
      />

      {/* ── Toolbar ── */}
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={16} />
          <input
            placeholder="Rechercher un sport, un objectif ou un conseil"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={s.tabs} role="tablist" aria-label="Catégories sportives">
          {visibleCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selected.id === cat.id}
                className={`${s.tab} ${selected.id === cat.id ? s.tabActive : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Feature panel ── */}
      <section className={s.feature}>
        <img className={s.featureImage} src={selected.image} alt={selected.label} />
        <div className={s.featureBody}>
          <Badge tone="green">{selected.focus}</Badge>
          <h2>{selected.label}</h2>
          <p>{selected.overview}</p>

          <div className={s.sportChips}>
            {selected.sports.map((sport) => (
              <span className={s.sportChip} key={sport}>{sport}</span>
            ))}
          </div>

          <div className={s.sessionList}>
            {selected.session.map((item, index) => (
              <div className={s.sessionItem} key={item}>
                <span className={s.sessionNum}>{String(index + 1).padStart(2, "0")}</span>
                <p className={s.sessionText}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Detail panels ── */}
      <div className={s.detailGrid}>
        <AdvicePanel title="Objectifs adaptés"    items={selected.objectives} tone="blue" />
        <AdvicePanel title="Technique essentielle" items={selected.technique}  tone="blue" />
        <AdvicePanel title="À éviter"             items={selected.mistakes}   tone="red" />

        <article className={`${s.panel} ${s.panelBlue}`}>
          <h2>Nutrition et récupération</h2>
          <p className={s.panelText}><strong>Avant / pendant :</strong> {selected.nutrition}</p>
          <p className={s.panelText}><strong>Après :</strong> {selected.recovery}</p>
        </article>
      </div>

      {/* ── Cards grid ── */}
      <section className={s.cardsGrid}>
        {visibleCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <article className={s.card} key={cat.id}>
              <img className={s.cardImage} src={cat.image} alt={cat.label} />
              <div className={s.cardBody}>
                <div className={s.cardTopline}>
                  <Badge>{cat.label}</Badge>
                  <Icon size={18} />
                </div>
                <h2 className={s.cardFocus}>{cat.focus}</h2>
                <p className={s.cardOverview}>{cat.overview}</p>
                <div className={s.equipmentList}>
                  {cat.equipment.map((item) => (
                    <span className={s.equipmentTag} key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

/* ─────────────────────────────────────────
   AdvicePanel sub-component
───────────────────────────────────────── */
function AdvicePanel({ title, items, tone = "blue" }) {
  return (
    <article className={`${s.panel} ${tone === "red" ? s.panelRed : s.panelBlue}`}>
      <h2>{title}</h2>
      <ul className={s.panelList}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}