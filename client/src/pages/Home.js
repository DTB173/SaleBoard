import ProductControls from "../components/ProductControls";
import { useProductFilters } from "../utils/useProductFilters";
import styles from "./Home.module.css";
import { Link } from "react-router-dom";

export default function Home() {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    products,
    loading,
  } = useProductFilters(false);

  return (
    <div className={styles.container}>
      <ProductControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showAddButton={false}
      />

      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
      ) : products.length === 0 ? (
        <p className={styles.empty}>No products found.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className={styles.card}>
              <img
                src={
                  p.photo_url 
                    ? `${API_BASE_URL}/uploads/${p.photo_url.split('/').pop()}` 
                    : "https://placehold.co/280x180?text=No+Image"
                }
                alt={p.title}
              />
              <h3>{p.title}</h3>
              <p>${(p.price_cents / 100).toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}