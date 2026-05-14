import { Boxes, CalendarCheck, HeartPulse, MapPin, Route, Sparkles, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getEvents } from "../api/eventsApi";
import { getProducts } from "../api/productsApi";
import { getPrograms, getSessionStats } from "../api/coachingApi";
import { getProfile } from "../api/profileApi";
import { useAuth } from "../auth/AuthProvider.jsx";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, StatCard, formatDate, formatPrice } from "../components/ui.jsx";
import { buildRecommendations, getRecommendationHistory, getRecommendationProfile } from "../data/recommendationEngine";
import styles from "../styles/DashboardPage.module.css";

export default function DashboardPage() {
  const { session } = useAuth();
  const stats    = useQuery({ queryKey: ["sessionStats"], queryFn: getSessionStats });
  const products = useQuery({ queryKey: ["products", "dashboard"], queryFn: () => getProducts({}) });
  const programs = useQuery({ queryKey: ["programs", "dashboard"], queryFn: () => getPrograms({}) });
  const events   = useQuery({ queryKey: ["events", "upcoming"], queryFn: () => getEvents({ upcomingOnly: true }) });
  const profile  = useQuery({ queryKey: ["profile", "dashboard"], queryFn: getProfile, retry: false });
 
  const recommendationProfile = getRecommendationProfile({
    username: session?.username,
    ...(profile.data || {}),
  });
 
  const recommendations = useMemo(
    () => buildRecommendations(recommendationProfile, products.data || []),
    [
      recommendationProfile.city,
      recommendationProfile.hobby,
      recommendationProfile.level,
      recommendationProfile.objective,
      recommendationProfile.objectives,
      recommendationProfile.budget,
      products.data,
    ],
  );
 
  const history = getRecommendationHistory();
 
  return (
    <div className={styles.page}>
      {/* Ambient background mesh */}
      <div className={styles.bgMesh} aria-hidden="true" />
 
      {/* ── PAGE HEADER ── */}
      <div className={styles.header}>
        <PageHeader
          eyebrow="Tableau de bord"
          title={`Bonjour ${session?.username || ""} 👋`}
          description="Votre activité sportive, vos points et les raccourcis les plus utiles."
        />
      </div>
 
      {/* ── STATS ── */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <StatCard icon={Trophy}       label="Points fidélité"    value={stats.data?.loyaltyPoints ?? session?.loyaltyPoints ?? 0} tone="green" />
        </div>
        <div className={styles.statCard}>
          <StatCard icon={CalendarCheck} label="Séances terminées"  value={stats.data?.completedSessions ?? 0} tone="blue" />
        </div>
        <div className={styles.statCard}>
          <StatCard icon={HeartPulse}   label="Programmes actifs"  value={programs.data?.length ?? "-"} tone="red" />
        </div>
      </section>
 
      {/* ── RECOMMENDATION HERO ── */}
      <section className={styles.hero}>
        <div>
          <span className="eyebrow">Moteur intelligent</span>
          <h2>Recommandations Decathlon Maroc</h2>
          <p>
            {recommendationProfile.city || "Maroc"} · {recommendationProfile.hobby || "Fitness"} · budget{" "}
            {recommendationProfile.budget || 0} MAD
          </p>
        </div>
        <div className={styles.compatibilityRing}>
          <strong>{recommendations.products[0]?.score || 0}%</strong>
          <span>meilleur match</span>
        </div>
      </section>
 
      {/* ── RECOMMENDATION GRID ── */}
      <section className={styles.recoGrid}>
 
        {/* Products — wide */}
        <div className={`${styles.panel} ${styles.wideReco}`}>
          <div className={styles.panelTitleRow}>
            <h2>Produits adaptés</h2>
            <Link to="/app/products">Voir catalogue →</Link>
          </div>
          <div className={styles.productRecoGrid}>
            {recommendations.products.map((product) => (
              <article className={styles.productRecoCard} key={product.id}>
                {product.image && <img src={product.image} alt={product.name} />}
                <div className={styles.productRecoCardBody}>
                  <div className={styles.cardTopline}>
                    <Badge tone="green">{product.badge}</Badge>
                    <span className={styles.matchScore}>
                      <Sparkles size={14} />
                      {product.score}%
                    </span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
              </article>
            ))}
            {!recommendations.products.length && <EmptyState title="Aucun produit disponible" />}
          </div>
        </div>
 
        {/* Events */}
        <div className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Événements proches</h2>
            <Link to="/app/events">Voir →</Link>
          </div>
          <div className={styles.recoList}>
            {recommendations.events.map((event) => (
              <article className={styles.recoListItem} key={event.id}>
                <img src={event.image} alt={event.name} />
                <div>
                  <strong>{event.name}</strong>
                  <span>{event.city} · {event.sport}</span>
                  <small>{formatDate(event.date)}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
 
        {/* Nearest Store */}
        <div className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Magasin proche</h2>
          </div>
          <div className={styles.storeCard}>
            <MapPin size={22} color="var(--blue)" />
            <strong>{recommendations.nearestStore.name}</strong>
            <span>{recommendations.nearestStore.address}</span>
            <em>📍 {recommendations.nearestStore.distance} km</em>
            <a
              className={styles.storeDirectionBtn}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(recommendations.nearestStore.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Route size={15} />
              Itinéraire
            </a>
          </div>
        </div>
 
        {/* History */}
        <div className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Historique</h2>
          </div>
          <div className={styles.historyList}>
            {history.slice(0, 3).map((item) => (
              <div className={styles.historyItem} key={item.createdAt}>
                <strong>{item.profile?.hobby || "Profil sportif"}</strong>
                <span>{item.products?.length || 0} produits · {formatDate(item.createdAt)}</span>
              </div>
            ))}
            {!history.length && <EmptyState title="Aucun historique" />}
          </div>
        </div>
 
      </section>
 
      {/* ── BOTTOM DASHBOARD GRID ── */}
      <div className={styles.dashGrid}>
 
        {/* Programs */}
        <section className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Programmes à essayer</h2>
            <Link to="/app/programs">Voir tout →</Link>
          </div>
          {programs.isLoading ? (
            <LoadingState />
          ) : programs.isError ? (
            <ErrorState error={programs.error} />
          ) : (
            <div className={styles.stackList}>
              {(programs.data || []).slice(0, 3).map((program) => (
                <Link className={styles.compactCard} to="/app/programs" key={program.id}>
                  <div>
                    <strong>{program.title}</strong>
                    <span>{program.category} · {program.durationWeeks} semaines</span>
                  </div>
                  <Badge tone="green">{program.level}</Badge>
                </Link>
              ))}
              {!programs.data?.length && <EmptyState title="Aucun programme" />}
            </div>
          )}
        </section>
 
        {/* Events */}
        <section className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Événements à venir</h2>
            <Link to="/app/events">Voir tout →</Link>
          </div>
          {events.isLoading ? (
            <LoadingState />
          ) : events.isError ? (
            <ErrorState error={events.error} />
          ) : (
            <div className={styles.stackList}>
              {(events.data || []).slice(0, 3).map((event) => (
                <Link className={styles.compactCard} to="/app/events" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.city} · {formatDate(event.eventDate)}</span>
                  </div>
                  <Badge>{event.type}</Badge>
                </Link>
              ))}
              {!events.data?.length && <EmptyState title="Aucun événement à venir" />}
            </div>
          )}
        </section>
 
        {/* Quick catalog — full width */}
        <section className={`${styles.panel} ${styles.dashGridWide}`}>
          <div className={styles.panelTitleRow}>
            <h2>Catalogue rapide</h2>
            <Link to="/app/products">Explorer →</Link>
          </div>
          {products.isLoading ? (
            <LoadingState />
          ) : products.isError ? (
            <ErrorState error={products.error} />
          ) : (
            <div className={styles.miniProductGrid}>
              {(products.data || []).slice(0, 4).map((product) => (
                <Link className={styles.miniProduct} to={`/app/products/${product.id}`} key={product.id}>
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                  <em>{formatPrice(product.price)}</em>
                </Link>
              ))}
            </div>
          )}
        </section>
 
      </div>
    </div>
  );
}
