import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { addPhotoUrl } from "../utils/AddPhotoUrl.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { search, sort, category_id } = req.query;

  try {
    let query = `
      SELECT p.*, c.name AS category_name, u.full_name AS seller_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.is_active = TRUE
    `;
    const values = [];

    if (search) {
      query += ` AND p.title ILIKE $${values.length + 1}`;
      values.push(`%${search}%`);
    }

    if (category_id) {
      query += ` AND p.category_id = $${values.length + 1}`;
      values.push(category_id);
    }

    const validSorts = {
      created_at_desc: "p.created_at DESC",
      price_asc: "p.price_cents ASC",
      price_desc: "p.price_cents DESC",
      views_desc: "p.views DESC",
    };
    const orderBy = validSorts[sort] || "p.created_at DESC";
    query += ` ORDER BY ${orderBy}`;

    const result = await pool.query(query, values);
    const products = addPhotoUrl(result.rows);

    res.json(products);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try{
    const result = await pool.query(
      `SELECT 
        p.*, c.name AS category_name, 
        u.full_name AS seller_name,
        u.phone AS seller_phone
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.id=$1`,
      [id]
    );

    if (result.rows.length === 0) 
      return res.status(404).json({ error: "Product not found" });

    await pool.query("UPDATE products SET views = views + 1 WHERE id=$1", [id]);

    const product = result.rows[0];
    product.photo_url = product.photo_url
      ? `http://localhost:5005/uploads/${product.photo_url}`
      : null;
    res.json(product);
    res.json(result.rows[0]);
    }catch(err){
      res.status(500).json({ error: err.message });
    }
});


router.post("/", authenticateToken, upload.single("photo"), async (req, res) => {
  const { title, description, price_cents, quantity, category_id } = req.body;
  const photo_url = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      `INSERT INTO products
       (title, description, price_cents, photo_url, quantity, category_id, seller_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [title, description, price_cents, photo_url, quantity, category_id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, price_cents, photo_url, quantity, category_id } = req.body;

  const result = await pool.query(
    `UPDATE products
     SET title=$1, description=$2, price_cents=$3, photo_url=$4, quantity=$5, category_id=$6
     WHERE id=$7 AND seller_id=$8
     RETURNING *`,
    [title, description, price_cents, photo_url, quantity, category_id, id, req.user.id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Product not found or not authorized" });
  res.json(result.rows[0]);
});

router.get("/my/all", authenticateToken, async (req, res) => {
  try {
    const { search, sort, category_id } = req.query;
    const values = [req.user.id];
    let whereClauses = [`seller_id = $1`];

    if (search) {
      values.push(`%${search}%`);
      whereClauses.push(`title ILIKE $${values.length}`);
    }

    if (category_id) {
      values.push(category_id);
      whereClauses.push(`category_id = $${values.length}`);
    }

    let orderBy = "created_at DESC";
    if (sort === "price_asc") orderBy = "price_cents ASC";
    else if (sort === "price_desc") orderBy = "price_cents DESC";
    else if (sort === "created_at_asc") orderBy = "created_at ASC";
    else if (sort === "created_at_desc") orderBy = "created_at DESC";

    const sql = `
      SELECT * FROM products
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY ${orderBy};
    `;

    const result = await pool.query(sql, values);
    res.json(addPhotoUrl(result.rows));
  } catch (err) {
    console.error("GET /my/all error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/my/active", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE seller_id = $1 AND is_active = TRUE ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(addPhotoUrl(result.rows));
  } catch (err) {
    console.error("GET /my/all error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/my/inactive", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE seller_id = $1 AND is_active = FALSE ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(addPhotoUrl(result.rows));
  } catch (err) {
    console.error("GET /my/all error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/toggle", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT is_active FROM products WHERE id=$1 AND seller_id=$2",
      [id, req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

    const currentStatus = result.rows[0].is_active;
    const newStatus = !currentStatus;

    await pool.query(
      "UPDATE products SET is_active=$1 WHERE id=$2 AND seller_id=$3",
      [newStatus, id, req.user.id]
    );

    res.json({
      message: newStatus ? "Product reactivated" : "Product deactivated",
      is_active: newStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch(
  "/:id",
  authenticateToken,
  upload.single("photo"),
  async (req, res) => {
    const { id } = req.params;
    const { title, description, price_cents, quantity, category_id } = req.body;

    try {
      const ownerCheck = await pool.query(
        "SELECT seller_id FROM products WHERE id = $1",
        [id]
      );
      if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].seller_id !== req.user.id) {
        return res.status(404).json({ error: "Product not found or unauthorized" });
      }

      const fields = [];
      const values = [];
      let index = 1;

      if (title !== undefined) { fields.push(`title = $${index++}`); values.push(title.trim()); }
      if (description !== undefined) { fields.push(`description = $${index++}`); values.push(description?.trim()); }
      if (price_cents !== undefined) { fields.push(`price_cents = $${index++}`); values.push(parseInt(price_cents)); }
      if (quantity !== undefined) { fields.push(`quantity = $${index++}`); values.push(parseInt(quantity)); }
      if (category_id !== undefined) { fields.push(`category_id = $${index++}`); values.push(parseInt(category_id)); }

      let photoFilename = null;
      if (req.file) {
        photoFilename = req.file.filename;
        fields.push(`photo_url = $${index++}`);
        values.push(photoFilename);
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      values.push(id, req.user.id);
      const query = `
        UPDATE products 
        SET ${fields.join(", ")}
        WHERE id = $${index} AND seller_id = $${index + 1}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const updated = result.rows[0];

      updated.photo_url = updated.photo_url
        ? `http://localhost:5005/uploads/${updated.photo_url}`
        : null;

      res.json(updated);
    } catch (err) {
      console.error("PATCH /products/:id error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete("/:id/hard", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id=$1 AND seller_id=$2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
