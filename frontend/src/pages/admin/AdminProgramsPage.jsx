import { Save, Trash2, Plus, X, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProgram, deleteProgram, getPrograms } from "../../api/coachingApi";
import { ErrorState, Field, LoadingState, PageHeader } from "../../components/ui.jsx";
import s from "../../styles/AdminProgramsPage.module.css";

const PAGE_SIZE = 20;

const initialProgram = {
  title: "",
  description: "",
  category: "",
  objective: "",
  level: "BEGINNER",
  durationWeeks: "",
};

const LEVEL_LABELS = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
};

const LEVEL_BADGE = {
  BEGINNER: "badge-green",
  INTERMEDIATE: "badge-orange",
  ADVANCED: "badge-red",
};

export default function AdminProgramsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialProgram);
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);

  const programs = useQuery({
    queryKey: ["programs", "admin"],
    queryFn: () => getPrograms({}),
  });

  const save = useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      setForm(initialProgram);
      setPanelOpen(false);
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  function openCreate() {
    setForm(initialProgram);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setForm(initialProgram);
  }

  function submit(e) {
    e.preventDefault();
    save.mutate({
      ...form,
      durationWeeks: form.durationWeeks ? Number(form.durationWeeks) : undefined,
    });
  }

  const allPrograms = programs.data || [];
  const totalPages = Math.max(1, Math.ceil(allPrograms.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = allPrograms.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
            <span className={s.panelEyebrow}>Nouveau programme</span>
            <h2 className={s.panelTitle}>Créer un programme</h2>
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
          <Field label="Titre du programme">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Préparation marathon 10 semaines"
              required
            />
          </Field>

          <div className={s.formRow}>
            <Field label="Catégorie">
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ex : Course à pied"
              />
            </Field>
            <Field label="Durée (semaines)">
              <input
                type="number"
                min="1"
                value={form.durationWeeks}
                onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
                placeholder="Ex : 8"
              />
            </Field>
          </div>

          <div className={s.formRow}>
            <Field label="Niveau">
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="Objectif">
              <input
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                placeholder="Ex : Endurance"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez le contenu et les bénéfices du programme…"
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
              {save.isPending ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      </aside>

      {/* ── Page header ── */}
      <div className={s.headerWrap}>
        <PageHeader
          eyebrow="Admin"
          title="Gestion coaching"
          description="Créez les programmes proposés aux utilisateurs."
        />
        <button type="button" className={s.addBtn} onClick={openCreate}>
          <Plus size={18} />
          Nouveau programme
        </button>
      </div>

      {/* ── Programs table ── */}
      <section className={`section ${s.tableSection}`}>
        <div className={s.tableHeader}>
          <div>
            <div className={s.sectionLabelRow}>
              <Dumbbell size={16} className={s.sectionIcon} />
              <h2 className={s.sectionHeading}>Programmes existants</h2>
            </div>
            {!programs.isLoading && !programs.isError && (
              <p className={s.tableCount}>
                {allPrograms.length} programme{allPrograms.length !== 1 ? "s" : ""} au total
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

        {programs.isLoading ? (
          <LoadingState />
        ) : programs.isError ? (
          <ErrorState error={programs.error} />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Catégorie</th>
                    <th>Objectif</th>
                    <th>Niveau</th>
                    <th>Durée</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((program) => (
                    <tr key={program.id} className={s.tableRow}>
                      <td className={s.titleCell}>
                        <span className={s.programTitle}>{program.title}</span>
                        {program.description && (
                          <span className={s.programDesc}>
                            {program.description.length > 60
                              ? program.description.slice(0, 60) + "…"
                              : program.description}
                          </span>
                        )}
                      </td>
                      <td>
                        {program.category && (
                          <span className={`badge ${s.categoryBadge}`}>
                            {program.category}
                          </span>
                        )}
                      </td>
                      <td className={s.objectiveCell}>{program.objective}</td>
                      <td>
                        <span className={`badge ${LEVEL_BADGE[program.level] ?? ""} ${s.levelBadge}`}>
                          {LEVEL_LABELS[program.level] ?? program.level}
                        </span>
                      </td>
                      <td className={s.durationCell}>
                        {program.durationWeeks
                          ? `${program.durationWeeks} sem.`
                          : <span className={s.noValue}>—</span>}
                      </td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className={`danger ${s.deleteBtn}`}
                          onClick={() => remove.mutate(program.id)}
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
                  <strong>{Math.min(safePage * PAGE_SIZE, allPrograms.length)}</strong>{" "}
                  sur <strong>{allPrograms.length}</strong> programmes
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
        aria-label="Ajouter un programme"
      >
        <Plus size={22} />
      </button>
    </>
  );
}