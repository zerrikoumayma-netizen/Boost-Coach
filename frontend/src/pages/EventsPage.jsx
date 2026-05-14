import { CalendarDays, ExternalLink, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../api/eventsApi";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, formatDate } from "../components/ui.jsx";
import s from "../styles/EventsPage.module.css";

const eventTypes = ["", "MARATHON", "TOURNAMENT", "WORKSHOP", "OTHER"];

export default function EventsPage() {
  const [filters, setFilters] = useState({ city: "", type: "", upcomingOnly: true });

  const events = useQuery({
    queryKey: ["events", filters],
    queryFn: () => getEvents(filters),
  });

  const items = events.data || [];

  return (
    <>
      <PageHeader
        eyebrow="Communauté"
        title="Événements sportifs"
        description="Trouvez les ateliers, compétitions et rendez-vous sportifs proches de vous."
      />

      {/* ── Toolbar ── */}
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={16} />
          <input
            placeholder="Ville"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
        </div>

        <select
          className={s.filterSelect}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          {eventTypes.map((type) => (
            <option value={type} key={type}>{type || "Tous types"}</option>
          ))}
        </select>

        <label className={s.checkFilter}>
          <input
            type="checkbox"
            checked={filters.upcomingOnly}
            onChange={(e) => setFilters({ ...filters, upcomingOnly: e.target.checked })}
          />
          À venir
        </label>
      </div>

      {/* ── States ── */}
      {events.isLoading && <LoadingState />}
      {events.isError   && <ErrorState error={events.error} />}

      {/* ── Grid ── */}
      {!events.isLoading && !events.isError && (
        <section className={s.grid}>
          {items.map((event) => (
            <article className={s.card} key={event.id}>
              <div className={s.dateBadge}>
                <CalendarDays size={15} />
                {formatDate(event.eventDate)}
              </div>

              <Badge tone="orange">{event.type}</Badge>

              <h2 className={s.cardTitle}>{event.title}</h2>
              <p className={s.cardDesc}>{event.description}</p>

              <div className={s.cardBottom}>
                <span className={s.cityLabel}>
                  <MapPin size={14} />
                  {event.city}
                </span>

                {event.registrationUrl && (
                  <a
                    className={s.registerLink}
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={13} />
                    Inscription
                  </a>
                )}
              </div>
            </article>
          ))}

          {!items.length && <EmptyState title="Aucun événement" />}
        </section>
      )}
    </>
  );
}