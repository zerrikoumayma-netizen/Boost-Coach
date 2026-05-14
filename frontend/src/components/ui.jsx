import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{Icon ? <Icon size={22} /> : null}</div>
      <strong>{value ?? "-"}</strong>
      <span>{label}</span>
    </article>
  );
}

export function LoadingState({ label = "Chargement..." }) {
  return (
    <div className="state-panel">
      <Loader2 className="spin" size={24} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ error, action }) {
  return (
    <div className="state-panel error-panel">
      <AlertCircle size={24} />
      <span>{error?.message || "Une erreur est survenue."}</span>
      {action}
    </div>
  );
}

export function EmptyState({ title = "Aucun résultat", description }) {
  return (
    <div className="state-panel">
      <strong>{title}</strong>
      {description ? <span>{description}</span> : null}
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

export function Badge({ children, tone = "blue" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function formatPrice(value) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getStockTotal(stockByCity = {}) {
  return Object.values(stockByCity).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
}

export function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        className="product-image"
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="product-image product-fallback" aria-hidden="true">
      {name?.slice(0, 2).toUpperCase() || "DS"}
    </div>
  );
}
