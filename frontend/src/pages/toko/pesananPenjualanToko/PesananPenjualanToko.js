import { useState } from "react";
import { motion } from "framer-motion";
import "./PesananPenjualanToko.css";

export default function PesananPenjualanToko() {
  const [activeTab, setActiveTab] = useState("Semua (156)");
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Pesanan", value: "156", unit: "transaksi", icon: "📄", iconClass: "summary-card__icon--purple", subtext: "Total pesanan masuk" },
    { label: "Pesanan Hari Ini", value: "18", unit: "transaksi", icon: "🛒", iconClass: "summary-card__icon--green", subtext: "Pesanan baru hari ini" },
    { label: "Menunggu Pembayaran", value: "12", unit: "transaksi", icon: "💳", iconClass: "summary-card__icon--orange", subtext: "Belum bayar / DP" },
    { label: "Nilai Penjualan", value: "Rp 58.250.000", unit: "", icon: "📈", iconClass: "summary-card__icon--blue", subtext: "Total pendapatan kotor" },
    { label: "Perlu Diproses", value: "9", unit: "pesanan", icon: "📦", iconClass: "summary-card__icon--red", subtext: "Menunggu pengemasan" },
  ];

  const tableData = [
    { id: "SO-2025-0056", client: "Pelanggan Umum", channel: "Kasir Toko", date: "24 Mei 2025, 10:15", items: "8 item", total: "Rp 1.450.000", payment: "Lunas", status: "Selesai" },
    { id: "SO-2025-0055", client: "Toko Maju", channel: "WhatsApp", date: "24 Mei 2025, 09:40", items: "12 item", total: "Rp 980.000", payment: "DP", status: "Diproses" },
    { id: "SO-2025-0054", client: "CV Sejahtera", channel: "Marketplace", date: "23 Mei 2025, 16:20", items: "15 item", total: "Rp 5.620.000", payment: "Belum Bayar", status: "Dikemas" },
    { id: "SO-2025-0053", client: "Kasir Toko", channel: "Kasir Toko", date: "23 Mei 2025, 13:05", items: "6 item", total: "Rp 720.000", payment: "Lunas", status: "Diproses" },
    { id: "SO-2025-0052", client: "Pelanggan Umum", channel: "Walk In", date: "22 Mei 2025, 15:10", items: "5 item", total: "Rp 350.000", payment: "Lunas", status: "Selesai" },
    { id: "SO-2025-0051", client: "Reseller Abadi", channel: "Reseller", date: "22 Mei 2025, 11:25", items: "20 item", total: "Rp 2.850.000", payment: "Belum Bayar", status: "Menunggu" },
    { id: "SO-2025-0050", client: "Toko Berkah", channel: "WhatsApp", date: "21 Mei 2025, 09:30", items: "10 item", total: "Rp 1.150.000", payment: "DP", status: "Dikemas" },
    { id: "SO-2025-0049", client: "Pelanggan Umum", channel: "Marketplace", date: "21 Mei 2025, 08:05", items: "7 item", total: "Rp 560.000", payment: "Belum Bayar", status: "Dibatalkan" },
  ];

  const recentActivities = [
    { id: 1, text: "Pesanan SO-2025-0056 baru dibuat oleh Kasir Toko", sub: "10:15 WIB", icon: "📝", iconClass: "activity-icon--purple" },
    { id: 2, text: "Pembayaran diterima untuk SO-2025-0055 sebesar Rp 500.000", sub: "09:42 WIB", icon: "💰", iconClass: "activity-icon--green" },
    { id: 3, text: "Pesanan SO-2025-0054 dikemas oleh Gudang Pusat", sub: "16:22 WIB", icon: "📦", iconClass: "activity-icon--blue" },
    { id: 4, text: "Pesanan SO-2025-0052 dikirim oleh Ekspedisi JNE", sub: "15:35 WIB", icon: "🚚", iconClass: "activity-icon--orange" },
    { id: 5, text: "Pesanan SO-2025-0049 dibatalkan oleh Admin Toko", sub: "08:20 WIB", icon: "🚫", iconClass: "activity-icon--red" },
  ];

  const payClass = (p) => {
    if (p === "Lunas") return "pay--lunas";
    if (p === "DP") return "pay--dp";
    return "pay--belum";
  };

  return (
    <div className="pesanan-penjualan">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="pesanan-penjualan__header">
          <div className="pesanan-penjualan__title-section">
            <h1>Pesanan Penjualan</h1>
            <p>Kelola pesanan penjualan toko, pantau status order, pembayaran, dan proses penyiapan barang.</p>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="pesanan-penjualan__summary">
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
        <div className="pesanan-penjualan__main">
          {/* LEFT CONTENT */}
          <section className="pesanan-content-box">
            <div className="pesanan-filters">
              <select className="filter-select"><option>Semua Status</option></select>
              <input type="text" className="filter-date" placeholder="01 Mei 2025 - 24 Mei 2025" />
              <select className="filter-select"><option>Semua Channel</option></select>
              <select className="filter-select"><option>Semua Jenis</option></select>
              <div className="filter-search">
                <span>🔍</span>
                <input placeholder="Cari no. pesanan, pelanggan, atau produk..." />
              </div>
            </div>

            <div className="pesanan-tabs">
              {["Semua (156)", "Menunggu Pembayaran (12)", "Diproses (9)", "Dikemas (14)", "Dikirim (21)", "Selesai (92)", "Dibatalkan (8)"].map(tab => (
                <button
                  key={tab}
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <table className="pesanan-table">
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Channel</th>
                  <th>Tanggal ↓</th>
                  <th>Total Item</th>
                  <th>Total (Rp)</th>
                  <th>Pembayaran</th>
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
                    <td>{row.client}</td>
                    <td>{row.channel}</td>
                    <td>{row.date}</td>
                    <td>{row.items}</td>
                    <td style={{ fontWeight: 600 }}>{row.total}</td>
                    <td>
                      <span className={`pay-badge ${payClass(row.payment)}`}>
                        {row.payment}
                      </span>
                    </td>
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
              <span>Menampilkan 1 - 8 dari 156 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">2</button>
                <button className="btn-page">3</button>
                <button className="btn-page">...</button>
                <button className="btn-page">16</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="pesanan-sidebar">
            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Ringkasan Penjualan</h3>
                <select className="filter-select" style={{ fontSize: "10px", padding: "2px 8px" }}><option>01 - 24 Mei 2025</option></select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Pesanan</span>
                  <span style={{ fontWeight: 700 }}>156 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>transaksi</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Item</span>
                  <span style={{ fontWeight: 700 }}>1.250 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>item</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Rata-rata per Transaksi</span>
                  <span style={{ fontWeight: 700 }}>Rp 373.397</span>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Penjualan per Channel (Top 5)</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="160 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-160" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="20 251" strokeDashoffset="-220" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="11 251" strokeDashoffset="-240" />
                  <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
                  <text x="50" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">156</text>
                  <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">transaksi</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#f97316", label: "Kasir Toko", val: "68 (43.6%)" },
                  { color: "#22c55e", label: "WhatsApp", val: "36 (23.1%)" },
                  { color: "#3b82f6", label: "Marketplace", val: "28 (17.9%)" },
                  { color: "#8b5cf6", label: "Reseller", val: "16 (10.3%)" },
                  { color: "#94a3b8", label: "Walk In", val: "8 (5.1%)" },
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
