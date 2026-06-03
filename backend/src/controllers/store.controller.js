import { getAllRequests, getAllProducts } from "../services/data.service.js";
import pool from "../config/db.js";

export const getStoreSummary = async (req, res) => {
  try {
    const stockRequests = await getAllRequests();
    res.status(200).json({
      summary: {
        tokoAktif:       1,
        transaksiHariIni: 0,
        pendingRestock:  stockRequests.filter(r => r.status === "Menunggu").length,
        estimasiOmzet:   0,
      },
      reports: [], shipments: [], transactions: [], requests: stockRequests,
    });
  } catch (err) {
    console.error("Error getStoreSummary:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
