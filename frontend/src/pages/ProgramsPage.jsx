import { Activity, Clock3, Dumbbell, Layers3, Play, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPrograms } from "../api/coachingApi";
import ReactionButton from "../components/ReactionButton.jsx";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { getSessionExercises, getSessionsForProgram, getTotalSessionMinutes } from "./ProgramLaunchPage.jsx";
import s from "../styles/ProgramsPage.module.css";

export default function ProgramsPage() {
  const [filters, setFilters] = useState({ category: "", objective: "", level: "" });

  const programs = useQuery({
    queryKey: ["programs", filters],
    queryFn: () => getPrograms(filters),
  });

  const items = programs.data || [];
  const workoutStats = getWorkoutStats(items);

  return (
    <>
      <PageHeader
        eyebrow="Coaching"
        title="Programmes d'entraînement"
        description="Choisissez un programme pour ouvrir ses séances, ses mouvements et les outils recommandés."
      />

      <section className={s.hero}>
        <div>
          <span className={s.heroKicker}>Fitness app</span>
          <h2 className={s.heroTitle}>Séances guidées pour progresser avec une exécution propre.</h2>
          <p className={s.heroSub}>
            Chaque carte présente le niveau, le volume d'exercices et l'accès aux détails visuels de la séance.
          </p>
        </div>
      </section>

      <div className={s.statsStrip}>
        <div className={s.statCard}>
          <span className={`${s.statIcon} ${s.blue}`}><Layers3 size={20} /></span>
          <div className={s.statBody}>
            <span className={s.statValue}>{workoutStats.sessions}</span>
            <span className={s.statLabel}>Séances disponibles</span>
          </div>
        </div>
        <div className={s.statCard}>
          <span className={`${s.statIcon} ${s.green}`}><Dumbbell size={20} /></span>
          <div className={s.statBody}>
            <span className={s.statValue}>{workoutStats.exercises}</span>
            <span className={s.statLabel}>Exercices guidés</span>
          </div>
        </div>
        <div className={s.statCard}>
          <span className={`${s.statIcon} ${s.orange}`}><Clock3 size={20} /></span>
          <div className={s.statBody}>
            <span className={s.statValue}>{workoutStats.minutes} min</span>
            <span className={s.statLabel}>Durée totale</span>
          </div>
        </div>
      </div>

      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={16} />
          <input
            placeholder="Objectif : endurance, musculation…"
            value={filters.objective}
            onChange={(e) => setFilters({ ...filters, objective: e.target.value })}
          />
        </div>
        <input
          className={s.filterInput}
          placeholder="Catégorie"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <select
          className={s.filterInput}
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
        >
          <option value="">Tous les niveaux</option>
          <option value="Debutant">Débutant</option>
          <option value="Intermediaire">Intermédiaire</option>
          <option value="Avance">Avancé</option>
        </select>
      </div>

      {programs.isLoading && <LoadingState />}
      {programs.isError && <ErrorState error={programs.error} />}

      {!programs.isLoading && !programs.isError && (
        <section className={s.grid}>
          {items.map((program) => {
            const sessions = getSessionsForProgram(program);
            const exercisesCount = sessions.reduce(
              (sum, session) => sum + getSessionExercises(session).length,
              0
            );
            const totalMinutes = getTotalSessionMinutes(sessions);
            const coverSrc = program.coverImage || program.image || sessions[0]?.image;

            return (
              <article className={s.card} key={program.id}>
                {coverSrc && (
                  <img className={s.cardImage} src={coverSrc} alt={program.title} />
                )}
                <div className={s.cardBody}>
                  <div className={s.cardTopline}>
                    <Badge tone="green">{program.level}</Badge>
                    <ReactionButton targetId={program.id} targetType="PROGRAM" />
                  </div>

                  <h2 className={s.cardTitle}>{program.title}</h2>
                  <p className={s.cardDesc}>{program.description}</p>

                  <div className={s.statsRow}>
                    <span className={s.stat}><Activity size={14} />{sessions.length} séances</span>
                    <span className={s.stat}><Dumbbell size={14} />{exercisesCount} exercices</span>
                    <span className={s.stat}><Clock3 size={14} />{totalMinutes} min</span>
                  </div>

                  <div className={s.metaRow}>
                    {program.category  && <span className={s.metaTag}>{program.category}</span>}
                    {program.objective && <span className={s.metaTag}>{program.objective}</span>}
                    {(program.duration || program.durationWeeks) && (
                      <span className={s.metaTag}>
                        {program.duration || `${program.durationWeeks} semaines`}
                      </span>
                    )}
                  </div>

                  <Link className={s.startBtn} to={`/app/programs/${program.id}/launch`}>
                    <Play size={15} />
                    Démarrer le programme
                  </Link>
                </div>
              </article>
            );
          })}

          {!items.length && <EmptyState title="Aucun programme trouvé" />}
        </section>
      )}
    </>
  );
}

function getWorkoutStats(programs) {
  return programs.reduce(
    (stats, program) => {
      const sessions = getSessionsForProgram(program);
      return {
        sessions:  stats.sessions  + sessions.length,
        exercises: stats.exercises + sessions.reduce((sum, s) => sum + getSessionExercises(s).length, 0),
        minutes:   stats.minutes   + getTotalSessionMinutes(sessions),
      };
    },
    { sessions: 0, exercises: 0, minutes: 0 }
  );
}