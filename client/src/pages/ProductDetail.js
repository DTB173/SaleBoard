import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Product not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.error}>{error || "Product not found"}</p>
          <Link to="/" className={styles.link}>
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const formatPhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.grid}>
          {/* Image */}
          <div className={styles.imageWrapper}>
            <img
              src={product.photo_url || "https://via.placeholder.com/500?text=No+Image"}
              alt={product.title}
              className={styles.image}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/500?text=No+Image";
              }}
            />
          </div>

          {/* Details */}
          <div className={styles.details}>
            <h1 className={styles.title}>{product.title}</h1>

            <div className={styles.price}>${(product.price_cents / 100).toFixed(2)}</div>

            {product.description && (
              <div className={styles.description}>
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <strong>Category:</strong> {product.category_name}
              </div>
              <div className={styles.metaItem}>
                <strong>Seller:</strong> {product.seller_name}
              </div>

              {/* Phone Number */}
              {product.seller_phone ? (
                <div className={styles.metaItem}>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${product.seller_phone}`}
                    className={styles.phoneLink}
                  >
                    {formatPhone(product.seller_phone)}
                  </a>
                </div>
              ) : (
                <div className={styles.metaItem}>
                  <strong>Phone:</strong> <em>Not provided</em>
                </div>
              )}

              <div className={styles.metaItem}>
                <strong>Views:</strong> {product.views}
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/" className={styles.backBtn}>
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}