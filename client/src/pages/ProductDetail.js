import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { API_BASE_URL } from "../api/api";
import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Product not found");
      } finally {
        setLoading(false);
      }
    };


    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.error}>{error || "Product not found"}</p>
          <Link to="/" className={styles.backBtn}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

const imageUrl = product?.photo_url
  ? product.photo_url
  : "https://placehold.co/600x400?text=No+Image";

      console.log(product);
console.log("PHOTO URL:", product?.photo_url);
console.log("IMAGE URL:", imageUrl);


  const formatPhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.grid}>
          {/* Image Section */}
          <div className={styles.imageWrapper}>
            <img
              src={imageUrl}
              alt={product.title}
              className={styles.image}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400?text=No+Image";
              }}
            />
          </div>

          {/* Details Section */}
          <div className={styles.details}>
            <h1 className={styles.title}>{product.title}</h1>
            
            <div className={styles.price}>
              ${(product.price_cents / 100).toFixed(2)}
            </div>

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
                <strong>Seller:</strong> {product.seller_name || "Unknown"}
              </div>

              {product.seller_phone && (
                <div className={styles.metaItem}>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${product.seller_phone}`}
                    className={styles.phoneLink}
                  >
                    {formatPhone(product.seller_phone)}
                  </a>
                </div>
              )}

              <div className={styles.metaItem}>
                <strong>Views:</strong> {product.views || 0}
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/" className={styles.backBtn}>
                ← Back to Products
              </Link>
              
              {product.seller_phone && (
                <a
                  href={`tel:${product.seller_phone}`}
                  className={styles.contactBtn}
                >
                  Contact Seller
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}