import { Save, Trash2, Plus, X, ChevronLeft, ChevronRight, Pencil, Calendar } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../../api/eventsApi";
import { ErrorState, Field, LoadingState, PageHeader, formatDate } from "../../components/ui.jsx";
import s from "../../styles/AdminEventsPage.module.css";

const PAGE_SIZE = 20;

const initialEvent = {
  title: "",
  type: "OTHER",
  eventDate: "",
  city: "",
  description: "",
  registrationUrl: "",
};

const eventTypes = ["MARATHON", "TOURNAMENT", "WORKSHOP", "OTHER"];

const TYPE_LABELS = {
  MARATHON: "Marathon",
  TOURNAMENT: "Tournoi",
  WORKSHOP: "Atelier",
  OTHER: "Autre",
};

const TYPE_BADGE = {
  MARATHON: "badge-green",
  TOURNAMENT: "badge-orange",
  WORKSHOP: "badge",
  OTHER: "",
};

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialEvent);
  const [editingId, setEditingId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);

  const events = useQuery({
    queryKey: ["events", "admin"],
    queryFn: () => getEvents({}),
  });

  const save = useMutation({
    mutationFn: (payload) =>
      editingId ? updateEvent(editingId, payload) : createEvent(payload),
    onSuccess: () => {
      setForm(initialEvent);
      setEditingId(null);
      setPanelOpen(false);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  function openCreate() {
    setForm(initialEvent);
    setEditingId(null);
    setPanelOpen(true);
  }

  function openEdit(event) {
    setEditingId(event.id);
    setForm(event);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setForm(initialEvent);
    setEditingId(null);
  }

  function submit(e) {
    e.preventDefault();
    save.mutate(form);
  }

  const allEvents = events.data || [];
  const totalPages = Math.max(1, Math.ceil(allEvents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = allEvents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      {/* ── Backdrop ── */}
      {panelOpen && (
        <button
          type="button"
          className={s.backdrop}
          onClick={closePanel}
          aria-label="Fermer le panneau"
        />
      )}

      {/* ── Slide-in panel ── */}
      <aside className={`${s.panel} ${panelOpen ? s.panelOpen : ""}`}>
        <div className={s.panelHeader}>
          <div>
            <span className={s.panelEyebrow}>
              {editingId ? "Modification" : "Nouvel événement"}
            </span>
            <h2 className={s.panelTitle}>
              {editingId ? "Modifier l'événement" : "Ajouter un événement"}
            </h2>
          </div>
          <button
            type="button"
            className={s.closeBtn}
            onClick={closePanel}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form className={s.panelForm} onSubmit={submit}>
          <Field label="Titre de l'événement">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Marathon de Casablanca"
              required
            />
          </Field>

          <div className={s.formRow}>
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type] ?? type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                required
              />
            </Field>
          </div>

          <Field label="Ville">
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ex : Casablanca"
            />
          </Field>

          <Field label="URL d'inscription">
            <input
              value={form.registrationUrl || ""}
              onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Détails de l'événement…"
            />
          </Field>

          {save.error && (
            <div className="form-alert">{save.error.message}</div>
          )}

          <div className={s.panelActions}>
            <button
              type="button"
              className={`ghost-button ${s.cancelBtn}`}
              onClick={closePanel}
            >
              Annuler
            </button>
            <button
              className={`primary-button ${s.saveBtn}`}
              type="submit"
              disabled={save.isPending}
            >
              <Save size={16} />
              {save.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </aside>

      {/* ── Page header ── */}
      <div className={s.headerWrap}>
        <PageHeader
          eyebrow="Admin"
          title="Gestion des événements"
          description="Publiez les rendez-vous sportifs et gardez les dates à jour."
        />
        <button type="button" className={s.addBtn} onClick={openCreate}>
          <Plus size={18} />
          Nouvel événement
        </button>
      </div>

      {/* ── Events table ── */}
      <section className={`section ${s.tableSection}`}>
        <div className={s.tableHeader}>
          <div>
            <div className={s.sectionLabelRow}>
              <Calendar size={16} className={s.sectionIcon} />
              <h2 className={s.sectionHeading}>Événements existants</h2>
            </div>
            {!events.isLoading && !events.isError && (
              <p className={s.tableCount}>
                {allEvents.length} événement{allEvents.length !== 1 ? "s" : ""} au total
              </p>
            )}
          </div>
          {totalPages > 1 && (
            <div className={s.pagination}>
              <button
                type="button"
                className={s.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>
              <span className={s.pageIndicator}>
                {safePage} <span className={s.pageOf}>/ {totalPages}</span>
              </span>
              <button
                type="button"
                className={s.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {events.isLoading ? (
          <LoadingState />
        ) : events.isError ? (
          <ErrorState error={events.error} />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Ville</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((event) => (
                    <tr key={event.id} className={s.tableRow}>
                      <td className={s.titleCell}>
                        <span className={s.eventTitle}>{event.title}</span>
                        {event.registrationUrl && (
                          <a
                            href={event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={s.regLink}
                          >
                            Inscription ↗
                          </a>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${TYPE_BADGE[event.type] ?? ""} ${s.typeBadge}`}>
                          {TYPE_LABELS[event.type] ?? event.type}
                        </span>
                      </td>
                      <td className={s.dateCell}>
                        {formatDate(event.eventDate)}
                      </td>
                      <td className={s.cityCell}>{event.city}</td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className={s.editBtn}
                          onClick={() => openEdit(event)}
                        >
                          <Pencil size={14} />
                          Modifier
                        </button>
                        <button
                          type="button"
                          className={`danger ${s.deleteBtn}`}
                          onClick={() => remove.mutate(event.id)}
                          disabled={remove.isPending}
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination footer ── */}
            {totalPages > 1 && (
              <div className={s.paginationFooter}>
                <p className={s.pageInfo}>
                  Affichage de{" "}
                  <strong>{(safePage - 1) * PAGE_SIZE + 1}</strong>–
                  <strong>{Math.min(safePage * PAGE_SIZE, allEvents.length)}</strong>{" "}
                  sur <strong>{allEvents.length}</strong> événements
                </p>
                <div className={s.pagination}>
                  <button
                    type="button"
                    className={s.pageBtn}
                    onClick={() => setPage(1)}
                    disabled={safePage === 1}
                    aria-label="Première page"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    className={s.pageBtn}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === totalPages ||
                        Math.abs(n - safePage) <= 1
                    )
                    .reduce((acc, n, i, arr) => {
                      if (i > 0 && n - arr[i - 1] > 1) acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "…" ? (
                        <span key={`ellipsis-${i}`} className={s.pageEllipsis}>…</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          className={`${s.pageBtn} ${item === safePage ? s.pageBtnActive : ""}`}
                          onClick={() => setPage(item)}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    className={s.pageBtn}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    aria-label="Page suivante"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    className={s.pageBtn}
                    onClick={() => setPage(totalPages)}
                    disabled={safePage === totalPages}
                    aria-label="Dernière page"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Mobile FAB ── */}
      <button
        type="button"
        className={s.fab}
        onClick={openCreate}
        aria-label="Ajouter un événement"
      >
        <Plus size={22} />
      </button>
    </>
  );
}