import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: "./src/.env" });
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";


const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => res.send("Sale Board API running"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
  console.log(`Server running on http://localhost:${PORT}`)
);