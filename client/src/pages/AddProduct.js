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
  const [success, setSuccess] = useState(false);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPreview(null);
    const input = document.getElementById("photo-input");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!title.trim())                    { setLoading(false); return setError("Title is required");}
    if (!price || parseFloat(price) <= 0) { setLoading(false); return setError("Valid price is required");}
    if (!quantity || quantity < 1)        { setLoading(false); return setError("Quantity must be at least 1");}
    if (!categoryId)                      { setLoading(false); return setError("Please select a category");}

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim() || "");
    formData.append("price_cents", Math.round(parseFloat(price) * 100));
    formData.append("quantity", quantity);
    formData.append("category_id", categoryId);
    if (photoFile) formData.append("photo", photoFile);

    try {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to add product. Please try again.");
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
        {success && <p className={styles.success}>Product added successfully! Redirecting...</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
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

          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label htmlFor="price" className={styles.label}>
                Price ($) <span className={styles.required}>*</span>
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
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
                className={styles.input}
              />
            </div>
          </div>

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

          <div className={styles.inputGroup}>
            <label htmlFor="photo-input" className={styles.label}>
              Product Photo (Optional)
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
                <button type="button" onClick={removePhoto} className={styles.removeBtn}>
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>

        <p className={styles.footerText}>
          <Link to="/" className={styles.link}>← Cancel</Link>
        </p>
      </div>
    </div>
  );
}