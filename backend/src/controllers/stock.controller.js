import { getAllProducts, getAllRequests, createRequest, updateRequestStatus } from "../services/data.service.js";

export const getStockSummary = async (req, res) => {
  try {
    const products = await getAllProducts();
    const total = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    res.status(200).json({
      totalPerusahaan: total,
      stokGudang: Math.floor(total * 0.7),
      stokToko:   Math.ceil(total * 0.3),
    });
  } catch (err) {
    console.error("Error getStockSummary:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStockRequests = async (req, res) => {
  try {
    const requests = await getAllRequests();
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error getStockRequests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createStockRequest = async (req, res) => {
  try {
    const newReq = await createRequest(req.body);
    res.status(201).json({ message: "Request berhasil dikirim", data: newReq });
  } catch (err) {
    console.error("Error createStockRequest:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStockRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateRequestStatus(id, status);
    res.status(200).json({ message: "Status request berhasil diperbarui" });
  } catch (err) {
    console.error("Error updateStockRequestStatus:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
