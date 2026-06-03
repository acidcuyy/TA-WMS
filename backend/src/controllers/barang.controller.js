import pool from "../config/db.js";

export const getBarang = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("Error getBarang:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addBarang = async (req, res) => {
  const { nama, stok, sku, category, price } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, stock, sku, category, price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nama, stok, sku || `SKU-${Date.now()}`, category || "General", price || 0]
    );

    res.json({
      message: "Barang berhasil ditambah",
      data: rows[0],
    });
  } catch (err) {
    console.error("Error addBarang:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};