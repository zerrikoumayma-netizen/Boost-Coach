import { Database, Table2, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDataTables, getTablePreview } from "../api/dataApi";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import s from "../styles/DataExplorerPage.module.css";

const PREVIEW_LIMIT = 30;

export default function DataExplorerPage() {
  const tables = useQuery({ queryKey: ["dataTables"], queryFn: getDataTables });
  const [selectedTable, setSelectedTable] = useState("agenda_events");
  const [search, setSearch] = useState("");

  const preview = useQuery({
    queryKey: ["tablePreview", selectedTable],
    queryFn: () => getTablePreview(selectedTable, PREVIEW_LIMIT),
    enabled: Boolean(selectedTable),
  });

  const rows = preview.data?.rows || [];
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  const allTables = tables.data || [];
  const filteredTables = search.trim()
    ? allTables.filter(
        (t) =>
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.name.toLowerCase().includes(search.toLowerCase())
      )
    : allTables;

  const totalRows = preview.data?.totalRows ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Base de données"
        title="Tables importées"
        description="Consultez les événements, statistiques, recommandations et catalogue sans masquer les produits de l'application."
      />

      <section className={s.layout}>
        {/* ── Sidebar ── */}
        <aside className={`section ${s.sidebar}`}>
          <div className={s.sidebarHeader}>
            <div className={s.sidebarTitleRow}>
              <Database size={16} className={s.sidebarIcon} />
              <h2 className={s.sidebarHeading}>Sources</h2>
            </div>
            {!tables.isLoading && !tables.isError && (
              <span className={s.tableCount}>{allTables.length} table{allTables.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {allTables.length > 4 && (
            <div className={s.searchWrap}>
              <Search size={14} className={s.searchIcon} />
              <input
                className={s.searchInput}
                type="text"
                placeholder="Rechercher une table…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {tables.isLoading && <LoadingState label="Lecture des tables…" />}
          {tables.isError && <ErrorState error={tables.error} />}

          {!tables.isLoading && !tables.isError && (
            <div className={s.tableList}>
              {filteredTables.map((table) => {
                const isActive = selectedTable === table.name;
                return (
                  <button
                    key={table.name}
                    type="button"
                    className={`${s.tableBtn} ${isActive ? s.tableBtnActive : ""}`}
                    onClick={() => setSelectedTable(table.name)}
                  >
                    <div className={s.tableBtnInner}>
                      <Table2 size={14} className={s.tableBtnIcon} />
                      <span className={s.tableBtnContent}>
                        <strong className={s.tableBtnLabel}>{table.label}</strong>
                        <small className={s.tableBtnName}>{table.name}</small>
                      </span>
                    </div>
                    <div className={s.tableBtnRight}>
                      <span className={`${s.rowCount} ${table.rows > 0 ? s.rowCountGreen : s.rowCountMuted}`}>
                        {table.rows}
                      </span>
                      <ChevronRight size={14} className={s.tableBtnChevron} />
                    </div>
                  </button>
                );
              })}
              {filteredTables.length === 0 && (
                <p className={s.noResults}>Aucune table trouvée.</p>
              )}
            </div>
          )}
        </aside>

        {/* ── Preview panel ── */}
        <section className={`section ${s.preview}`}>
          <div className={s.previewHeader}>
            <div>
              <span className={s.previewEyebrow}>Aperçu</span>
              <h2 className={s.previewTitle}>
                {preview.data?.label || selectedTable || "—"}
              </h2>
              {!preview.isLoading && !preview.isError && (
                <p className={s.previewMeta}>
                  <strong>{totalRows.toLocaleString("fr-FR")}</strong> ligne{totalRows !== 1 ? "s" : ""} au total
                  {rows.length > 0 && totalRows > rows.length && (
                    <> · affichage des <strong>{rows.length}</strong> premières</>
                  )}
                </p>
              )}
            </div>
            {columns.length > 0 && (
              <span className={s.columnCount}>
                {columns.length} colonne{columns.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {preview.isLoading && <LoadingState label="Chargement des données…" />}
          {preview.isError && <ErrorState error={preview.error} />}

          {!preview.isLoading && !preview.isError && rows.length > 0 && (
            <div className={`table-wrap ${s.tableWrap}`}>
              <table className={s.dataTable}>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className={s.th}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={`${selectedTable}-${i}`} className={s.dataRow}>
                      {columns.map((col) => (
                        <td key={col} className={s.td}>
                          <CellValue value={row[col]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!preview.isLoading && !preview.isError && rows.length === 0 && (
            <EmptyState
              title="Aucune donnée"
              description="Cette table est vide ou inaccessible avec la configuration actuelle."
            />
          )}
        </section>
      </section>
    </>
  );
}

function CellValue({ value }) {
  if (value === null || value === undefined || value === "") {
    return <span className={s.cellNull}>—</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={value ? s.cellTrue : s.cellFalse}>
        {value ? "true" : "false"}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className={s.cellNumber}>{value.toLocaleString("fr-FR")}</span>;
  }
  if (typeof value === "object") {
    return <code className={s.cellJson}>{JSON.stringify(value)}</code>;
  }
  const text = String(value);
  const truncated = text.length > 140;
  return (
    <span className={s.cellText} title={truncated ? text : undefined}>
      {truncated ? `${text.slice(0, 140)}…` : text}
    </span>
  );
}