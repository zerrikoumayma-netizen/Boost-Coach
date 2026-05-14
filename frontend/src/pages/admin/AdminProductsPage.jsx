import { Save, Trash2, Plus, X, ChevronLeft, ChevronRight, Pencil, Zap } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, deleteProduct, getProducts, updateProduct, updateProductStock } from "../../api/productsApi";
import { ErrorState, Field, LoadingState, PageHeader, formatPrice } from "../../components/ui.jsx";
import s from "../../styles/AdminProductsPage.module.css";

const PAGE_SIZE = 20;

const initialProduct = {
  name: "",
  price: "",
  category: "",
  description: "",
  imageUrl: "",
  stockByCity: {},
};

function parseStock(value) {
  return value.split(",").reduce((acc, pair) => {
    const [city, quantity] = pair.split(":").map((part) => part?.trim());
    if (city) acc[city] = Number(quantity || 0);
    return acc;
  }, {});
}

function stringifyStock(stock = {}) {
  return Object.entries(stock)
    .map(([city, quantity]) => `${city}: ${quantity}`)
    .join(", ");
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialProduct);
  const [editingId, setEditingId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [stockPatch, setStockPatch] = useState({ productId: "", city: "", quantity: 0 });
  const [page, setPage] = useState(1);

  const products = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => getProducts({}),
  });

  const save = useMutation({
    mutationFn: (payload) =>
      editingId ? updateProduct(editingId, payload) : createProduct(payload),
    onSuccess: () => {
      setForm(initialProduct);
      setEditingId(null);
      setPanelOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  const patchStock = useMutation({
    mutationFn: () =>
      updateProductStock(stockPatch.productId, stockPatch.city, stockPatch.quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  function openCreate() {
    setForm(initialProduct);
    setEditingId(null);
    setPanelOpen(true);
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({ ...product, stockByCity: stringifyStock(product.stockByCity) });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setForm(initialProduct);
    setEditingId(null);
  }

  function submitProduct(event) {
    event.preventDefault();
    save.mutate({
      ...form,
      price: Number(form.price),
      stockByCity:
        typeof form.stockByCity === "string"
          ? parseStock(form.stockByCity)
          : form.stockByCity,
    });
  }

  const allProducts = products.data || [];
  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = allProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      {panelOpen && (
        <button
          type="button"
          className={s.backdrop}
          onClick={closePanel}
          aria-label="Fermer le panneau"
        />
      )}

      <aside className={`${s.panel} ${panelOpen ? s.panelOpen : ""}`}>
        <div className={s.panelHeader}>
          <div>
            <span className={s.panelEyebrow}>
              {editingId ? "Modification" : "Nouveau produit"}
            </span>
            <h2 className={s.panelTitle}>
              {editingId ? "Modifier le produit" : "Ajouter au catalogue"}
            </h2>
          </div>
          <button type="button" className={s.closeBtn} onClick={closePanel} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <form className={s.panelForm} onSubmit={submitProduct}>
          <Field label="Nom du produit">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex : Chaussures de running X"
              required
            />
          </Field>
          <div className={s.formRow}>
            <Field label="Prix (MAD)">
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </Field>
            <Field label="Catégorie">
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ex : Chaussures"
              />
            </Field>
          </div>
          <Field label="URL de l'image">
            <input
              value={form.imageUrl || ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez le produit..."
            />
          </Field>
          <Field label="Stock par ville">
            <input
              value={form.stockByCity || ""}
              onChange={(e) => setForm({ ...form, stockByCity: e.target.value })}
              placeholder="Casablanca: 5, Rabat: 3"
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

      <div className={s.headerWrap}>
        <PageHeader
          eyebrow="Admin"
          title="Gestion du catalogue"
          description="Créez, modifiez, supprimez les produits et ajustez le stock par ville."
        />
        <button type="button" className={s.addBtn} onClick={openCreate}>
          <Plus size={18} />
          Nouveau produit
        </button>
      </div>

      <section className={`section ${s.quickStockSection}`}>
        <div className={s.sectionLabelRow}>
          <Zap size={16} className={s.sectionIcon} />
          <h2 className={s.sectionHeading}>Ajustement rapide du stock</h2>
        </div>
        <form
          className={s.quickStockForm}
          onSubmit={(e) => { e.preventDefault(); patchStock.mutate(); }}
        >
          <Field label="Produit">
            <select
              value={stockPatch.productId}
              onChange={(e) => setStockPatch({ ...stockPatch, productId: e.target.value })}
              required
            >
              <option value="">Choisir un produit…</option>
              {allProducts.map((p) => (
                <option value={p.id} key={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Ville">
            <input
              value={stockPatch.city}
              onChange={(e) => setStockPatch({ ...stockPatch, city: e.target.value })}
              placeholder="Ex : Casablanca"
              required
            />
          </Field>
          <Field label="Quantité">
            <input
              type="number"
              value={stockPatch.quantity}
              onChange={(e) => setStockPatch({ ...stockPatch, quantity: Number(e.target.value) })}
              required
            />
          </Field>
          <div className={s.quickStockAction}>
            {patchStock.error && (
              <div className="form-alert">{patchStock.error.message}</div>
            )}
            <button className="primary-button" type="submit" disabled={patchStock.isPending}>
              {patchStock.isPending ? "Mise à jour…" : "Mettre à jour"}
            </button>
          </div>
        </form>
      </section>

      <section className={`section ${s.tableSection}`}>
        <div className={s.tableHeader}>
          <div>
            <h2 className={s.sectionHeading}>Produits existants</h2>
            {!products.isLoading && !products.isError && (
              <p className={s.tableCount}>
                {allProducts.length} produit{allProducts.length !== 1 ? "s" : ""} au total
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

        {products.isLoading ? (
          <LoadingState />
        ) : products.isError ? (
          <ErrorState error={products.error} />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((product) => (
                    <tr key={product.id} className={s.tableRow}>
                      <td className={s.productCell}>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className={s.rowThumb}
                          />
                        )}
                        <span className={s.productName}>{product.name}</span>
                      </td>
                      <td>
                        {product.category && (
                          <span className={`badge ${s.categoryBadge}`}>
                            {product.category}
                          </span>
                        )}
                      </td>
                      <td className={s.priceCell}>
                        {formatPrice(product.price)}
                      </td>
                      <td className={s.stockCell}>
                        {stringifyStock(product.stockByCity) || (
                          <span className={s.noStock}>—</span>
                        )}
                      </td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className={s.editBtn}
                          onClick={() => editProduct(product)}
                        >
                          <Pencil size={14} />
                          Modifier
                        </button>
                        <button
                          type="button"
                          className={`danger ${s.deleteBtn}`}
                          onClick={() => remove.mutate(product.id)}
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

            {totalPages > 1 && (
              <div className={s.paginationFooter}>
                <p className={s.pageInfo}>
                  Affichage de{" "}
                  <strong>{(safePage - 1) * PAGE_SIZE + 1}</strong>–
                  <strong>{Math.min(safePage * PAGE_SIZE, allProducts.length)}</strong>{" "}
                  sur <strong>{allProducts.length}</strong> produits
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

      <button
        type="button"
        className={s.fab}
        onClick={openCreate}
        aria-label="Ajouter un produit"
      >
        <Plus size={22} />
      </button>
    </>
  );
}