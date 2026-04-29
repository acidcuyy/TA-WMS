import { getCollection, updateCollection, readDB } from "../services/data.service.js";

export const getStockSummary = async (req, res) => {
  const products = await getCollection("products");
  
  // Basic calculation for summary
  const totalStokPerusahaan = products.reduce((acc, p) => acc + p.stock, 0);
  // Simulating gudang vs toko for now
  const stokGudang = Math.floor(totalStokPerusahaan * 0.8);
  const stokToko = totalStokPerusahaan - stokGudang;

  res.status(200).json({
    totalPerusahaan: totalStokPerusahaan,
    stokGudang,
    stokToko,
  });
};

export const getStockRequests = async (req, res) => {
  const requests = await getCollection("stock_requests");
  res.status(200).json(requests);
};

export const createStockRequest = async (req, res) => {
  const requests = await getCollection("stock_requests");
  
  const newRequest = {
    id: `ADD-${String(requests.length + 1).padStart(3, "0")}`,
    tanggal: new Date().toLocaleString("id-ID", { 
      day: "2d", 
      month: "short", 
      year: "numeric", 
      hour: "2d", 
      minute: "2d" 
    }),
    ...req.body,
    status: "Pending",
  };

  requests.unshift(newRequest); // Newest first
  await updateCollection("stock_requests", requests);

  res.status(201).json({
    message: "Request penambahan stok berhasil dikirim",
    data: newRequest,
  });
};

export const updateStockRequestStatus = async (req, res) => {
  const requests = await getCollection("stock_requests");
  const { id } = req.params;
  const { status } = req.body;

  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Request tidak ditemukan" });
  }

  requests[index].status = status;
  await updateCollection("stock_requests", requests);

  res.status(200).json({
    message: "Status request berhasil diperbarui",
    data: requests[index],
  });
};
