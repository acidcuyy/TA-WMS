import { useState } from "react";
import { motion } from "framer-motion";
import "./PenyesuaianStokToko.css";

export default function PenyesuaianStokToko() {
  const [activeTab, setActiveTab] = useState("Semua (64)");
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Penyesuaian", value: "64", unit: "transaksi", icon: "⚖", iconClass: "summary-card__icon--purple", subtext: "Semua transaksi koreksi" },
    { label: "Item Disesuaikan", value: "420", unit: "item", icon: "📦", iconClass: "summary-card__icon--blue", subtext: "Total item bertambah/berkurang" },
    { label: "Nilai Koreksi", value: "Rp 18.750.000", unit: "", icon: "💰", iconClass: "summary-card__icon--green", subtext: "Nilai akumulasi koreksi" },
    { label: "Penyesuaian Hari Ini", value: "6", unit: "transaksi", icon: "📅", iconClass: "summary-card__icon--orange", subtext: "Hari ini" },
    { label: "Menunggu Review", value: "3", unit: "transaksi", icon: "⏳", iconClass: "summary-card__icon--red", subtext: "Memerlukan persetujuan" },
  ];

  const tableData = [
    { id: "ADJ-2025-0042", ref: "AUDIT-0524-01", desc: "Pipa PVC 1/2 Inch (Audit stok)", date: "24 Mei 2025, 10:15", qty: "-5 pcs", value: "-Rp 14.500", status: "Disetujui" },
    { id: "ADJ-2025-0041", ref: "RSK-0524-03", desc: "Elbow PVC 1/2 Inch (Barang rusak)", date: "24 Mei 2025, 09:40", qty: "-3 pcs", value: "-Rp 45.000", status: "Menunggu" },
    { id: "ADJ-2025-0040", ref: "EXP-0524-02", desc: "Fitting T 1/2 Inch (Selisih opname)", date: "23 Mei 2025, 16:20", qty: "-2 pcs", value: "-Rp 6.000", status: "Disetujui" },
    { id: "ADJ-2025-0039", ref: "SEL-0524-01", desc: "Lem PVC 100ml (Selisih opname)", date: "23 Mei 2025, 13:05", qty: "+8 pcs", value: "Rp 88.000", status: "Disetujui" },
    { id: "ADJ-2025-0038", ref: "RSK-0524-02", desc: "Kabel NYM 3x1.5mm (Kemasan rusak)", date: "22 Mei 2025, 15:10", qty: "-4 mtr", value: "-Rp 5.600", status: "Ditolak" },
    { id: "ADJ-2025-0037", ref: "AUDIT-0523-02", desc: "Pipa PVC 1/2 Inch (Audit stok)", date: "22 Mei 2025, 11:25", qty: "-6 pcs", value: "-Rp 36.000", status: "Draft" },
    { id: "ADJ-2025-0036", ref: "SEL-0523-03", desc: "Elbow PVC 1/2 Inch (Selisih opname)", date: "21 Mei 2025, 09:30", qty: "+10 pcs", value: "Rp 25.000", status: "Disetujui" },
    { id: "ADJ-2025-0035", ref: "RSK-0523-01", desc: "Fitting T 1/2 Inch (Kemasan bocor)", date: "21 Mei 2025, 08:05", qty: "-2 pcs", value: "-Rp 7.000", status: "Menunggu" },
  ];

  const recentActivities = [
    { id: 1, text: "Penyesuaian stok Pipa PVC 1/2 Inch disetujui", sub: "ADJ-2025-0042", time: "10:15 WIB", icon: "✅", iconClass: "activity-icon--green" },
    { id: 2, text: "Draft penyesuaian Elbow PVC 1/2 Inch dibuat", sub: "ADJ-2025-0041", time: "09:40 WIB", icon: "✏️", iconClass: "activity-icon--blue" },
    { id: 3, text: "Audit stok Fitting T 1/2 Inch selesai", sub: "AUDIT-0524-01", time: "08:30 WIB", icon: "🔍", iconClass: "activity-icon--orange" },
    { id: 4, text: "Penyesuaian Lem PVC 100ml disetujui", sub: "ADJ-2025-0039", time: "22 Mei, 16:10", icon: "✅", iconClass: "activity-icon--green" },
    { id: 5, text: "Penyesuaian Kabel NYM 3x1.5mm ditolak", sub: "ADJ-2025-0038", time: "22 Mei, 15:10", icon: "❌", iconClass: "activity-icon--red" },
  ];

  return (
    <div className="penyesuaian-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="penyesuaian-toko__header">
          <div className="penyesuaian-toko__title-section">
            <h1>Penyesuaian Stok</h1>
            <p>Kelola dan catat koreksi stok akibat selisih, kerusakan, kadaluarsa, atau audit stok.</p>
          </div>
          <button className="btn-buat">
            <span style={{ fontSize: "18px" }}>+</span> Buat Penyesuaian
          </button>
        </header>

        {/* SUMMARY */}
        <section className="penyesuaian-toko__summary">
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
        <div className="penyesuaian-toko__main">
          {/* LEFT CONTENT */}
          <section className="penyesuaian-content-box">
            <div className="penyesuaian-filters">
              <select className="filter-select"><option>Semua Status</option></select>
              <input type="text" className="filter-date" placeholder="01 Mei 2025 - 24 Mei 2025" />
              <select className="filter-select"><option>Semua Jenis</option></select>
              <select className="filter-select"><option>Semua Alasan</option></select>
              <div className="filter-search">
                <span>🔍</span>
                <input placeholder="Cari no. penyesuaian, produk, atau referensi..." />
              </div>
              <button className="btn-reset">Reset</button>
            </div>

            <div className="penyesuaian-tabs">
              {["Semua (64)", "Menunggu (3)", "Disetujui (48)", "Ditolak (4)", "Draft (9)"].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <table className="penyesuaian-table">
              <thead>
                <tr>
                  <th>No. Penyesuaian</th>
                  <th>Referensi</th>
                  <th>Produk / Keterangan</th>
                  <th>Tanggal ↓</th>
                  <th>Qty Selisih</th>
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
                    <td>{row.desc}</td>
                    <td>{row.date}</td>
                    <td style={{ fontWeight: 600, color: row.qty.startsWith("-") ? "#ef4444" : "#22c55e" }}>{row.qty}</td>
                    <td style={{ fontWeight: 600, color: row.value.startsWith("-") ? "#ef4444" : "#22c55e" }}>{row.value}</td>
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
              <span>Menampilkan 1 - 10 dari 64 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">2</button>
                <button className="btn-page">3</button>
                <button className="btn-page">...</button>
                <button className="btn-page">7</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="penyesuaian-sidebar">
            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Ringkasan Penyesuaian</h3>
                <select className="filter-select" style={{ fontSize: "10px", padding: "2px 8px" }}><option>01 - 24 Mei 2025</option></select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Penyesuaian</span>
                  <span style={{ fontWeight: 700 }}>64 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>transaksi</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Item</span>
                  <span style={{ fontWeight: 700 }}>420 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>item</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Rata-rata per Transaksi</span>
                  <span style={{ fontWeight: 700 }}>Rp 292.969</span>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Penyesuaian per Alasan (Top 5)</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="140 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="80 251" strokeDashoffset="-140" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="40 251" strokeDashoffset="-220" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="21 251" strokeDashoffset="-260" />
                  <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
                  <text x="50" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">64</text>
                  <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">TRX</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#8b5cf6", label: "Audit Stok", val: "22 (34.4%)" },
                  { color: "#3b82f6", label: "Barang Rusak", val: "14 (21.9%)" },
                  { color: "#22c55e", label: "Selisih Opname", val: "11 (17.2%)" },
                  { color: "#f97316", label: "Kemasan Rusak", val: "9 (14.1%)" },
                  { color: "#94a3b8", label: "Lainnya", val: "8 (12.5%)" },
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
