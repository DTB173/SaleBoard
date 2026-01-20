import { useState, useEffect } from "react";
import api from "../api/api";

export function useProductFilters(isProfile = false) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at_desc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (sortBy) params.append("sort", sortBy);
    if (selectedCategory) params.append("category_id", selectedCategory);

    const endpoint = isProfile ? "/products/my/all" : "/products";
    const url = `${endpoint}?${params}`;

    setLoading(true);
    api
      .get(url)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchQuery, sortBy, selectedCategory, isProfile]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    products,
    setProducts,
    loading,
  };
}