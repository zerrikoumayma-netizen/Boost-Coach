import { ArrowLeft, MapPin, SearchCheck } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getProduct, getProductCityAvailability } from "../api/productsApi";
import ReactionButton from "../components/ReactionButton.jsx";
import { Badge, ErrorState, LoadingState, PageHeader, ProductImage, formatPrice } from "../components/ui.jsx";
import s from "../styles/ProductDetailPage.module.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [city, setCity] = useState("");
  const [checkedCity, setCheckedCity] = useState("");

  const product = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  const availability = useQuery({
    queryKey: ["productAvailability", id, checkedCity],
    queryFn: () => getProductCityAvailability(id, checkedCity),
    enabled: Boolean(checkedCity),
  });

  if (product.isLoading) return <LoadingState />;
  if (product.isError)   return <ErrorState error={product.error} />;

  const item         = product.data;
  const stockEntries = Object.entries(item.stockByCity || {});

  return (
    <div className={s.page}>
      {/* Ambient blobs */}
      <div className={s.blobA} aria-hidden="true" />
      <div className={s.blobB} aria-hidden="true" />
      <div className={s.bgMesh} aria-hidden="true" />

      {/* Header */}
      <div className={s.header}>
        <PageHeader
          eyebrow="Détail produit"
          title={item.name}
          description={item.description}
          actions={
            <Link className={s.backButton} to="/app/products">
              <ArrowLeft size={18} /> Retour
            </Link>
          }
        />
      </div>

      {/* Two-column layout */}
      <section className={s.detailLayout}>

        {/* ── LEFT: image ── */}
        <div className={s.imageWrap}>
          <ProductImage src={item.imageUrl} name={item.name} />
        </div>

        {/* ── RIGHT: detail panel ── */}
        <div className={s.detailPanel}>

          {/* Top row: badge + reaction */}
          <div className={s.cardTopline}>
            <Badge>{item.category || "Sport"}</Badge>
            <ReactionButton targetId={item.id} targetType="PRODUCT" />
          </div>

          {/* Price */}
          <strong className={s.detailPrice}>{formatPrice(item.price)}</strong>

          {/* Description */}
          <p className={s.detailDescription}>{item.description}</p>

          {/* City availability form */}
          <form
            className={s.inlineForm}
            onSubmit={(e) => { e.preventDefault(); setCheckedCity(city.trim()); }}
          >
            <MapPin size={18} className={s.formIcon} />
            <input
              className={s.formInput}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ville : Casablanca"
            />
            <button className={s.formButton} type="submit">
              <SearchCheck size={16} />
              Vérifier
            </button>
          </form>

          {/* Availability result */}
          {availability.isLoading && checkedCity ? (
            <div className={s.availabilityLoading}>Vérification…</div>
          ) : null}

          {availability.data ? (
            <div className={`${s.availability} ${availability.data.available ? s.availOk : s.availNo}`}>
              <span className={s.availDot} />
              {availability.data.available ? "Disponible" : "Indisponible"} à <strong>{availability.data.city}</strong>
            </div>
          ) : null}

          {/* Stock by city */}
          <h2 className={s.stockTitle}>Stock par ville</h2>
          <div className={s.stockList}>
            {stockEntries.map(([stockCity, quantity]) => (
              <div className={s.stockRow} key={stockCity}>
                <span className={s.stockCity}>
                  <MapPin size={13} />
                  {stockCity}
                </span>
                <strong className={s.stockQty}>{quantity}</strong>
              </div>
            ))}
            {!stockEntries.length && (
              <p className={s.stockEmpty}>Aucune donnée de stock.</p>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}