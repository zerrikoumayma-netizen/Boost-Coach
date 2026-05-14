import { Boxes, CalendarDays, CheckCircle2, HeartPulse, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../../api/adminApi";
import { ErrorState, LoadingState, PageHeader, StatCard } from "../../components/ui.jsx";
import s from "../../styles/AdminDashboardPage.module.css";

export default function AdminDashboardPage() {
  const dashboard = useQuery({ queryKey: ["adminDashboard"], queryFn: getAdminDashboard });

  return (
    <div className={s.page}>
      {/* Ambient blobs */}
      <div className={s.blobA} aria-hidden="true" />
      <div className={s.blobB} aria-hidden="true" />
      <div className={s.bgMesh} aria-hidden="true" />

      <div className={s.header}>
        <PageHeader
          eyebrow="Administration"
          title="Pilotage global"
          description="Vue synthétique des utilisateurs, produits, séances et événements."
        />
      </div>

      {dashboard.isLoading ? <LoadingState /> : null}
      {dashboard.isError  ? <ErrorState error={dashboard.error} /> : null}

      {dashboard.data ? (
        <section className={s.statsGrid}>
          <div className={`${s.statCard} ${s.blue}`}>
            <StatCard icon={Users}        label="Utilisateurs"      value={dashboard.data.totalUsers}        tone="blue"   />
          </div>
          <div className={`${s.statCard} ${s.orange}`}>
            <StatCard icon={Boxes}        label="Produits"           value={dashboard.data.totalProducts}     tone="orange" />
          </div>
          <div className={`${s.statCard} ${s.red}`}>
            <StatCard icon={HeartPulse}   label="Séances"            value={dashboard.data.totalSessions}     tone="red"    />
          </div>
          <div className={`${s.statCard} ${s.green}`}>
            <StatCard icon={CheckCircle2} label="Séances terminées"  value={dashboard.data.completedSessions} tone="green"  />
          </div>
          <div className={`${s.statCard} ${s.blue} ${s.wide}`}>
            <StatCard icon={CalendarDays} label="Événements"         value={dashboard.data.totalEvents}       tone="blue"   />
          </div>
        </section>
      ) : null}
    </div>
  );
}