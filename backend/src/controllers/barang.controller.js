import barang from "../data/barang.js";

export const getBarang = (req, res) => {
  res.json(barang);
};

export const addBarang = (req, res) => {
  const { nama, stok } = req.body;

  const newBarang = {
    id: barang.length + 1,
    nama,
    stok,
  };

  barang.push(newBarang);

  res.json({
    message: "Barang berhasil ditambah",
    data: newBarang,
  });
};