import { CheckCircle2, Clock3 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeSession, getSessionStats, getSessions } from "../api/coachingApi";
import { useAuth } from "../auth/AuthProvider.jsx";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, StatCard, formatDate } from "../components/ui.jsx";
import styles from "../styles/SessionsPage.module.css";

export default function SessionsPage() {
  const queryClient  = useQueryClient();
  const { refreshSession } = useAuth();

  const sessions = useQuery({ queryKey: ["sessions"],     queryFn: getSessions });
  const stats    = useQuery({ queryKey: ["sessionStats"], queryFn: getSessionStats });

  const complete = useMutation({
    mutationFn: completeSession,
    onSuccess: (data) => {
      if (data?.loyaltyPoints !== undefined) refreshSession({ loyaltyPoints: data.loyaltyPoints });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessionStats"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return (
    <div className={styles.page}>
      {/* Ambient blobs */}
      <div className={styles.blobA} aria-hidden="true" />
      <div className={styles.blobB} aria-hidden="true" />
      <div className={styles.bgMesh} aria-hidden="true" />

      {/* Header */}
      <div className={styles.header}>
        <PageHeader
          eyebrow="Suivi"
          title="Mes séances"
          description="Terminez vos séances pour suivre votre progression et gagner des points fidélité."
        />
      </div>

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.green}`}>
          <StatCard icon={CheckCircle2} label="Séances terminées" value={stats.data?.completedSessions ?? 0} tone="green" />
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <StatCard icon={Clock3} label="Points fidélité" value={stats.data?.loyaltyPoints ?? 0} tone="blue" />
        </div>
      </section>

      {/* States */}
      {sessions.isLoading ? <LoadingState /> : null}
      {sessions.isError   ? <ErrorState error={sessions.error} /> : null}

      {/* Session list */}
      {!sessions.isLoading && !sessions.isError ? (
        <section className={styles.section}>
          <div className={styles.sessionList}>
            {(sessions.data || []).map((session) => (
              <article
                className={`${styles.sessionRow} ${session.done ? styles.sessionDone : ""}`}
                key={session.id}
              >
                {/* Left: label + meta */}
                <div className={styles.sessionInfo}>
                  <strong>{session.sessionLabel || session.program?.title || "Séance"}</strong>
                  <span>
                    {session.program?.title || "Programme"} ·{" "}
                    {session.completedAt ? formatDate(session.completedAt) : "En cours"}
                  </span>
                </div>

                {/* Badge */}
                <Badge tone={session.done ? "green" : "orange"}>
                  {session.done ? "Terminée" : "Active"}
                </Badge>

                {/* Complete button */}
                <button
                  className={`${styles.completeBtn} ${session.done ? styles.completeBtnDone : ""}`}
                  type="button"
                  disabled={session.done || complete.isPending}
                  onClick={() => complete.mutate(session.id)}
                >
                  <CheckCircle2 size={16} />
                  {session.done ? "Terminée" : "Terminer"}
                </button>
              </article>
            ))}

            {!sessions.data?.length ? (
              <EmptyState
                title="Aucune séance"
                description="Démarrez une séance depuis la page Programmes."
              />
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}