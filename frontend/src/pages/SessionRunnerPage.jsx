import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Dumbbell,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeSession, getProgram } from "../api/coachingApi";
import { useAuth } from "../auth/AuthProvider.jsx";
import { Badge, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { getSessionExercises, getSessionsForProgram } from "./ProgramLaunchPage.jsx";
import styles from "../styles/SessionRunnerPage.module.css";

const exerciseImages = [];

export default function SessionRunnerPage() {
  const { id, sessionNumber } = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();

  const startedAt = location.state?.startedAt || Date.now();
  const sessionId = location.state?.sessionId;

  const [elapsed, setElapsed]               = useState(Math.floor((Date.now() - startedAt) / 1000));
  const [paused, setPaused]                 = useState(false);
  const [activeExercise, setActiveExercise] = useState(0);
  const [checkedExercises, setCheckedExercises] = useState([]);

  const program = useQuery({
    queryKey: ["program", id],
    queryFn: () => getProgram(id),
  });

  const complete = useMutation({
    mutationFn: completeSession,
    onSuccess: (data) => {
      if (data?.loyaltyPoints !== undefined) refreshSession({ loyaltyPoints: data.loyaltyPoints });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessionStats"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/app", { replace: true });
    },
  });

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const session = useMemo(() => {
    if (!program.data) return null;
    const sessions = getSessionsForProgram(program.data);
    return sessions[Math.max(Number(sessionNumber || 1) - 1, 0)] || sessions[0];
  }, [program.data, sessionNumber]);

  const exercises = useMemo(() => getSessionExercises(session), [session]);
  const checkedCount = checkedExercises.length;

  if (program.isLoading) return <LoadingState label="Ouverture de la séance..." />;
  if (program.isError)   return <ErrorState error={program.error} />;
  if (!session)          return <ErrorState error={{ message: "Séance introuvable." }} />;

  const currentExercise = exercises[activeExercise];

  function toggleExercise(index) {
    setCheckedExercises((items) =>
      items.includes(index) ? items.filter((i) => i !== index) : [...items, index]
    );
  }

  const progressPct = exercises.length ? (checkedCount / exercises.length) * 100 : 0;

  return (
    <div className={styles.page}>
      {/* Ambient blobs */}
      <div className={styles.blobA} aria-hidden="true" />
      <div className={styles.blobB} aria-hidden="true" />
      <div className={styles.bgMesh} aria-hidden="true" />

      {/* Header */}
      <div className={styles.header}>
        <PageHeader
          eyebrow="Séance en cours"
          title={session.title}
          description={program.data?.title}
          actions={
            <Link className={styles.backButton} to={`/app/programs/${id}/launch`}>
              <ArrowLeft size={18} /> Programme
            </Link>
          }
        />
      </div>

      {/* ── HERO: timer + active exercise ── */}
      <section className={styles.hero}>

        {/* Timer panel */}
        <div className={styles.timerPanel}>
          <Badge tone="green">Chronomètre lancé</Badge>

          <strong className={`${styles.timerDisplay} ${paused ? styles.timerPaused : ""}`}>
            {formatElapsed(elapsed)}
          </strong>

          <div className={styles.timerActions}>
            <button className={styles.ghostBtn} type="button" onClick={() => setPaused((v) => !v)}>
              {paused ? <Play size={17} /> : <Pause size={17} />}
              {paused ? "Reprendre" : "Pause"}
            </button>
            <button className={styles.ghostBtn} type="button" onClick={() => setElapsed(0)}>
              <RotateCcw size={17} />
              Réinitialiser
            </button>
          </div>

          {/* Progress bar */}
          <div
            className={styles.progressTrack}
            aria-label={`${checkedCount} exercices validés sur ${exercises.length}`}
          >
            <span className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <p className={styles.progressLabel}>
            <strong>{checkedCount}</strong>/{exercises.length} exercices validés
          </p>
        </div>

        {/* Active exercise spotlight */}
        <article className={styles.activeExercisePanel}>
          <div className={styles.activeImageWrap}>
            <img src={currentExercise.image} alt={currentExercise.name} />
            <div className={styles.activeImageOverlay} />
          </div>
          <div className={styles.activeExerciseInfo}>
            <span className={styles.stepLabel}>
              <Clock3 size={16} /> Étape {activeExercise + 1}
            </span>
            <h2>{currentExercise.name}</h2>
            <p>{currentExercise.description}</p>
          </div>
        </article>

      </section>

      {/* ── EXERCISE BOARD ── */}
      <section className={styles.board}>

        {/* Sidebar: exercise tabs */}
        <div className={styles.exerciseList}>
          {exercises.map((exercise, index) => {
            const isChecked = checkedExercises.includes(index);
            const isActive  = index === activeExercise;
            return (
              <button
                key={exercise.name}
                className={`${styles.exerciseTab} ${isActive ? styles.tabActive : ""} ${isChecked ? styles.tabChecked : ""}`}
                type="button"
                onClick={() => setActiveExercise(index)}
              >
                {isChecked
                  ? <CheckCircle2 size={17} className={styles.tabIcon} />
                  : <Circle       size={17} className={styles.tabIcon} />
                }
                <span>{exercise.name}</span>
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        <article className={styles.detailCard}>
          <div className={styles.detailImageWrap}>
            <img src={currentExercise.image} alt={currentExercise.name} />
          </div>

          <div className={styles.detailBody}>
            <div className={styles.cardTopline}>
              <Badge tone={checkedExercises.includes(activeExercise) ? "green" : "orange"}>
                {checkedExercises.includes(activeExercise) ? "Validé" : "À réaliser"}
              </Badge>
              <span className={styles.stepDuration}>
                <Dumbbell size={15} /> Construction
              </span>
            </div>

            <h2 className={styles.detailTitle}>{currentExercise.name}</h2>

            {/* Metrics chips */}
            <div className={styles.metricsRow}>
              <span>{currentExercise.sets || 3} séries</span>
              <span>{currentExercise.repetitions}</span>
              <span>Repos {currentExercise.rest}</span>
              <span>{currentExercise.difficulty || session.difficulty || "Adaptable"}</span>
            </div>

            {/* Muscles */}
            {currentExercise.muscles?.length ? (
              <div className={styles.muscleTags}>
                {currentExercise.muscles.map((muscle) => (
                  <span key={muscle} className={styles.muscleTag}>{muscle}</span>
                ))}
              </div>
            ) : null}

            {/* Steps */}
            <ol className={styles.constructionList}>
              {getConstructionSteps(currentExercise).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            {/* Validate button */}
            <button
              className={`${styles.primaryBtn} ${checkedExercises.includes(activeExercise) ? styles.primaryBtnDone : ""}`}
              type="button"
              onClick={() => toggleExercise(activeExercise)}
            >
              <CheckCircle2 size={17} />
              {checkedExercises.includes(activeExercise) ? "Marquer à refaire" : "Valider cet exercice"}
            </button>
          </div>
        </article>

      </section>

      {/* ── FINISH BAR ── */}
      <section className={styles.finishBar}>
        <div className={styles.finishText}>
          <strong>Fin de séance</strong>
          <span>Terminez quand tous les exercices sont réalisés avec une technique propre.</span>
        </div>
        <button
          className={`${styles.primaryBtn} ${styles.finishBtn}`}
          type="button"
          disabled={!sessionId || complete.isPending}
          onClick={() => complete.mutate(sessionId)}
        >
          <Trophy size={17} />
          {complete.isPending ? "Validation..." : "Terminer la séance"}
        </button>
      </section>

      {/* Alerts */}
      {!sessionId && (
        <div className={styles.alert}>
          Cette séance n'a pas été créée par le bouton de démarrage. Revenez au programme pour l'enregistrer.
        </div>
      )}
      {complete.isError && (
        <div className={styles.alert}>
          {complete.error?.message || "Impossible de terminer la séance."}
        </div>
      )}
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────── */
function getConstructionSteps(exercise) {
  return [
    "Installez le matériel, vérifiez l'espace autour de vous et démarrez en respiration calme.",
    exercise.description,
    `Réalisez ${exercise.repetitions}, puis prenez ${exercise.rest} de repos avant la suite.`,
    "Gardez le mouvement contrôlé, stoppez en cas de douleur et notez la sensation avant de passer à la suite.",
  ];
}

function formatElapsed(value) {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}