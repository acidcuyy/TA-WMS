import { useState } from "react";
import { motion } from "framer-motion";
import DateRangePicker from "../../../components/common/DateRangePicker";
import DetailModal from "../../../components/common/DetailModal";
import "./TransferBarangToko.css";

export default function TransferBarangToko() {
  const [activeTab, setActiveTab] = useState("Semua (76)");
  const [detailModal, setDetailModal] = useState(null);
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Transfer", value: "76", unit: "transaksi", icon: "⇄", iconClass: "summary-card__icon--purple", subtext: "Semua transaksi transfer" },
    { label: "Total Item Ditransfer", value: "860", unit: "item", icon: "📦", iconClass: "summary-card__icon--blue", subtext: "Total item keluar/masuk" },
    { label: "Toko Terhubung", value: "4", unit: "toko", icon: "🏢", iconClass: "summary-card__icon--green", subtext: "Toko aktif bulan ini" },
    { label: "Transfer Hari Ini", value: "7", unit: "transaksi", icon: "📅", iconClass: "summary-card__icon--orange", subtext: "Hari ini" },
    { label: "Dalam Pengiriman", value: "5", unit: "transaksi", icon: "🚚", iconClass: "summary-card__icon--red", subtext: "Sedang dikirim" },
  ];

  const tableData = [
    { id: "TRF-2025-0042", ref: "TF/GD/0524/042", from: "Gudang Pusat", to: "Toko Sejahtera", date: "24 Mei 2025, 10:15", items: "20 item", status: "Dikirim" },
    { id: "TRF-2025-0041", ref: "TF/CB/0524/041", from: "Toko Cabang A", to: "Toko Sejahtera", date: "24 Mei 2025, 08:40", items: "12 item", status: "Selesai" },
    { id: "TRF-2025-0040", ref: "TF/GD/0523/040", from: "Toko Sejahtera", to: "Gudang Pusat", date: "23 Mei 2025, 16:20", items: "8 item", status: "Diproses" },
    { id: "TRF-2025-0039", ref: "TF/GD/0523/039", from: "Gudang Pusat", to: "Toko Sejahtera", date: "23 Mei 2025, 13:05", items: "16 item", status: "Menunggu" },
    { id: "TRF-2025-0038", ref: "TF/CB/0522/038", from: "Toko Sejahtera", to: "Toko Cabang B", date: "22 Mei 2025, 15:10", items: "10 item", status: "Selesai" },
    { id: "TRF-2025-0037", ref: "TF/GD/0522/037", from: "Gudang Cabang", to: "Toko Sejahtera", date: "22 Mei 2025, 11:25", items: "18 item", status: "Dikirim" },
    { id: "TRF-2025-0036", ref: "TF/RT/0521/036", from: "Toko Sejahtera", to: "Gudang Pusat", date: "21 Mei 2025, 09:30", items: "5 item", status: "Diproses" },
    { id: "TRF-2025-0035", ref: "TF/GD/0521/035", from: "Gudang Pusat", to: "Toko Sejahtera", date: "21 Mei 2025, 08:05", items: "14 item", status: "Dibatalkan" },
  ];

  const recentActivities = [
    { id: 1, text: "Transfer diterima dari Gudang Pusat", sub: "TRF-2025-0042", time: "10:15 WIB", icon: "📥", iconClass: "activity-icon--purple" },
    { id: 2, text: "Barang dikirim ke Toko Cabang B", sub: "TRF-2025-0038", time: "09:45 WIB", icon: "📤", iconClass: "activity-icon--blue" },
    { id: 3, text: "Transfer menunggu konfirmasi", sub: "TRF-2025-0039", time: "08:30 WIB", icon: "⏳", iconClass: "activity-icon--orange" },
    { id: 4, text: "Transfer selesai", sub: "TRF-2025-0041", time: "08:00 WIB", icon: "✅", iconClass: "activity-icon--green" },
    { id: 5, text: "Transfer dibatalkan", sub: "TRF-2025-0035", time: "07:20 WIB", icon: "❌", iconClass: "activity-icon--red" },
  ];

  return (
    <div className="transfer-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="transfer-toko__header">
          <div className="transfer-toko__title-section">
            <h1>Transfer Barang</h1>
            <p>Kelola dan pantau transfer barang antar toko, ke gudang, atau dari gudang ke toko.</p>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="transfer-toko__summary">
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
        <div className="transfer-toko__main">
          {/* LEFT CONTENT */}
          <section className="transfer-content-box">
            <div className="transfer-filters">
              <select className="filter-select"><option>Semua Status</option></select>
              <DateRangePicker />
              <select className="filter-select"><option>Semua Asal</option></select>
              <select className="filter-select"><option>Semua Tujuan</option></select>
              <div className="filter-search">
                <span>🔍</span>
                <input placeholder="Cari no. transfer, referensi, atau produk..." />
              </div>
              <button className="btn-reset">Reset</button>
            </div>

            <div className="transfer-tabs">
              {["Semua (76)", "Menunggu (5)", "Diproses (8)", "Dikirim (9)", "Selesai (50)", "Dibatalkan (4)"].map(tab => (
                <button
                  key={tab}
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <table className="transfer-table">
              <thead>
                <tr>
                  <th>No. Transfer</th>
                  <th>Referensi</th>
                  <th>Asal</th>
                  <th>Tujuan</th>
                  <th>Tanggal ↓</th>
                  <th>Total Item</th>

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
                    <td>{row.from}</td>
                    <td>{row.to}</td>
                    <td>{row.date}</td>
                    <td>{row.items}</td>

                    <td>
                      <span className={`status-badge status--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-action" onClick={() => setDetailModal(row)}>👁️</button>
                        <button className="btn-action">⋯</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-area">
              <span>Menampilkan 1 - 8 dari 76 data</span>
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
          <aside className="transfer-sidebar">
            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Ringkasan Transfer</h3>
                <select className="filter-select" style={{ fontSize: "10px", padding: "2px 8px" }}><option>01 - 24 Mei 2025</option></select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Transfer</span>
                  <span style={{ fontWeight: 700 }}>76 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>transaksi</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Total Item</span>
                  <span style={{ fontWeight: 700 }}>860 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>item</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Rata-rata per Transaksi</span>
                  <span style={{ fontWeight: 700 }}>11 <span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>item</span></span>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Transfer per Tujuan (Top 5)</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="160 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-160" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="20 251" strokeDashoffset="-220" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="11 251" strokeDashoffset="-240" />
                  <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
                  <text x="50" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">860</text>
                  <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">ITEM</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#3b82f6", label: "Toko Sejahtera", val: "420 (48.8%)" },
                  { color: "#22c55e", label: "Gudang Pusat", val: "210 (24.4%)" },
                  { color: "#f97316", label: "Toko Cabang A", val: "100 (11.6%)" },
                  { color: "#facc15", label: "Toko Cabang B", val: "80 (9.3%)" },
                  { color: "#94a3b8", label: "Lainnya", val: "50 (5.8%)" },
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

      {/* DETAIL MODAL */}
      <DetailModal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Detail Transfer Barang"
        subtitle={detailModal ? `${detailModal.id} • ${detailModal.ref}` : ''}
        details={detailModal ? [
          { label: "Tanggal", value: detailModal.date },
          { label: "Dari", value: detailModal.from },
          { label: "Ke", value: detailModal.to },
          { label: "Status", value: detailModal.status, color: detailModal.status === 'Selesai' ? '#52c41a' : detailModal.status === 'Dikirim' ? '#1890ff' : '#fa8c16' },
        ] : []}
        itemsTitle="Total Item"
        items={detailModal ? [`${detailModal.items}`] : []}
      />
    </div>
  );
}
