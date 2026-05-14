import { useQuery } from "@tanstack/react-query";
import { Users, Star, ShieldCheck, User } from "lucide-react";
import { getAdminUsers } from "../../api/adminApi";
import { ErrorState, LoadingState, PageHeader } from "../../components/ui.jsx";
import s from "../../styles/AdminUsersPage.module.css";

const ROLE_LABEL = {
  ROLE_ADMIN: "Admin",
  ROLE_USER: "Utilisateur",
};

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return <span className={s.avatar}>{initials}</span>;
}

function RoleBadge({ role }) {
  const isAdmin = role === "ROLE_ADMIN";
  return (
    <span className={`${s.roleBadge} ${isAdmin ? s.roleBadgeAdmin : s.roleBadgeUser}`}>
      {isAdmin ? <ShieldCheck size={11} /> : <User size={11} />}
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

export default function AdminUsersPage() {
  const users = useQuery({ queryKey: ["adminUsers"], queryFn: getAdminUsers });

  const allUsers = users.data || [];
  const adminCount = allUsers.filter((u) => (u.roles || []).includes("ROLE_ADMIN")).length;
  const totalPoints = allUsers.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Utilisateurs"
        description="Liste des comptes inscrits et leurs points fidélité."
      />

      {/* ── Summary cards ── */}
      {!users.isLoading && !users.isError && (
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <span className={`${s.statIcon} ${s.statIconBlue}`}>
              <Users size={18} />
            </span>
            <strong className={s.statValue}>{allUsers.length}</strong>
            <span className={s.statLabel}>Comptes au total</span>
          </div>
          <div className={s.statCard}>
            <span className={`${s.statIcon} ${s.statIconRed}`}>
              <ShieldCheck size={18} />
            </span>
            <strong className={s.statValue}>{adminCount}</strong>
            <span className={s.statLabel}>Administrateurs</span>
          </div>
          <div className={s.statCard}>
            <span className={`${s.statIcon} ${s.statIconGreen}`}>
              <Star size={18} />
            </span>
            <strong className={s.statValue}>{totalPoints.toLocaleString("fr-FR")}</strong>
            <span className={s.statLabel}>Points fidélité cumulés</span>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <section className={`section ${s.tableSection}`}>
        <div className={s.tableHeader}>
          <div className={s.sectionLabelRow}>
            <Users size={16} className={s.sectionIcon} />
            <h2 className={s.sectionHeading}>Tous les comptes</h2>
          </div>
          {!users.isLoading && !users.isError && (
            <p className={s.tableCount}>
              {allUsers.length} utilisateur{allUsers.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {users.isLoading ? (
          <LoadingState />
        ) : users.isError ? (
          <ErrorState error={users.error} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôles</th>
                  <th className={s.thPoints}>Points</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr key={user.id} className={s.tableRow}>
                    <td className={s.userCell}>
                      <Avatar name={user.username} />
                      <div className={s.userInfo}>
                        <span className={s.userName}>{user.username}</span>
                        <span className={s.userId}>#{user.id}</span>
                      </div>
                    </td>
                    <td className={s.emailCell}>{user.email}</td>
                    <td className={s.rolesCell}>
                      {(user.roles || []).map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </td>
                    <td className={s.pointsCell}>
                      <span className={s.pointsPill}>
                        <Star size={12} />
                        {(user.loyaltyPoints || 0).toLocaleString("fr-FR")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}