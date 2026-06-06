import { useState } from "react";
import { motion } from "framer-motion";
import "./ReturPenjualanToko.css";

export default function ReturPenjualanToko() {
  const [selectedRetur, setSelectedRetur] = useState("RT-2025-00018");
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Retur", value: "18", unit: "Retur", icon: "↩", iconClass: "summary-card__icon--purple", subtext: "Nilai: Rp 3.450.000" },
    { label: "Retur Menunggu", value: "6", unit: "Retur", icon: "⏳", iconClass: "summary-card__icon--orange", subtext: "Nilai: Rp 1.150.000" },
    { label: "Retur Disetujui", value: "9", unit: "Retur", icon: "✅", iconClass: "summary-card__icon--green", subtext: "Nilai: Rp 1.800.000" },
    { label: "Retur Ditolak", value: "3", unit: "Retur", icon: "❌", iconClass: "summary-card__icon--red", subtext: "Nilai: Rp 500.000" },
  ];

  const tableData = [
    { id: "RT-2025-00018", date: "24 Mei 2025, 10:30 WIB", client: "Toko Maju Jaya", location: "Jakarta Barat", order: "SO-2025-0056", items: "3 Item", total: "Rp 450.000", status: "Menunggu" },
    { id: "RT-2025-00017", date: "23 Mei 2025, 15:45 WIB", client: "UD Sumber Rezeki", location: "Bekasi", order: "SO-2025-0054", items: "2 Item", total: "Rp 320.000", status: "Disetujui" },
    { id: "RT-2025-00016", date: "22 Mei 2025, 14:20 WIB", client: "Toko Berkah Abadi", location: "Depok", order: "SO-2025-0052", items: "4 Item", total: "Rp 780.000", status: "Disetujui" },
    { id: "RT-2025-00015", date: "21 Mei 2025, 11:05 WIB", client: "CV Sentosa", location: "Tangerang", order: "SO-2025-0050", items: "1 Item", total: "Rp 120.000", status: "Ditolak" },
    { id: "RT-2025-00014", date: "20 Mei 2025, 09:15 WIB", client: "Toko Mandiri", location: "Bogor", order: "SO-2025-0048", items: "2 Item", total: "Rp 210.000", status: "Disetujui" },
    { id: "RT-2025-00013", date: "19 Mei 2025, 16:30 WIB", client: "Koperasi Sejahtera", location: "Jakarta Selatan", order: "SO-2025-0046", items: "3 Item", total: "Rp 540.000", status: "Menunggu" },
    { id: "RT-2025-00012", date: "18 Mei 2025, 13:10 WIB", client: "Toko Makmur", location: "Bekasi", order: "SO-2025-0043", items: "2 Item", total: "Rp 260.000", status: "Ditolak" },
    { id: "RT-2025-00011", date: "17 Mei 2025, 10:50 WIB", client: "UD Rejeki Lancar", location: "Tangerang", order: "SO-2025-0041", items: "1 Item", total: "Rp 150.000", status: "Disetujui" },
  ];

  const detailItems = [
    { name: "Pipa PVC 1/2 Inch", sku: "PIP-001", qty: "2 Pcs", price: "Rp 22.500", icon: "🚿" },
    { name: "Elbow PVC 1/2 Inch", sku: "ELB-001", qty: "1 Pcs", price: "Rp 128.000", icon: "🔧" },
    { name: "Fitting T 1/2 Inch", sku: "FIT-001", qty: "1 Pcs", price: "Rp 48.000", icon: "🔩" },
  ];

  return (
    <div className="retur-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="retur-toko__header">
          <div className="retur-toko__title-section">
            <h1>Retur Penjualan</h1>
            <p>Kelola data retur penjualan dari pelanggan.</p>
          </div>
          <button className="btn-buat">
            <span style={{ fontSize: "18px" }}>+</span> Buat Retur Penjualan
          </button>
        </header>

        {/* SUMMARY */}
        <section className="retur-toko__summary">
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
        <div className="retur-toko__main">
          {/* LEFT CONTENT */}
          <section className="retur-content-box">
            <div className="retur-filters">
              <select className="filter-select"><option>Semua Status</option></select>
              <select className="filter-select"><option>Semua Pelanggan</option></select>
              <input type="text" className="filter-date" placeholder="01 Mei 2025 - 24 Mei 2025" />
              <div className="filter-search">
                <span>🔍</span>
                <input placeholder="Cari nomor retur / nama pelanggan..." />
              </div>
              <button className="btn-reset">Reset</button>
            </div>

            <table className="retur-table">
              <thead>
                <tr>
                  <th>No. Retur</th>
                  <th>Tanggal</th>
                  <th>Pelanggan</th>
                  <th>No. Pesanan</th>
                  <th>Total Item</th>
                  <th>Total Nilai</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <motion.tr 
                    key={row.id}
                    className={selectedRetur === row.id ? "row-selected" : ""}
                    onClick={() => setSelectedRetur(row.id)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.04 }}
                    style={{ cursor: "pointer", background: selectedRetur === row.id ? "var(--bg-2)" : "transparent" }}
                  >
                    <td style={{ fontWeight: 600 }}>{row.id}</td>
                    <td style={{ fontSize: "11px" }}>{row.date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.client}</div>
                      <div style={{ fontSize: "10px", color: "#94a3b8" }}>{row.location}</div>
                    </td>
                    <td style={{ fontWeight: 500, color: "var(--primary)" }}>{row.order}</td>
                    <td>{row.items}</td>
                    <td style={{ fontWeight: 600 }}>{row.total}</td>
                    <td>
                      <span className={`status-badge status--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action">⋮</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-area">
              <span>Menampilkan 1 - 8 dari 18 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">2</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR - DETAIL */}
          <aside className="retur-detail-sidebar">
            <div className="detail-header">
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)" }}>📋 Detail Retur</span>
              <span className="status-badge status--menunggu">Menunggu</span>
            </div>
            
            <h3 className="detail-title">{selectedRetur}</h3>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Tanggal</span>
                <span className="info-value">24 Mei 2025, 10:30 WIB</span>
              </div>
              <div className="info-item">
                <span className="info-label">Pelanggan</span>
                <span className="info-value">Toko Maju Jaya</span>
              </div>
              <div className="info-item">
                <span className="info-label">No. Pesanan</span>
                <span className="info-value" style={{ color: "var(--primary)" }}>SO-2025-0056</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Item</span>
                <span className="info-value">3 Item</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Nilai</span>
                <span className="info-value">Rp 450.000</span>
              </div>
              <div className="info-item">
                <span className="info-label">Alasan Retur</span>
                <span className="info-value">Produk rusak</span>
              </div>
              <div className="info-item">
                <span className="info-label">Catatan</span>
                <span className="info-value">Kemasan sobek saat diterima</span>
              </div>
            </div>

            <div className="item-list-section">
              <h4 className="item-list-title">Item Retur (3)</h4>
              <div className="item-retur-list">
                {detailItems.map((item, i) => (
                  <div key={i} className="item-retur-row">
                    <div className="item-icon-box">{item.icon}</div>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-sku">SKU: {item.sku}</span>
                    </div>
                    <div className="item-qty-price">
                      <span className="item-qty">{item.qty}</span>
                      <span className="item-price">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn-reject">✕ Tolak Retur</button>
              <button className="btn-approve">✓ Setujui Retur</button>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}
