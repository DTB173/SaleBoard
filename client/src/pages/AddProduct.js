import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import styles from "./AddProduct.module.css";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) setCategoryId(res.data[0].id);
      })
      .catch(() => setError("Failed to load categories"));
  }, []);

  // Image preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPreview(null);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPreview(null);
    // Reset file input
    const input = document.getElementById("photo-input");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!title.trim()) return setError("Title is required");
    if (!price || price <= 0) return setError("Price must be greater than 0");
    if (!quantity || quantity < 1) return setError("Quantity must be at least 1");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("price_cents", Math.round(parseFloat(price) * 100));
    formData.append("quantity", quantity);
    formData.append("category_id", categoryId);
    if (photoFile) formData.append("photo", photoFile);

    try {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Add New Product</h1>
          <p className={styles.subtitle}>Fill in the details below</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.inputGroup}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Wireless Headphones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          {/* Description */}
          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={styles.textarea}
            />
          </div>

          {/* Price & Quantity */}
          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label htmlFor="price" className={styles.label}>
                Price <span className={styles.required}>*</span>
              </label>
              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label htmlFor="quantity" className={styles.label}>
                Quantity <span className={styles.required}>*</span>
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

          {/* Category */}
          <div className={styles.inputGroup}>
            <label htmlFor="category" className={styles.label}>
              Category <span className={styles.required}>*</span>
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={styles.select}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

          </div>

          {/* Photo Upload */}
          <div className={styles.inputGroup}>
            <label htmlFor="photo-input" className={styles.label}>
              Product Photo
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {preview && (
              <div className={styles.preview}>
                <img src={preview} alt="Preview" className={styles.previewImg} />
                <button
                  type="button"
                  onClick={removePhoto}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <>
                <span className={styles.spinner}></span> Adding...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          <Link to="/" className={styles.link}>
            Cancel
          </Link>
        </p>
      </div>
    </div>
  );
}