import { useState } from "react";
import { motion } from "framer-motion";
import "./RiwayatToko.css";

export default function RiwayatToko() {
  const [activeTab, setActiveTab] = useState("Semua (32)");
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Laporan", value: "32", unit: "laporan", icon: "📄", iconClass: "summary-card__icon--purple" },
    { label: "Penjualan Bulan Ini", value: "Rp 58.250.000", unit: "156 transaksi", icon: "📈", iconClass: "summary-card__icon--green" },
    { label: "Pengeluaran", value: "Rp 42.350.000", unit: "96 transaksi", icon: "📤", iconClass: "summary-card__icon--orange" },
    { label: "Retur Penjualan", value: "18", unit: "transaksi", icon: "↩", iconClass: "summary-card__icon--red" },
    { label: "Penyesuaian Stok", value: "64", unit: "transaksi", icon: "⚖", iconClass: "summary-card__icon--blue" },
  ];

  const reports = [
    { id: "RPT-2025-032", type: "Laporan Penjualan", period: "20 - 24 Mei 2025", author: "Admin Toko", format: "PDF", formatColor: "#ef4444", status: "Selesai" },
    { id: "RPT-2025-031", type: "Laporan Stok", period: "20 - 24 Mei 2025", author: "Admin Toko", format: "Excel", formatColor: "#16a34a", status: "Selesai" },
    { id: "RPT-2025-030", type: "Laporan Pengeluaran", period: "19 - 24 Mei 2025", author: "Sistem", format: "PDF", formatColor: "#ef4444", status: "Dijadwalkan" },
    { id: "RPT-2025-029", type: "Laporan Retur", period: "18 - 24 Mei 2025", author: "Admin Toko", format: "PDF", formatColor: "#ef4444", status: "Draft" },
    { id: "RPT-2025-028", type: "Laporan Penyesuaian", period: "18 - 24 Mei 2025", author: "Sistem", format: "Excel", formatColor: "#16a34a", status: "Selesai" },
    { id: "RPT-2025-027", type: "Laporan Transfer", period: "17 - 24 Mei 2025", author: "Admin Toko", format: "PDF", formatColor: "#ef4444", status: "Selesai" },
    { id: "RPT-2025-026", type: "Laporan Penerimaan", period: "17 - 24 Mei 2025", author: "Sistem", format: "Excel", formatColor: "#16a34a", status: "Selesai" },
  ];

  return (
    <div className="riwayat-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="riwayat-toko__header">
          <div className="riwayat-toko__title-section">
            <h1>Laporan</h1>
            <p>Ringkasan laporan operasional toko, penjualan, stok, retur, dan aktivitas transaksi.</p>
          </div>
          <button className="btn-buat">
            <span style={{ fontSize: "18px" }}>+</span> Buat Laporan
          </button>
        </header>

        {/* SUMMARY */}
        <section className="riwayat-toko__summary">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={idx}
              className="summary-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05, duration: 0.5 }}
            >
              <div className="summary-card__head">
                <div className={`summary-card__icon ${card.iconClass}`}>{card.icon}</div>
                <span className="summary-card__label">{card.label}</span>
              </div>
              <h2 className="summary-card__value">{card.value}</h2>
              <div className="summary-card__subtext">{card.unit}</div>
            </motion.div>
          ))}
        </section>

        {/* FILTERS */}
        <section className="riwayat-filters">
          <select className="filter-select"><option>Semua Jenis Laporan</option></select>
          <input type="text" className="filter-date" placeholder="01 Mei 2025 - 24 Mei 2025" />
          <select className="filter-select"><option>Semua Status</option></select>
          <div className="filter-search">
            <span>🔍</span>
            <input placeholder="Cari nama laporan, kode, atau periode..." />
          </div>
          <button className="btn-reset">Reset</button>
        </section>

        {/* PERFORMANCE CHART */}
        <section className="performance-chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Ringkasan Performa</h3>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div className="chart-legend">
                <div className="legend-item"><span className="legend-dot" style={{ background: "#f97316" }}></span> Penjualan</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: "#3b82f6" }}></span> Pengeluaran</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: "#ef4444" }}></span> Retur</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: "#22c55e" }}></span> Penyesuaian</div>
              </div>
              <select className="filter-select" style={{ padding: "4px 8px", fontSize: "11px" }}>
                <option>7 Hari Terakhir</option>
              </select>
            </div>
          </div>
          
          <div style={{ height: "240px", width: "100%", position: "relative", marginTop: "20px" }}>
            <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map(y => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              
              {/* Penjualan (Orange) */}
              <path d="M0,150 L133,120 L266,130 L400,100 L533,90 L666,110 L800,85" fill="none" stroke="#f97316" strokeWidth="3" />
              {/* Pengeluaran (Blue) */}
              <path d="M0,170 L133,160 L266,155 L400,140 L533,130 L666,150 L800,140" fill="none" stroke="#3b82f6" strokeWidth="2" />
              {/* Retur (Red) */}
              <path d="M0,190 L133,185 L266,180 L400,185 L533,180 L666,185 L800,175" fill="none" stroke="#ef4444" strokeWidth="1.5" />
              {/* Penyesuaian (Green) */}
              <path d="M0,180 L133,175 L266,170 L400,165 L533,160 L666,170 L800,160" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "10px", color: "#94a3b8" }}>
              <span>18 Mei</span><span>19 Mei</span><span>20 Mei</span><span>21 Mei</span><span>22 Mei</span><span>23 Mei</span><span>24 Mei</span>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="riwayat-toko__main">
          {/* LEFT CONTENT */}
          <section className="riwayat-content-box">
            <div className="riwayat-tabs">
              {["Semua (32)", "Draft (4)", "Selesai (24)", "Dijadwalkan (4)"].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <table className="riwayat-table">
              <thead>
                <tr>
                  <th>No. Laporan</th>
                  <th>Jenis Laporan</th>
                  <th>Periode</th>
                  <th>Dibuat Oleh</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, idx) => (
                  <motion.tr 
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.04 }}
                  >
                    <td style={{ fontWeight: 600 }}>{r.id}</td>
                    <td>{r.type}</td>
                    <td>{r.period}</td>
                    <td>{r.author}</td>
                    <td>
                      <div className="format-badge" style={{ color: r.formatColor }}>
                        {r.format === "PDF" ? "📄" : "📊"} {r.format}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status--${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}>👁️</button>
                        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}>⋮</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-area">
              <span>Menampilkan 1 - 7 dari 32 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">2</button>
                <button className="btn-page">3</button>
                <button className="btn-page">4</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="riwayat-sidebar">
            <div className="sidebar-widget">
              <h3 className="widget-title">Jenis Laporan</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { icon: "💰", label: "Penjualan", val: "12" },
                  { icon: "📦", label: "Stok", val: "6" },
                  { icon: "📥", label: "Penerimaan", val: "4" },
                  { icon: "📤", label: "Pengeluaran", val: "3" },
                  { icon: "⚖", label: "Retur & Penyesuaian", val: "7" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{item.icon}</span>
                      <span style={{ color: "#64748b" }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.val} ❯</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Distribusi Laporan</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="94 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="47 251" strokeDashoffset="-94" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="47 251" strokeDashoffset="-141" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="31 251" strokeDashoffset="-188" />
                  <text x="50" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">32</text>
                  <text x="50" y="62" textAnchor="middle" fontSize="8" fill="#94a3b8">Laporan</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#f97316", label: "Penjualan", val: "12 (37,5%)" },
                  { color: "#3b82f6", label: "Stok", val: "6 (18,8%)" },
                  { color: "#22c55e", label: "Transaksi", val: "6 (18,8%)" },
                  { color: "#ef4444", label: "Retur", val: "4 (12,5%)" },
                  { color: "#94a3b8", label: "Audit", val: "4 (12,5%)" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color }}></span>
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
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: "#f5f3ff" }}>📄</div>
                  <div className="activity-content">
                    <span className="activity-name">Laporan Penjualan 20-24 Mei 2025 dibuat</span>
                    <span className="activity-sub">oleh Admin Toko • 10:30 WIB</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: "#f0fdf4" }}>📊</div>
                  <div className="activity-content">
                    <span className="activity-name">Export Laporan Stok berhasil</span>
                    <span className="activity-sub">oleh Sistem • 09:45 WIB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Jadwal Otomatis</h3>
                <a href="#" style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 600 }}>Lihat Semua</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px" }}>
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>Laporan Penjualan Harian</span>
                    <span style={{ color: "#94a3b8" }}>25 Mei 2025, 18:00</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px" }}>
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>Laporan Stok Mingguan</span>
                    <span style={{ color: "#94a3b8" }}>26 Mei 2025, 08:00</span>
                  </div>
                </div>
              </div>
              <button style={{ width: "100%", marginTop: "16px", padding: "8px", borderRadius: "8px", border: "1px solid var(--primary)", background: "transparent", color: "var(--primary)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                ⚙ Atur Jadwal
              </button>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}
