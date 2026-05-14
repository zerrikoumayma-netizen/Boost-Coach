import {
  Boxes,
  CalendarDays,
  Database,
  Gauge,
  HeartPulse,
  Lightbulb,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

const navItems = [
  { to: "/app", label: "Tableau", icon: Gauge, end: true },
  { to: "/app/products", label: "Produits", icon: Boxes },
  { to: "/app/programs", label: "Programmes", icon: HeartPulse },
  { to: "/app/events", label: "Événements", icon: CalendarDays },
  { to: "/app/advice", label: "Conseils", icon: Lightbulb },
  { to: "/app/profile", label: "Profil", icon: UserRound },
];

const adminItems = [
  { to: "/app/admin", label: "Admin", icon: Shield, end: true },
  { to: "/app/admin/products", label: "Catalogue", icon: Boxes },
  { to: "/app/admin/events", label: "Événements", icon: CalendarDays },
  { to: "/app/admin/programs", label: "Coaching", icon: HeartPulse },
  { to: "/app/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/app/data", label: "Donnees", icon: Database },
];

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { session, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.documentElement.classList.toggle("dark-mode", darkMode);

    return () => {
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
    };
  }, [darkMode]);

  function handleSignOut() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className={`app-shell${darkMode ? " dark-mode" : ""}`}>
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-head">
          <div className="brand-lockup">
            <span className="brand-mark">BC</span>
            <div>
              <strong>Boost Coach</strong>
            </div>
          </div>
          <button className="icon-button mobile-only" type="button" onClick={() => setOpen(false)} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section">Sport</span>
          {navItems.map((item) => <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />)}
          {isAdmin ? (
            <>
              <span className="nav-section">Gestion</span>
              {adminItems.map((item) => <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />)}
            </>
          ) : null}
        </nav>

        <button className="logout-button" type="button" onClick={handleSignOut}>
          <LogOut size={18} />
          Déconnexion
        </button>
        <br/>
        <br/>
        <div className="user-card">
          <span className="avatar">{session?.username?.slice(0, 2).toUpperCase() || "US"}</span>
          <div>
            <strong>{session?.username}</strong>
            <small>{session?.loyaltyPoints ?? 0} points fidélité</small>
          </div>
        </div>

      </aside>

      {open ? <button className="scrim" type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" /> : null}

      <div className="main-shell">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu size={20} />
          </button>
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <div className="topbar-points">{session?.loyaltyPoints ?? 0} pts</div>
        </header>
        <div className="content-shell">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
