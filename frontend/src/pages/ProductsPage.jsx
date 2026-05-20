import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productsApi";
import ReactionButton from "../components/ReactionButton.jsx";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, ProductImage, formatPrice, getStockTotal } from "../components/ui.jsx";
import s from "../styles/ProductsPage.module.css";

const PAGE_SIZE = 15;

/** Build a compact page range like: 1 2 … 5 6 7 … 12 13 */
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
  });
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever filters change
  function updateFilters(next) {
    setFilters(next);
    setPage(1);
  }

  const products = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });

  const categories = useMemo(() => {
    return [...new Set((products.data || []).map((p) => p.category).filter(Boolean))];
  }, [products.data]);

  // ── Pagination math ──────────────────────────────────────────
  const allProducts  = products.data || [];
  const totalItems   = allProducts.length;
  const totalPages   = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const startIndex   = (safePage - 1) * PAGE_SIZE;
  const pageProducts = allProducts.slice(startIndex, startIndex + PAGE_SIZE);
  const pageRange    = buildPageRange(safePage, totalPages);

  function goTo(p) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={s.page}>
      <div className={s.bgMesh} aria-hidden="true" />

      {/* ── HEADER ── */}
      <div className={s.header}>
        <PageHeader
          eyebrow="Catalogue"
          title="Produits BoostCoach"
          description="Recherchez un produit, vérifiez le stock par ville et gardez vos favoris."
        />
      </div>

      {/* ── TOOLBAR ── */}
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={18} />
          <input
            placeholder="Rechercher un vélo, tapis, chaussures..."
            value={filters.search}
            onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className={s.categorySelect}
          value={filters.category}
          onChange={(e) => updateFilters({ ...filters, category: e.target.value })}
        >
          <option value="">Toutes catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* ── STATES ── */}
      {products.isLoading && <LoadingState />}
      {products.isError   && <ErrorState error={products.error} />}

      {/* ── PRODUCT GRID ── */}
      {!products.isLoading && !products.isError && (
        <>
          {/* Results count */}
          {totalItems > 0 && (
            <div className={s.resultsMeta}>
              <span>
                <strong>{totalItems}</strong> produit{totalItems !== 1 ? "s" : ""} trouvé{totalItems !== 1 ? "s" : ""}
              </span>
              <span>
                Page <strong>{safePage}</strong> sur <strong>{totalPages}</strong>
                {" · "}{startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, totalItems)} affichés
              </span>
            </div>
          )}

          <section className={s.productGrid}>
            {pageProducts.map((product) => (
              <article className={s.productCard} key={product.id}>
                <div className={s.imageWrap}>
                  <Link to={`/app/products/${product.id}`}>
                    <ProductImage src={product.imageUrl} name={product.name} />
                  </Link>
                </div>
                <div className={s.cardBody}>
                  <div className={s.cardTopline}>
                    <Badge>{product.category || "Sport"}</Badge>
                    <ReactionButton targetId={product.id} targetType="PRODUCT" />
                  </div>
                  <Link to={`/app/products/${product.id}`} className={s.cardTitle}>
                    {product.name}
                  </Link>
                  <p className={s.cardDesc}>{product.description}</p>
                  <div className={s.priceRow}>
                    <strong>{formatPrice(product.price)}</strong>
                    <span>{getStockTotal(product.stockByCity)} en stock</span>
                  </div>
                </div>
              </article>
            ))}

            {!totalItems && (
              <EmptyState
                title="Aucun produit trouvé"
                description="Essayez une autre recherche ou catégorie."
              />
            )}
          </section>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <nav className={s.pagination} aria-label="Pagination">
              {/* Prev */}
              <button
                className={s.pageBtn}
                onClick={() => goTo(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Page précédente"
              >
                ←
              </button>

              {pageRange.map((item, i) =>
                item === "…" ? (
                  <span key={`ellipsis-${i}`} className={s.pageEllipsis}>…</span>
                ) : (
                  <button
                    key={item}
                    className={`${s.pageBtn} ${item === safePage ? s.pageBtnActive : ""}`}
                    onClick={() => goTo(item)}
                    aria-current={item === safePage ? "page" : undefined}
                  >
                    {item}
                  </button>
                )
              )}

              {/* Next */}
              <button
                className={s.pageBtn}
                onClick={() => goTo(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Page suivante"
              >
                →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}