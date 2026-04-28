import { useState } from "react";
import { motion } from "framer-motion";
import "./PengeluaranBarangToko.css";

export default function PengeluaranBarangToko() {
  const [activeTab, setActiveTab] = useState("Semua (98)");
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Pengeluaran", value: "98", unit: "transaksi", icon: "📤", iconClass: "summary-card__icon--purple", subtext: "Semua transaksi keluar" },
    { label: "Total Item Keluar", value: "1.180", unit: "item", icon: "📦", iconClass: "summary-card__icon--blue", subtext: "Semua item keluar" },
    { label: "Nilai Pengeluaran", value: "Rp 42.350.000", unit: "", icon: "💰", iconClass: "summary-card__icon--green", subtext: "Total nilai barang keluar" },
    { label: "Pengeluaran Hari Ini", value: "9", unit: "transaksi", icon: "📅", iconClass: "summary-card__icon--orange", subtext: "Hari ini" },
    { label: "Barang Pending", value: "4", unit: "transaksi", icon: "⏳", iconClass: "summary-card__icon--red", subtext: "Menunggu verifikasi" },
  ];

  const tableData = [
    { id: "OUT-2025-0042", ref: "INV/KS/0524/042", target: "Pelanggan - Toko Maju", date: "24 Mei 2025, 10:30", items: "25", value: "Rp 1.750.000", status: "Dikeluarkan" },
    { id: "OUT-2025-0041", ref: "INV/KS/0524/041", target: "Penjualan Kasir", date: "24 Mei 2025, 09:15", items: "18", value: "Rp 875.000", status: "Dikeluarkan" },
    { id: "OUT-2025-0040", ref: "RET/GD/0524/015", target: "Retur Gudang", date: "23 Mei 2025, 16:45", items: "12", value: "Rp 620.000", status: "Proses" },
    { id: "OUT-2025-0039", ref: "INV/KS/0523/039", target: "Pelanggan - CV Sejahtera", date: "23 Mei 2025, 14:20", items: "30", value: "Rp 2.340.000", status: "Dikeluarkan" },
    { id: "OUT-2025-0038", ref: "ADJ/0523/008", target: "Penyesuaian Stok", date: "23 Mei 2025, 11:05", items: "15", value: "Rp 350.000", status: "Dikeluarkan" },
    { id: "OUT-2025-0037", ref: "INV/KS/0522/037", target: "Penjualan Kasir", date: "22 Mei 2025, 17:30", items: "22", value: "Rp 1.120.000", status: "Menunggu" },
    { id: "OUT-2025-0036", ref: "INV/KS/0522/036", target: "Pelanggan - UD Sukses", date: "22 Mei 2025, 13:10", items: "40", value: "Rp 3.250.000", status: "Proses" },
    { id: "OUT-2025-0035", ref: "RET/GD/0522/014", target: "Retur Gudang", date: "21 Mei 2025, 10:25", items: "8", value: "Rp 185.000", status: "Dibatalkan" },
  ];

  const recentActivities = [
    { id: 1, text: "Pengeluaran untuk pelanggan Toko Maju", sub: "OUT-2025-0042", time: "10:30 WIB", icon: "🛒", iconClass: "activity-icon--green" },
    { id: 2, text: "Retur barang ke gudang selesai", sub: "RET/GD/0524/015", time: "16:45 WIB", icon: "↩️", iconClass: "activity-icon--blue" },
    { id: 3, text: "Penyesuaian stok selesai", sub: "ADJ/0523/008", time: "11:05 WIB", icon: "⚖️", iconClass: "activity-icon--orange" },
    { id: 4, text: "Pengeluaran untuk pelanggan CV Sejahtera", sub: "OUT-2025-0039", time: "14:20 WIB", icon: "🛒", iconClass: "activity-icon--purple" },
    { id: 5, text: "Pengeluaran dibatalkan", sub: "OUT-2025-0035", time: "10:25 WIB", icon: "🚫", iconClass: "activity-icon--red" },
  ];

  return (
    <div className="pengeluaran-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="pengeluaran-toko__header">
          <div className="pengeluaran-toko__title-section">
            <h1>Pengeluaran Barang</h1>
            <p>Kelola dan catat semua barang yang keluar dari toko untuk penjualan, retur, atau penyesuaian.</p>
          </div>
          <button className="btn-buat">
            <span style={{ fontSize: "18px" }}>+</span> Buat Pengeluaran
          </button>
        </header>

        {/* SUMMARY */}
        <section className="pengeluaran-toko__summary">
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
        <div className="pengeluaran-toko__main">
          {/* LEFT CONTENT */}
          <section className="pengeluaran-content-box">
            <div className="pengeluaran-filters">
              <select className="filter-select"><option>Semua Status</option></select>
              <input type="text" className="filter-date" placeholder="01 Mei 2025 - 24 Mei 2025" />
              <select className="filter-select"><option>Semua Tujuan</option></select>
              <select className="filter-select"><option>Semua Jenis Pengeluaran</option></select>
              <div className="filter-search">
                <span>🔍</span>
                <input placeholder="Cari no. pengeluaran, referensi, atau produk..." />
              </div>
              <button className="btn-reset">Reset</button>
            </div>

            <div className="pengeluaran-tabs">
              {["Semua (98)", "Menunggu (4)", "Proses (8)", "Dikeluarkan (82)", "Dibatalkan (4)"].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <table className="pengeluaran-table">
              <thead>
                <tr>
                  <th>No. Pengeluaran</th>
                  <th>Referensi</th>
                  <th>Tujuan</th>
                  <th>Tanggal ↓</th>
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
                    <td style={{ color: "#64748b", fontSize: "11px" }}>{row.ref}</td>
                    <td>{row.target}</td>
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
              <span>Menampilkan 1 - 8 dari 98 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">2</button>
                <button className="btn-page">3</button>
                <button className="btn-page">...</button>
                <button className="btn-page">10</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="pengeluaran-sidebar">
            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Ringkasan Pengeluaran</h3>
                <select className="filter-select" style={{ fontSize: "10px", padding: "2px 8px" }}><option>01 - 24 Mei 2025</option></select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Pengeluaran</span>
                  <span style={{ fontWeight: 700 }}>98 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>transaksi</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Item</span>
                  <span style={{ fontWeight: 700 }}>1.180 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>item</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Rata-rata per Transaksi</span>
                  <span style={{ fontWeight: 700 }}>Rp 432.143</span>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Pengeluaran per Tujuan (Top 5)</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="160 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-160" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="20 251" strokeDashoffset="-220" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="11 251" strokeDashoffset="-240" />
                  <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
                  <text x="50" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">1.180</text>
                  <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">ITEM</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#22c55e", label: "Penjualan Kasir", val: "560 (47%)" },
                  { color: "#f97316", label: "Pelanggan", val: "320 (27%)" },
                  { color: "#3b82f6", label: "Retur Gudang", val: "140 (12%)" },
                  { color: "#8b5cf6", label: "Penyesuaian", val: "100 (8%)" },
                  { color: "#94a3b8", label: "Lainnya", val: "60 (6%)" },
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
