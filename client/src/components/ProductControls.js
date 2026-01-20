import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import styles from "./ProductControls.module.css";

export default function ProductControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  selectedCategory,
  setSelectedCategory,
  showAddButton = false,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(() => {
        setCategories([]);
        setLoading(false);
      });
  }, []);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedQuery, setSearchQuery]);

  return (
    <div className={styles.controls}>
      {/* Search */}
      <div className={styles.searchGroup}>
        <input
          type="text"
          placeholder="Search products..."
          value={debouncedQuery}
          onChange={(e) => setDebouncedQuery(e.target.value)}
          className={styles.searchInput}
        />
        <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className={styles.select}
      >
        <option value="">All Categories</option>
        {loading ? (
          <option disabled>Loading...</option>
        ) : (
          categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))
        )}
      </select>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className={styles.select}
      >
        <option value="created_at_desc">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="views_desc">Most Viewed</option>
      </select>

      {/* Add Product Button (Profile only) */}
      {showAddButton && (
        <Link to="/add-product" className={styles.addBtn}>
          <svg className={styles.plusIcon} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Product
        </Link>
      )}
    </div>
  );
}