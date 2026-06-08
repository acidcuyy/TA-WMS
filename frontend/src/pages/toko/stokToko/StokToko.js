import { useState } from "react";
import { motion } from "framer-motion";
import DetailModal from "../../../components/common/DetailModal";
import "./StokToko.css";

export default function StokToko() {
  const [activeTab, setActiveTab] = useState("Semua Produk");
  const [detailModal, setDetailModal] = useState(null);
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Produk", value: "10", unit: "Produk", icon: "📦", iconClass: "summary-card__icon--purple", link: "Lihat semua produk →" },
    { label: "Total Stok", value: "1.250", unit: "Item", icon: "🌐", iconClass: "summary-card__icon--blue", subtext: "Berdasarkan hitungan fisik" },
    { label: "Stok Tersedia", value: "1.050", unit: "Item", icon: "✅", iconClass: "summary-card__icon--green", subtext: <><span style={{color: "#22c55e"}}>↑ 84%</span> dari total stok</> },
    { label: "Stok Menipis", value: "18", unit: "Item", icon: "⚠️", iconClass: "summary-card__icon--orange", subtext: <><span style={{color: "#ef4444"}}>↓ 14.4%</span> dari total produk</> },
    { label: "Stok Habis", value: "2", unit: "Item", icon: "🚫", iconClass: "summary-card__icon--red", subtext: <><span style={{color: "#ef4444"}}>↑ 1.6%</span> dari total produk</> },
  ];

  const products = [
    { id: 1, name: "Pipa PVC 1/2 Inch", sku: "PPI-001", cat: "Plumbing", unit: "Pcs", stock: 450, status: "Aman", icon: "🚿" },
    { id: 2, name: "Elbow PVC 1/2 Inch", sku: "ELB-001", cat: "Plumbing", unit: "Pcs", stock: 320, status: "Menipis", icon: "🔧" },
    { id: 3, name: "Fitting T 1/2 Inch", sku: "FIT-001", cat: "Plumbing", unit: "Pcs", stock: 120, status: "Menipis", icon: "⚙️" },
    { id: 4, name: "Lem PVC 100ml", sku: "LEM-001", cat: "Plumbing", unit: "Pcs", stock: 85, status: "Aman", icon: "🧴" },
    { id: 5, name: "Kabel NYM 3x1.5mm", sku: "KAB-001", cat: "Elektrikal", unit: "Mtr", stock: 380, status: "Aman", icon: "🔌" },
    { id: 6, name: "Lampu LED 12W Putih", sku: "LAM-001", cat: "Elektrikal", unit: "Pcs", stock: 250, status: "Aman", icon: "💡" },
    { id: 7, name: "Stop Kontak Arde", sku: "SKA-001", cat: "Elektrikal", unit: "Pcs", stock: 80, status: "Menipis", icon: "🔌" },
    { id: 8, name: "Semen Portland 40kg", sku: "SEM-001", cat: "Bahan Bangunan", unit: "Zak", stock: 45, status: "Menipis", icon: "🧱" },
    { id: 9, name: "Cat Tembok Putih 5kg", sku: "CAT-001", cat: "Bahan Bangunan", unit: "Zak", stock: 30, status: "Aman", icon: "🎨" },
    { id: 10, name: "Baut M8 x 40mm", sku: "BAU-001", cat: "Hardware", unit: "Pcs", stock: 0, status: "Habis", icon: "🔩" },
  ];

  return (
    <div className="stok-produk">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="stok-produk__header">
          <div className="stok-produk__title-section">
            <h1>Stok & Produk</h1>
            <p>Kelola informasi stok barang dan produk yang tersedia di toko Anda.</p>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="stok-produk__summary">
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
              <h2 className="summary-card__value">{card.value} <span style={{ fontSize: "12px", color: "#94a3b8" }}>{card.unit}</span></h2>
              {card.subtext && <div className="summary-card__subtext">{card.subtext}</div>}
              {card.link && <a href="#" className="summary-card__view-all">{card.link}</a>}
            </motion.div>
          ))}
        </section>

        {/* MAIN GRID */}
        <div className="stok-produk__main">
          {/* LEFT CONTENT */}
          <section className="stok-content-box">
            <div className="stok-filters">
              <select className="filter-select"><option>Semua Kategori</option></select>
              <select className="filter-select"><option>Semua Satuan</option></select>
              <select className="filter-select"><option>Status Stok</option></select>
              <div className="filter-search">
                <span>🔍</span>
                <input placeholder="Cari nama produk, SKU, atau barcode..." />
              </div>
              <button className="btn-reset">Reset</button>
            </div>

            <div className="stok-tabs">
              {["Semua Produk", "Aktif", "Tidak Aktif"].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="product-grid">
              {products.map((p, idx) => (
                <motion.div 
                  key={p.id} 
                  className="product-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.03 }}
                >
                  <span className={`product-card__status status--${p.status.toLowerCase()}`}>{p.status}</span>
                  <div className="product-card__img-wrap">{p.icon}</div>
                  <span className="product-card__name">{p.name}</span>
                  <span className="product-card__sku">SKU: {p.sku}</span>
                  
                  <div className="product-card__info-row">
                    <span className="info-label">Kategori</span>
                    <span className="info-value">{p.cat}</span>
                  </div>
                  <div className="product-card__info-row">
                    <span className="info-label">Satuan</span>
                    <span className="info-value">{p.unit}</span>
                  </div>
                  <div className="product-card__info-row">
                    <span className="info-label">Stok Tersedia</span>
                    <span className="info-value info-value--bold" style={{ color: p.stock < 100 ? "#ea580c" : "#22c55e" }}>{p.stock}</span>
                  </div>

                  <div className="product-card__actions">
                    <button className="btn-icon" onClick={() => setDetailModal(p)}>👁️</button>
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">⋯</button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pagination-area">
              <span>Menampilkan 1 - 10 dari 10 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px", padding: "4px 8px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="stok-sidebar">
            {/* RINGKASAN STOK */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <h3 className="widget-title">Ringkasan Stok</h3>
                <a href="#" className="btn-widget-action">Export ⌄</a>
              </div>
              <div className="donut-mini">
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="200 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="30 251" strokeDashoffset="-200" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="21 251" strokeDashoffset="-230" />
                  <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
                  <text x="50" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">1.250</text>
                  <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">ITEM</text>
                </svg>
              </div>
              <div className="category-list">
                {[
                  { color: "#22c55e", label: "Stok Aman", value: "1.050", p: "84%" },
                  { color: "#f97316", label: "Stok Menipis", value: "120", p: "10%" },
                  { color: "#ef4444", label: "Stok Habis", value: "40", p: "3%" },
                  { color: "#94a3b8", label: "Tidak Aktif", value: "40", p: "3%" },
                ].map((item, i) => (
                  <div key={i} className="category-item">
                    <div className="cat-info">
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }}></span>
                      {item.label}
                    </div>
                    <span className="cat-value">{item.value} <span style={{fontSize: "10px"}}>({item.p})</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP KATEGORI */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <h3 className="widget-title">Top Kategori (Jumlah Item)</h3>
              </div>
              <div className="category-list">
                {[
                  { icon: "🚿", label: "Plumbing", value: "450 item", color: "#f0fdf4" },
                  { icon: "🔌", label: "Elektrikal", value: "380 item", color: "#eff6ff" },
                  { icon: "🧱", label: "Bahan Bangunan", value: "120 item", color: "#fff7ed" },
                  { icon: "🔩", label: "Hardware", value: "50 item", color: "#fef2f2" },
                ].map((item, i) => (
                  <div key={i} className="category-item">
                    <div className="cat-info">
                      <div className="cat-icon" style={{ background: item.color }}>{item.icon}</div>
                      {item.label}
                    </div>
                    <span className="cat-value" style={{fontSize: "11px", fontWeight: 600}}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STOK MENIPIS & HABIS */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <h3 className="widget-title">Stok Menipis & Habis</h3>
                <a href="#" className="btn-widget-action">Lihat Semua</a>
              </div>
              <div className="mini-list">
                {products.filter(p => p.status !== "Aman").slice(0, 5).map(p => (
                  <div key={p.id} className="mini-item">
                    <div className="mini-img">{p.icon}</div>
                    <div className="mini-content">
                      <span className="mini-name">{p.name}</span>
                      <span className="mini-sub">Stok tersisa {p.stock} {p.unit}</span>
                    </div>
                    <span className={`mini-status status--${p.status.toLowerCase()}`}>{p.status}</span>
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
        title="Detail Produk"
        subtitle={detailModal ? `${detailModal.sku} • ${detailModal.cat}` : ''}
        details={detailModal ? [
          { label: "Status Stok", value: detailModal.status, color: detailModal.status === 'Aman' ? '#52c41a' : detailModal.status === 'Menipis' ? '#fa8c16' : '#ef4444' },
          { label: "Satuan", value: detailModal.unit },
        ] : []}
        itemsTitle="Jumlah Stok"
        items={detailModal ? [`${detailModal.stock} ${detailModal.unit}`] : []}
      />
    </div>
  );
}