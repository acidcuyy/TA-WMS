import { useState } from "react";
import { motion } from "framer-motion";
import "./PenerimaanBarangToko.css";

export default function PenerimaanBarangToko() {
  const [activeTab, setActiveTab] = useState("Semua (124)");
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Penerimaan", value: "124", unit: "transaksi", icon: "📥", iconClass: "summary-card__icon--purple", subtext: "Semua transaksi masuk" },
    { label: "Total Item Diterima", value: "2.450", unit: "item", icon: "📦", iconClass: "summary-card__icon--blue", subtext: "Semua item diterima" },
    { label: "Nilai Penerimaan", value: "Rp 58.750.000", unit: "", icon: "💰", iconClass: "summary-card__icon--green", subtext: "Total nilai barang masuk" },
    { label: "Penerimaan Hari Ini", value: "12", unit: "transaksi", icon: "📅", iconClass: "summary-card__icon--orange", subtext: "Hari ini" },
    { label: "Barang Pending", value: "6", unit: "transaksi", icon: "⏳", iconClass: "summary-card__icon--red", subtext: "Menunggu verifikasi" },
  ];

  const tableData = [
    { id: "IN-2025-0042", ref: "TR-2025-0031", source: "Gudang Pusat", date: "24 Mei 2025 09:15", items: "45 item", value: "Rp 12.450.000", status: "Diterima" },
    { id: "IN-2025-0041", ref: "SO-2025-0054", source: "Gudang Cabang", date: "23 Mei 2025 16:20", items: "30 item", value: "Rp 8.250.000", status: "Proses" },
    { id: "IN-2025-0040", ref: "TR-2025-0029", source: "Gudang Pusat", date: "23 Mei 2025 10:05", items: "18 item", value: "Rp 5.400.000", status: "Diterima" },
    { id: "IN-2025-0039", ref: "ADJ-2025-0012", source: "Gudang Pusat", date: "22 Mei 2025 13:40", items: "12 item", value: "Rp 2.100.000", status: "Menunggu" },
    { id: "IN-2025-0038", ref: "TR-2025-0028", source: "Gudang Cabang", date: "22 Mei 2025 09:30", items: "25 item", value: "Rp 6.750.000", status: "Diterima" },
    { id: "IN-2025-0037", ref: "TR-2025-0027", source: "Gudang Pusat", date: "21 Mei 2025 15:10", items: "20 item", value: "Rp 4.980.000", status: "Ditolak" },
    { id: "IN-2025-0036", ref: "SO-2025-0050", source: "Gudang Pusat", date: "21 Mei 2025 11:25", items: "16 item", value: "Rp 3.850.000", status: "Diterima" },
    { id: "IN-2025-0035", ref: "TR-2025-0025", source: "Gudang Cabang", date: "20 Mei 2025 08:45", items: "10 item", value: "Rp 1.950.000", status: "Diterima" },
  ];

  const recentActivities = [
    { id: 1, text: "Penerimaan barang dari Gudang Pusat", sub: "#IN-2025-0042", time: "09:15 WIB", icon: "📦", iconClass: "activity-icon--green" },
    { id: 2, text: "Penerimaan barang dari Gudang Cabang", sub: "#IN-2025-0041", time: "08:40 WIB", icon: "📦", iconClass: "activity-icon--blue" },
    { id: 3, text: "Transfer masuk selesai", sub: "#TR-2025-0031", time: "Kemarin, 16:45", icon: "✅", iconClass: "activity-icon--green" },
    { id: 4, text: "Barang menunggu verifikasi", sub: "#IN-2025-0039", time: "Kemarin, 14:20", icon: "⏳", iconClass: "activity-icon--orange" },
    { id: 5, text: "Penerimaan ditolak", sub: "#IN-2025-0037", time: "Kemarin, 11:10", icon: "❌", iconClass: "activity-icon--red" },
  ];

  return (
    <div className="penerimaan-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="penerimaan-toko__header">
          <div className="penerimaan-toko__title-section">
            <h1>Penerimaan Barang</h1>
            <p>Kelola dan catat semua barang yang masuk ke toko dari gudang atau transfer masuk.</p>
          </div>
          <button className="btn-terima">
            <span style={{ fontSize: "18px" }}>+</span> Terima Barang
          </button>
        </header>

        {/* SUMMARY */}
        <section className="penerimaan-toko__summary">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={idx}
              className="summary-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05, duration: 0.5 }}
            >
              <div className="summary-card__head">
                <div className={`summary-card__icon ${card.iconClass}`}>
                  {card.icon}
                </div>
                <span className="summary-card__label">{card.label}</span>
              </div>
              <h2 className="summary-card__value">{card.value} <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{card.unit}</span></h2>
              <div className="summary-card__subtext">{card.subtext}</div>
            </motion.div>
          ))}
        </section>

        {/* MAIN GRID */}
        <div className="penerimaan-toko__main">
          {/* LEFT CONTENT */}
          <section className="penerimaan-content-box">
            <div className="penerimaan-filters">
              <select className="filter-select"><option>Semua Status</option></select>
              <input type="text" className="filter-date" placeholder="01 Mei 2025 - 24 Mei 2025" />
              <select className="filter-select"><option>Semua Sumber</option></select>
              <select className="filter-select"><option>Semua Jenis</option></select>
              <div className="filter-search">
                <span>🔍</span>
                <input placeholder="Cari no. penerimaan, referensi, atau produk..." />
              </div>
              <button className="btn-reset">Reset</button>
            </div>

            <div className="penerimaan-tabs">
              {["Semua (124)", "Menunggu (6)", "Proses (10)", "Diterima (104)", "Ditolak (4)"].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <table className="penerimaan-table">
              <thead>
                <tr>
                  <th>No. Penerimaan</th>
                  <th>Referensi</th>
                  <th>Sumber</th>
                  <th>Tanggal</th>
                  <th>Total Item</th>
                  <th>Nilai (Rp)</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <motion.tr 
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.04 }}
                  >
                    <td style={{ fontWeight: 600 }}>{row.id}</td>
                    <td style={{ color: "#64748b" }}>{row.ref}</td>
                    <td>{row.source}</td>
                    <td>{row.date}</td>
                    <td>{row.items}</td>
                    <td style={{ fontWeight: 600 }}>{row.value}</td>
                    <td>
                      <span className={`status-badge status--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-action">👁️</button>
                        <button className="btn-action">⋯</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-area">
              <span>Menampilkan 1 - 8 dari 124 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">2</button>
                <button className="btn-page">3</button>
                <button className="btn-page">...</button>
                <button className="btn-page">13</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="penerimaan-sidebar">
            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Ringkasan Penerimaan</h3>
                <select className="filter-select" style={{ fontSize: "10px", padding: "2px 8px" }}><option>01 - 24 Mei 2025</option></select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Penerimaan</span>
                  <span style={{ fontWeight: 700 }}>124 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>transaksi</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Item</span>
                  <span style={{ fontWeight: 700 }}>2.450 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>item</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Rata-rata per Transaksi</span>
                  <span style={{ fontWeight: 700 }}>Rp 473.790</span>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Penerimaan per Sumber (Top 5)</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="180 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-180" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="11 251" strokeDashoffset="-240" />
                  <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
                  <text x="50" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">2.450</text>
                  <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">ITEM</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#22c55e", label: "Gudang Pusat", val: "1.350 (55%)" },
                  { color: "#f97316", label: "Gudang Cabang", val: "750 (31%)" },
                  { color: "#ef4444", label: "Supplier Lokal", val: "200 (8%)" },
                  { color: "#3b82f6", label: "Transfer Lainnya", val: "100 (4%)" },
                  { color: "#94a3b8", label: "Retur Gudang", val: "50 (2%)" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }}></span>
                      <span style={{ color: "#64748b" }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Aktivitas Terbaru</h3>
                <a href="#" style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 600 }}>Lihat Semua</a>
              </div>
              <div className="activity-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.iconClass}`} style={{ background: "#f8fafc" }}>{activity.icon}</div>
                    <div className="activity-content">
                      <span className="activity-name">{activity.text}</span>
                      <span className="activity-sub">{activity.sub}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}
