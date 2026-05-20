import { CalendarCheck, HeartPulse, MapPin, Route, Sparkles, Trophy } from "lucide-react";
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
  const stats = useQuery({ queryKey: ["sessionStats"], queryFn: getSessionStats });
  const products = useQuery({ queryKey: ["products", "dashboard"], queryFn: () => getProducts({}) });
  const programs = useQuery({ queryKey: ["programs", "dashboard"], queryFn: () => getPrograms({}) });
  const events = useQuery({ queryKey: ["events", "upcoming"], queryFn: () => getEvents({ upcomingOnly: true }) });
  const profile = useQuery({ queryKey: ["profile", "dashboard"], queryFn: getProfile, retry: false });

  const recommendationProfile = getRecommendationProfile({
    username: session?.username,
    ...(profile.data || {}),
  });

  const recommendations = useMemo(
    () => buildRecommendations(recommendationProfile, {
      products: products.data || [],
      events: events.data || [],
      programs: programs.data || [],
    }),
    [
      recommendationProfile.city,
      recommendationProfile.hobby,
      recommendationProfile.level,
      recommendationProfile.objective,
      recommendationProfile.objectives,
      recommendationProfile.budget,
      products.data,
      events.data,
      programs.data,
    ],
  );

  const history = getRecommendationHistory();
  const profileTarget = recommendationProfile.objective || recommendationProfile.hobby || "ce profil";

  return (
    <div className={styles.page}>
      <div className={styles.bgMesh} aria-hidden="true" />

      <div className={styles.header}>
        <PageHeader
          eyebrow="Tableau de bord"
          title={`Bonjour ${session?.username || ""}`}
          description="Votre activite sportive, vos points et les raccourcis les plus utiles."
        />
      </div>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <StatCard icon={Trophy} label="Points fidelite" value={stats.data?.loyaltyPoints ?? session?.loyaltyPoints ?? 0} tone="green" />
        </div>
        <div className={styles.statCard}>
          <StatCard icon={CalendarCheck} label="Seances terminees" value={stats.data?.completedSessions ?? 0} tone="blue" />
        </div>
        <div className={styles.statCard}>
          <StatCard icon={HeartPulse} label="Programmes actifs" value={programs.data?.length ?? "-"} tone="red" />
        </div>
      </section>

      <section className={styles.hero}>
        <div>
          <span className="eyebrow">Moteur intelligent</span>
          <h2>Recommandations Decathlon Maroc</h2>
          <p>
            {recommendationProfile.city || "Maroc"} - {recommendationProfile.hobby || "Fitness"} - budget{" "}
            {recommendationProfile.budget || 0} MAD
          </p>
        </div>
        <div className={styles.compatibilityRing}>
          <strong>{recommendations.products[0]?.score || 0}%</strong>
          <span>meilleur match</span>
        </div>
      </section>

      <section className={styles.recoGrid}>
        <div className={`${styles.panel} ${styles.wideReco}`}>
          <div className={styles.panelTitleRow}>
            <h2>Produits adaptes</h2>
            <Link to="/app/products">Voir catalogue -></Link>
          </div>
          <div className={styles.productRecoGrid}>
            {recommendations.products.map((product) => (
              <article className={styles.productRecoCard} key={product.id}>
                {product.image && <img src={product.image} alt={product.name} />}
                <div className={styles.productRecoCardBody}>
                  <div className={styles.cardTopline}>
                    <Badge tone={product.alternative ? "blue" : "green"}>
                      {product.alternative ? "Alternative" : product.badge}
                    </Badge>
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
            {!recommendations.products.length && (
              <EmptyState
                title="Aucun produit adapte"
                description={`Essayez d'elargir le budget ou le loisir ${recommendationProfile.hobby || "sportif"}.`}
              />
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Evenements proches</h2>
            <Link to="/app/events">Voir -></Link>
          </div>
          <div className={styles.recoList}>
            {recommendations.events.map((event) => (
              <article className={styles.recoListItem} key={event.id}>
                {event.image ? (
                  <img src={event.image} alt={event.title} />
                ) : (
                  <div className={styles.eventPlaceholder} aria-hidden="true">
                    {event.type?.slice(0, 2).toUpperCase() || "EV"}
                  </div>
                )}
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.city} - {event.type}</span>
                  <small>
                    {formatDate(event.date)}
                    {event.alternative ? " - alternative" : ""}
                  </small>
                </div>
              </article>
            ))}
            {!recommendations.events.length && (
              <EmptyState
                title="Aucun evenement proche adapte"
                description={`Aucune date ne correspond a ${profileTarget}.`}
              />
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Magasin proche</h2>
          </div>
          <div className={styles.storeCard}>
            <MapPin size={22} color="var(--blue)" />
            <strong>{recommendations.nearestStore.name}</strong>
            <span>{recommendations.nearestStore.address}</span>
            <em>{recommendations.nearestStore.distance} km</em>
            <a
              className={styles.storeDirectionBtn}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(recommendations.nearestStore.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Route size={15} />
              Itineraire
            </a>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Historique</h2>
          </div>
          <div className={styles.historyList}>
            {history.slice(0, 3).map((item) => (
              <div className={styles.historyItem} key={item.createdAt}>
                <strong>{item.profile?.hobby || "Profil sportif"}</strong>
                <span>{item.products?.length || 0} produits - {formatDate(item.createdAt)}</span>
              </div>
            ))}
            {!history.length && <EmptyState title="Aucun historique" />}
          </div>
        </div>
      </section>

      <div className={styles.dashGrid}>
        <section className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Programmes a essayer</h2>
            <Link to="/app/programs">Voir tout -></Link>
          </div>
          {programs.isLoading ? (
            <LoadingState />
          ) : programs.isError ? (
            <ErrorState error={programs.error} />
          ) : (
            <div className={styles.stackList}>
              {recommendations.programs.map((program) => (
                <Link className={styles.compactCard} to="/app/programs" key={program.id}>
                  <div>
                    <strong>{program.title}</strong>
                    <span>{program.category} - {program.durationWeeks} semaines</span>
                  </div>
                  <Badge tone={program.alternative ? "blue" : "green"}>
                    {program.alternative ? "Alternative" : program.level}
                  </Badge>
                </Link>
              ))}
              {!recommendations.programs.length && (
                <EmptyState
                  title="Aucun programme adapte"
                  description={`Ajoutez un objectif comme ${recommendationProfile.hobby || "fitness"} ou changez le niveau.`}
                />
              )}
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelTitleRow}>
            <h2>Evenements a venir</h2>
            <Link to="/app/events">Voir tout -></Link>
          </div>
          {events.isLoading ? (
            <LoadingState />
          ) : events.isError ? (
            <ErrorState error={events.error} />
          ) : (
            <div className={styles.stackList}>
              {recommendations.upcomingEvents.map((event) => (
                <Link className={styles.compactCard} to="/app/events" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.city} - {formatDate(event.date)}</span>
                  </div>
                  <Badge tone={event.alternative ? "blue" : "green"}>
                    {event.alternative ? "Alternative" : event.type}
                  </Badge>
                </Link>
              ))}
              {!recommendations.upcomingEvents.length && (
                <EmptyState
                  title="Aucun evenement a venir adapte"
                  description={`Aucune sortie ne correspond a ${profileTarget}.`}
                />
              )}
            </div>
          )}
        </section>

        <section className={`${styles.panel} ${styles.dashGridWide}`}>
          <div className={styles.panelTitleRow}>
            <h2>Catalogue rapide</h2>
            <Link to="/app/products">Explorer -></Link>
          </div>
          {products.isLoading ? (
            <LoadingState />
          ) : products.isError ? (
            <ErrorState error={products.error} />
          ) : (
            <div className={styles.miniProductGrid}>
              {recommendations.quickCatalog.map((product) => (
                <Link className={styles.miniProduct} to={`/app/products/${product.id}`} key={product.id}>
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                  <em>{formatPrice(product.price)}</em>
                </Link>
              ))}
              {!recommendations.quickCatalog.length && (
                <EmptyState
                  title="Aucun article adapte"
                  description={`Le catalogue ne contient pas encore d'article pour ${recommendationProfile.hobby || "ce profil"}.`}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
