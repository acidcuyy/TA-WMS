import { getAllProducts, getProductBySku, updateProductStock } from "../services/data.service.js";
import pool from "../config/db.js";

export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error getProducts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error getProductById:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, unit, rack, stock, price, icon } = req.body;
    const status = stock <= 0 ? "Habis" : stock < 50 ? "Menipis" : "Aman";
    const { rows } = await pool.query(
      `INSERT INTO products (name, sku, category, unit, rack, stock, price, status, icon)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, sku, category || "", unit || "Pcs", rack || "", stock || 0, price || 0, status, icon || "📦"]
    );
    res.status(201).json({ message: "Produk berhasil ditambahkan", data: rows[0] });
  } catch (err) {
    console.error("Error createProduct:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, sku, category, unit, rack, stock, price, icon, active } = req.body;
    const status = stock !== undefined ? (stock <= 0 ? "Habis" : stock < 50 ? "Menipis" : "Aman") : undefined;
    const { rows } = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name), sku = COALESCE($2, sku),
        category = COALESCE($3, category), unit = COALESCE($4, unit),
        rack = COALESCE($5, rack), stock = COALESCE($6, stock),
        price = COALESCE($7, price), status = COALESCE($8, status),
        icon = COALESCE($9, icon), active = COALESCE($10, active),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [name, sku, category, unit, rack, stock, price, status, icon, active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json({ message: "Produk berhasil diperbarui", data: rows[0] });
  } catch (err) {
    console.error("Error updateProduct:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error("Error deleteProduct:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
