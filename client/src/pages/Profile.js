import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import ProductControls from "../components/ProductControls";
import { useProductFilters } from "../utils/useProductFilters";
import api from "../api/api";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const [tab, setTab] = useState("all");
  const [actionLoading, setActionLoading] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [categories, setCategories] = useState([]);

  // Load categories
  useEffect(() => {
    api.get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => console.error("Failed to load categories"));
  }, []);

  // Get user's products using your existing hook
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    products: allProducts,
    setProducts,
    loading,
  } = useProductFilters(true); // true = my products

  // Filter products based on active tab
  const filteredProducts = allProducts.filter((p) => {
    if (tab === "active") return p.is_active;
    if (tab === "inactive") return !p.is_active;
    return true;
  });

  const activeCount = allProducts.filter((p) => p.is_active).length;
  const inactiveCount = allProducts.filter((p) => !p.is_active).length;

  const toggleProduct = async (id, currentStatus) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/products/${id}/toggle`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const hardDelete = async () => {
    const id = deleteConfirm;
    setActionLoading((prev) => ({ ...prev, [id]: true }));

    try {
      await api.delete(`/products/${id}/hard`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

const openEdit = (product) => {
  setEditModal({
    ...product,
    price: (product.price_cents / 100).toFixed(2),
    photoPreview: product.photo_url || null,
    newPhoto: null,
  });
};

  const closeEdit = () => setEditModal(null);

  if (!isLoaded) {
    return <div className={styles.container}>Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Please sign in to view your profile.</p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* User Info */}
      <section className={styles.userCard}>
        <img
          src={user.imageUrl}
          alt={user.fullName || user.username}
          className={styles.avatar}
        />
        <div>
          <h2>{user.fullName || user.username}</h2>
          <p>{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </section>

      {/* Controls */}
      <ProductControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showAddButton={true}
      />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "all" ? styles.active : ""}`} onClick={() => setTab("all")}>
          All ({allProducts.length})
        </button>
        <button className={`${styles.tab} ${tab === "active" ? styles.active : ""}`} onClick={() => setTab("active")}>
          Active ({activeCount})
        </button>
        <button className={`${styles.tab} ${tab === "inactive" ? styles.active : ""}`} onClick={() => setTab("inactive")}>
          Inactive ({inactiveCount})
        </button>
      </div>

      {/* Products List */}
      {loading ? (
        <div className={styles.loader}><div className={styles.spinner} /></div>
      ) : filteredProducts.length === 0 ? (
        <p className={styles.empty}>
          {tab === "all" ? "You haven’t added any products yet." : `No ${tab} products found.`}
          <br/>
          {tab === "all" && <Link to="/add-product" style={{ textDecoration: 'underline', color: 'blue' }}>Add your first product</Link>}
        </p>
      ) : (
        <div className={styles.list}>
          {filteredProducts.map((p) => (
            <div key={p.id} className={styles.row}>
              <Link to={`/product/${p.id}`} className={styles.linkArea}>
                <img
                  src={
                    p.photo_url
                      ? p.photo_url
                      : "https://placehold.co/280x180?text=No+Image"
                  }
                  alt={p.title}
                  className={styles.photo}
                  onError={(e) => (e.target.src = "https://placehold.co/80?text=No+Image")}
                />
                <span className={styles.name}>{p.title}</span>
                <span className={styles.quantity}>Quantity: {p.quantity}</span>
                <span className={styles.price}>
                  ${(p.price_cents / 100).toFixed(2)}
                </span>
              </Link>

              <div className={styles.actions}>
                <button
                  onClick={() => openEdit(p)}
                  className={`${styles.btn} ${styles.btnEdit}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleProduct(p.id, p.is_active)}
                  disabled={actionLoading[p.id]}
                  className={`${styles.btn} ${p.is_active ? styles.btnDeactivate : styles.btnActivate}`}
                >
                  {actionLoading[p.id] ? <span className={styles.miniSpinner}></span> : p.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(p.id)}
                  disabled={actionLoading[p.id]}
                  className={`${styles.btn} ${styles.btnDelete}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Product?</h3>
            <p>This action is <strong>permanent</strong>.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setDeleteConfirm(null)} className={styles.btnCancel}>
                Cancel
              </button>
              <button
                onClick={hardDelete}
                disabled={actionLoading[deleteConfirm]}
                className={styles.btnConfirmDelete}
              >
                {actionLoading[deleteConfirm] ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className={styles.modalOverlay} onClick={closeEdit}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Product</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading((prev) => ({ ...prev, [editModal.id]: true }));
                const formData = new FormData();
                formData.append("title", editModal.title);
                formData.append("description", editModal.description || "");
                formData.append("price_cents", Math.round(editModal.price * 100));
                formData.append("quantity", editModal.quantity);
                formData.append("category_id", editModal.category_id);
                if (editModal.newPhoto) formData.append("photo", editModal.newPhoto);

                try {
                  const res = await api.patch(`/products/${editModal.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  setProducts((prev) =>
                    prev.map((p) => (p.id === editModal.id ? res.data : p))
                  );
                  closeEdit();
                } catch (err) {
                  alert(err.response?.data?.error || "Failed");
                } finally {
                  setActionLoading((prev) => ({ ...prev, [editModal.id]: false }));
                }
              }}
              className={styles.editForm}
            >
              <div className={styles.inputGroup}>
                <label>Title</label>
                <input
                  value={editModal.title}
                  onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea
                  value={editModal.description || ""}
                  onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editModal.price}
                    onChange={(e) => setEditModal({ ...editModal, price: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editModal.quantity}
                    onChange={(e) => setEditModal({ ...editModal, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Category</label>
                <select
                  value={editModal.category_id}
                  onChange={(e) => setEditModal({ ...editModal, category_id: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Photo</label>
                {editModal.photoPreview && (
                  <img src={editModal.photoPreview} alt="Current" className={styles.previewImg} />
                )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setEditModal({
                      ...editModal,
                      newPhoto: file,
                      photoPreview: URL.createObjectURL(file),
                    });
                  }
                }}
              />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeEdit} className={styles.btnCancel}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading[editModal.id]}
                  className={styles.btnSave}
                >
                  {actionLoading[editModal.id] ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}