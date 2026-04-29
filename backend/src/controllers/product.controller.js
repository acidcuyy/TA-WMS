import { getCollection, updateCollection } from "../services/data.service.js";

export const getProducts = async (req, res) => {
  const products = await getCollection("products");
  res.status(200).json(products);
};

export const getProductById = async (req, res) => {
  const products = await getCollection("products");
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }
  res.status(200).json(product);
};

export const createProduct = async (req, res) => {
  const products = await getCollection("products");
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
    ...req.body,
    stockStatus: req.body.stock > 10 ? "Aman" : req.body.stock > 0 ? "Stok rendah" : "Habis",
  };

  products.push(newProduct);
  await updateCollection("products", products);

  res.status(201).json({
    message: "Produk berhasil ditambahkan",
    data: newProduct,
  });
};

export const updateProduct = async (req, res) => {
  const products = await getCollection("products");
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  const updatedProduct = {
    ...products[index],
    ...req.body,
    id: products[index].id, // Ensure ID doesn't change
  };

  // Recalculate stock status if stock changed
  if (req.body.stock !== undefined) {
    updatedProduct.stockStatus = updatedProduct.stock > 10 ? "Aman" : updatedProduct.stock > 0 ? "Stok rendah" : "Habis";
  }

  products[index] = updatedProduct;
  await updateCollection("products", products);

  res.status(200).json({
    message: "Produk berhasil diperbarui",
    data: updatedProduct,
  });
};

export const deleteProduct = async (req, res) => {
  const products = await getCollection("products");
  const filteredProducts = products.filter((p) => p.id !== parseInt(req.params.id));

  if (products.length === filteredProducts.length) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  await updateCollection("products", filteredProducts);
  res.status(200).json({ message: "Produk berhasil dihapus" });
};
