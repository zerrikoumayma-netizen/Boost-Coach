import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Eye,
  Footprints,
  Play,
  ShoppingCart,
  Timer,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProgram, startSession } from "../api/coachingApi";
import { Badge, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import s from "../styles/ProgramLaunchPage.module.css";

export const sessionTemplates = {
  running: [
    {
      title: "Séance 1 - Mise en route cardio",
      duration: "28 min",
      image: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80",
      tools: ["Chaussures de running", "Montre ou téléphone", "Gourde"],
      movements: [
        "Marche active 8 min pour élever progressivement le rythme cardiaque.",
        "Alternance 1 min course lente / 1 min marche pendant 14 min.",
        "Retour au calme 6 min avec respiration nasale et relâchement des épaules.",
      ],
      cues: ["Foulée courte", "Regard loin devant", "Respiration régulière"],
    },
    {
      title: "Séance 2 - Endurance confortable",
      duration: "35 min",
      image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1200&q=80",
      tools: ["Chaussures amortissantes", "Textile respirant"],
      movements: [
        "Échauffement 10 min en marche rapide.",
        "Course facile 3 x 6 min avec 2 min de marche entre les blocs.",
        "Étirements légers mollets, quadriceps et hanches.",
      ],
      cues: ["Pouvoir parler", "Bras relâchés", "Aucune douleur persistante"],
    },
    {
      title: "Séance 3 - Renforcement coureur",
      duration: "22 min",
      image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=80",
      tools: ["Tapis", "Chaussures stables"],
      movements: [
        "3 séries de 12 squats contrôlés.",
        "3 séries de 10 fentes arrière par jambe.",
        "3 x 30 sec de gainage frontal, puis mobilité chevilles.",
      ],
      cues: ["Genoux alignés", "Dos neutre", "Contrôle avant vitesse"],
    },
  ],
  fitness: [
    {
      title: "Séance 1 - Full body débutant",
      duration: "30 min",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
      tools: ["Tapis", "Haltères légers ou bouteilles d'eau", "Chronomètre"],
      movements: [
        "Échauffement mobilité épaules, hanches et chevilles pendant 6 min.",
        "Circuit 3 tours : 12 squats, 10 pompes inclinées, 12 tirages avec haltères.",
        "Finir par 3 x 25 sec de gainage.",
      ],
      cues: ["Amplitude propre", "Respiration stable", "Repos 60 sec entre tours"],
    },
    {
      title: "Séance 2 - Haut du corps et posture",
      duration: "26 min",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
      tools: ["Élastique", "Tapis", "Haltères"],
      movements: [
        "Activation dos : 2 x 15 tirages élastique.",
        "3 séries : développé épaules, rowing, dead bug.",
        "Étirement doux pectoraux et ouverture thoracique.",
      ],
      cues: ["Épaules basses", "Nuque longue", "Mouvement lent"],
    },
    {
      title: "Séance 3 - Bas du corps tonique",
      duration: "32 min",
      image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80",
      tools: ["Tapis", "Step ou marche stable"],
      movements: [
        "2 tours de montée de genoux, talons-fesses et squats à vide.",
        "4 séries : fentes, hip thrust, step-up, gainage latéral.",
        "Retour au calme : respiration et relâchement des hanches.",
      ],
      cues: ["Pousser dans le talon", "Bassin stable", "Progression graduelle"],
    },
  ],
  cycling: [
    {
      title: "Séance 1 - Réglage et aisance",
      duration: "40 min",
      image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80",
      tools: ["Vélo vérifié", "Casque", "Bidon", "Kit anti-crevaison"],
      movements: [
        "Contrôler freins, pneus et hauteur de selle.",
        "Rouler 25 min en cadence facile sur terrain plat.",
        "Terminer par 5 accélérations de 20 sec, récupération complète.",
      ],
      cues: ["Cadence fluide", "Coudes souples", "Anticipation du freinage"],
    },
    {
      title: "Séance 2 - Endurance progressive",
      duration: "55 min",
      image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
      tools: ["Casque", "Gourde", "Collation simple"],
      movements: [
        "10 min très faciles.",
        "3 blocs de 10 min en endurance régulière avec 4 min faciles.",
        "Retour au calme 8 min.",
      ],
      cues: ["Ne pas forcer le braquet", "Boire souvent", "Rester relâché"],
    },
    {
      title: "Séance 3 - Côtes courtes",
      duration: "45 min",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      tools: ["Vélo", "Casque", "Parcours sécurisé"],
      movements: [
        "Échauffement 15 min.",
        "6 montées de 45 sec en effort contrôlé, descente facile.",
        "10 min faciles pour relâcher les jambes.",
      ],
      cues: ["Buste stable", "Cadence régulière", "Effort progressif"],
    },
  ],
  default: [
    {
      title: "Séance 1 - Diagnostic et échauffement",
      duration: "25 min",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
      tools: ["Tapis", "Chronomètre", "Gourde"],
      movements: [
        "Mobilité générale pendant 8 min.",
        "Bloc technique facile pour observer posture, souffle et confort.",
        "Retour au calme avec respiration lente.",
      ],
      cues: ["Commencer doucement", "Noter les sensations", "Éviter la douleur"],
    },
    {
      title: "Séance 2 - Progression contrôlée",
      duration: "30 min",
      image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80",
      tools: ["Tapis", "Chaussures adaptées"],
      movements: [
        "Échauffement progressif 8 min.",
        "3 blocs de travail de 6 min avec récupération courte.",
        "Étirements doux et hydratation.",
      ],
      cues: ["Rythme régulier", "Technique propre", "Repos assumé"],
    },
    {
      title: "Séance 3 - Consolidation",
      duration: "35 min",
      image: "/images/boost-gym-bg.jpg",
      tools: ["Tapis", "Gourde", "Serviette"],
      movements: [
        "Répéter les meilleurs exercices des séances précédentes.",
        "Ajouter un bloc de coordination ou gainage.",
        "Terminer par un bilan : facilité, fatigue, motivation.",
      ],
      cues: ["Qualité avant quantité", "Respiration calme", "Progression durable"],
    },
  ],
};


export default function ProgramLaunchPage() {
  const { id } = useParams();
  const [startedLabel, setStartedLabel] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const program = useQuery({
    queryKey: ["program", id],
    queryFn: () => getProgram(id),
  });

  const start = useMutation({
    mutationFn: ({ label }) => startSession(id, label),
    onSuccess: (session, variables) => {
      setStartedLabel(session?.sessionLabel || "Séance démarrée");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessionStats"] });
      navigate(`/app/programs/${id}/session/${variables.index + 1}`, {
        state: {
          sessionId: session?.id,
          sessionLabel: session?.sessionLabel || variables.label,
          startedAt: Date.now(),
        },
      });
    },
  });

  if (program.isLoading) return <LoadingState label="Préparation du programme..." />;
  if (program.isError)   return <ErrorState error={program.error} />;

  const item = program.data;
  const sessions = getSessionsForProgram(item);
  const coverSrc = item.coverImage || item.image || sessions[0]?.image;

  return (
    <>
      <PageHeader
        eyebrow="Lancement"
        title={item.title}
        description={item.description}
        actions={
          <Link className="ghost-button" to="/app/programs">
            <ArrowLeft size={18} /> Retour
          </Link>
        }
      />

      {/* ── Launch hero ── */}
      <section className={s.launchHero}>
        <img className={s.launchHeroImage} src={coverSrc} alt={item.title} onError={useFallbackImage} />

        <div className={s.launchPanel}>
          <div className={s.metaRow}>
            {item.category   && <span className={s.metaTag}>{item.category}</span>}
            {item.objective  && <span className={s.metaTag}>{item.objective}</span>}
            {(item.duration || item.durationWeeks) && (
              <span className={s.metaTag}>
                {item.duration || `${item.durationWeeks} semaines`}
              </span>
            )}
          </div>

          <h2>Votre feuille de route</h2>
          <p>
            Suivez les séances dans l'ordre, gardez une intensité maîtrisée et validez votre
            séance après l'avoir réalisée pour suivre votre progression.
          </p>

          <div className={s.launchChecks}>
            <span className={s.launchCheck}><Clock3 size={16} /> 3 séances guidées</span>
            <span className={s.launchCheck}><Dumbbell size={16} /> Matériel listé</span>
            <span className={s.launchCheck}><Footprints size={16} /> Mouvements détaillés</span>
          </div>

          {startedLabel && (
            <div className={s.successAlert}>
              {startedLabel} est ajoutée à votre programme actif.
            </div>
          )}

          <button
            className={s.startBtn}
            type="button"
            onClick={() => start.mutate({ label: sessions[0]?.title || item.title, index: 0 })}
            disabled={start.isPending}
          >
            <Play size={17} />
            {start.isPending ? "Lancement…" : "Démarrer la séance 1"}
          </button>
        </div>
      </section>

      {/* ── Session cards ── */}
      <section className={s.stepsGrid}>
        {sessions.map((session, index) => (
          <article className={s.sessionCard} key={session.title}>
            <img className={s.sessionImage} src={session.image || FALLBACK_IMAGE} alt={session.title} onError={useFallbackImage} />

            <div className={s.sessionBody}>
              {/* Top badges */}
              <div className={s.cardTopline}>
                <Badge tone="green">Séance {index + 1}</Badge>
                <Badge tone="orange">{session.difficulty || getSessionDifficulty(index)}</Badge>
                <span className={s.sessionDuration}><Timer size={14} />{session.duration}</span>
              </div>

              <h2 className={s.sessionTitle}>{session.title}</h2>
              {session.category && (
                <div className={s.metaRow}><span className={s.metaTag}>{session.category}</span></div>
              )}
              {session.description && <p className={s.sessionDesc}>{session.description}</p>}

              {/* Equipment */}
              <div className={s.stepBlock}>
                <h3>Outils nécessaires</h3>
                <div className={s.equipmentList}>
                  {session.tools.map((tool) => (
                    <span className={s.equipmentTag} key={tool}>{tool}</span>
                  ))}
                </div>
              </div>

              {/* Catalog links */}
              <div className={s.stepBlock}>
                <h3>Recommandations catalogue</h3>
                <div className={s.recoList}>
                  {session.tools.map((tool) => (
                    <Link
                      key={tool}
                      className={s.recoLink}
                      to={`/app/products?search=${encodeURIComponent(toProductSearch(tool))}`}
                    >
                      <ShoppingCart size={13} />
                      {tool}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Movements */}
              <div className={s.stepBlock}>
                <h3>Mouvements à effectuer</h3>
                <ol className={s.movementList}>
                  {session.movements.map((movement) => (
                    <li key={movement}>{movement}</li>
                  ))}
                </ol>
              </div>

              {/* Exercise previews */}
              <div className={s.exerciseGrid}>
                {getSessionExercises(session).map((exercise) => (
                  <article className={s.exerciseCard} key={exercise.name}>
                    <img src={exercise.image || FALLBACK_IMAGE} alt={exercise.name} onError={useFallbackImage} />
                    <div className={s.exerciseCardBody}>
                      <span className={s.exerciseName}>{exercise.name}</span>
                      <span className={s.exerciseMeta}>{exercise.repetitions} · repos {exercise.rest}</span>
                      <span className={s.exerciseSets}>
                        {exercise.sets || 3} séries · {exercise.difficulty || session.difficulty || "Adaptable"}
                      </span>
                      <p className={s.exerciseDesc}>{exercise.description}</p>
                      {exercise.muscles?.length > 0 && (
                        <p className={s.exerciseMuscles}>Muscles : {exercise.muscles.join(", ")}</p>
                      )}
                      <Link
                        className={s.exerciseLink}
                        to={`/app/programs/${id}/session/${index + 1}`}
                        state={{ sessionLabel: session.title }}
                      >
                        <Eye size={13} /> Voir les détails
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Cues */}
              <div className={s.cuesRow}>
                {session.cues.map((cue) => (
                  <span className={s.cue} key={cue}>
                    <CheckCircle2 size={13} />{cue}
                  </span>
                ))}
              </div>

              {/* Start button */}
              <button
                className={s.sessionStartBtn}
                type="button"
                onClick={() => start.mutate({ label: session.title, index })}
                disabled={start.isPending}
              >
                <Play size={15} />
                Démarrer cette séance
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

/* ─────────────────────────────────────────
   Exported helpers (used by ProgramsPage)
───────────────────────────────────────── */
export function getSessionsForProgram(program) {
  if (program?.sessions?.length) return program.sessions;
  const source = `${program?.category || ""} ${program?.objective || ""} ${program?.title || ""}`.toLowerCase();
  if (source.includes("run") || source.includes("course") || source.includes("endurance"))
    return sessionTemplates.running;
  if (source.includes("musculation") || source.includes("fitness") || source.includes("force"))
    return sessionTemplates.fitness;
  if (source.includes("velo") || source.includes("vélo") || source.includes("cycl"))
    return sessionTemplates.cycling;
  return sessionTemplates.default;
}

const exerciseImagePool = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80",
];

const FALLBACK_IMAGE = "/images/boost-gym-bg.jpg";

function useFallbackImage(event) {
  if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
  event.currentTarget.src = FALLBACK_IMAGE;
}

export function getSessionExercises(session) {
  if (!session) return [];
  if (session.exercises?.length) return session.exercises;
  return (session.movements || []).map((movement, index) => ({
    name: getExerciseName(movement, index),
    description: movement,
    repetitions: getExerciseVolume(movement),
    rest: getExerciseRest(session, index),
    image: exerciseImagePool[index % exerciseImagePool.length] || session.image,
  }));
}

export function getTotalSessionMinutes(sessions) {
  return sessions.reduce((total, session) => total + Number.parseInt(session.duration, 10), 0);
}

export function getSessionDifficulty(index) {
  return ["Débutant", "Intermédiaire", "Progressif"][index] || "Adaptable";
}

/* ─────────────────────────────────────────
   Private helpers
───────────────────────────────────────── */
function getExerciseName(movement, index) {
  const base = movement.split(":")[0].replace(/^\d+\s*x\s*/i, "").replace(/\.$/, "").trim();
  return base.length > 8 && base.length < 58 ? base : `Exercice ${index + 1}`;
}

function getExerciseVolume(movement) {
  const duration = movement.match(/\d+\s*(min|sec)/i)?.[0];
  const reps = movement.match(/\d+\s*(séries|tours|x|squats|pompes|fentes|montées)/i)?.[0];
  return duration || reps || "Technique contrôlée";
}

function getExerciseRest(session, index) {
  const cue = (session.cues || []).find((item) => item.toLowerCase().includes("repos"));
  if (cue) return cue.replace(/^Repos\s*/i, "");
  return index === 0 ? "30 sec" : "45 sec";
}

function toProductSearch(tool) {
  const n = tool.toLowerCase();
  if (n.includes("chaussure")) return "chaussures";
  if (n.includes("gourde") || n.includes("bidon")) return "gourde";
  if (n.includes("tapis")) return "tapis";
  if (n.includes("halt")) return "halteres";
  if (n.includes("casque")) return "casque";
  if (n.includes("vélo") || n.includes("velo")) return "velo";
  if (n.includes("textile")) return "t-shirt";
  return tool;
}
