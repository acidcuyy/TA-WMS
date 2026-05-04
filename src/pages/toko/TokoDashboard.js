import { useMemo } from "react";
import { motion } from "framer-motion";
import "./TokoDashboard.css";

export default function TokoDashboard() {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  const summaryCards = [
    {
      label: "Total Stok",
      value: "1.250",
      unit: "Item",
      subtext: "Nilai: Rp 125.500.000",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
        </svg>
      ),
      iconClass: "summary-card__icon--blue",
    },
    {
      label: "Stok Menipis",
      value: "18",
      unit: "Item",
      subtext: "Perlu restock segera",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
      ),
      iconClass: "summary-card__icon--orange",
    },
    {
      label: "Pesanan Penjualan",
      value: "24",
      unit: "Pesanan",
      subtext: "Menunggu diproses",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      ),
      iconClass: "summary-card__icon--green",
    },
    {
      label: "Penjualan Hari ini",
      value: "Rp 3.450.000",
      unit: "",
      subtext: (
        <>
          <span className="trend--up">▲ 12.5%</span> dari kemarin
        </>
      ),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      iconClass: "summary-card__icon--sky",
    },
    {
      label: "Pengeluaran Hari ini",
      value: "Rp 1.250.000",
      unit: "",
      subtext: (
        <>
          <span className="trend--down">▼ 5.3%</span> dari kemarin
        </>
      ),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      iconClass: "summary-card__icon--red",
    },
  ];

  const bestSellers = [
    { id: 1, name: "Pipa PVC 1/2 Inch", sku: "PPI-001", sold: 180, unit: "Pcs", stock: 450 },
    { id: 2, name: "Elbow PVC 1/2 Inch", sku: "ELB-001", sold: 150, unit: "Pcs", stock: 320 },
    { id: 3, name: "Fitting T 1/2 Inch", sku: "FIT-001", sold: 120, unit: "Pcs", stock: 120 },
    { id: 4, name: "Lem PVC 100ml", sku: "LEM-001", sold: 100, unit: "Pcs", stock: 85 },
    { id: 5, name: "Kabel NYM 3x1.5mm", sku: "KAB-001", sold: 90, unit: "Mtr", stock: 380 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "order",
      text: "Pesanan penjualan #SO-2025-0056 telah dibuat",
      user: "oleh Admin Toko",
      time: "10:30 WIB",
      icon: "🛒",
      iconClass: "activity-icon--green",
    },
    {
      id: 2,
      type: "receive",
      text: "Penerimaan barang dari Gudang Pusat",
      user: "#IN-2025-0042",
      time: "09:15 WIB",
      icon: "📥",
      iconClass: "activity-icon--blue",
    },
    {
      id: 3,
      type: "transfer",
      text: "Transfer barang dari Gudang Cabang",
      user: "#TR-2025-0031",
      time: "Kemarin, 16:45",
      icon: "⇄",
      iconClass: "activity-icon--orange",
    },
    {
      id: 4,
      type: "alert",
      text: "Stok menipis: Minyak Goreng 1L",
      user: "Stok tersisa 15 Pcs",
      time: "Kemarin, 14:20",
      icon: "⚠️",
      iconClass: "activity-icon--red",
    },
  ];

  return (
    <div className="toko-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="toko-dashboard__header">
          <div className="toko-dashboard__title-section">
            <h1>Toko Dashboard</h1>
            <p>Monitor performa toko, stok barang, dan aktivitas transaksi secara real-time.</p>
          </div>
          <div className="toko-dashboard__actions">
            <button className="btn-refresh">
              <span>🔄</span> Sinkronisasi Data
            </button>
            <button className="btn-export">
              <span>📥</span> Export Laporan
            </button>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <section className="toko-dashboard__summary">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={idx}
              className="summary-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
            >
              <div className="summary-card__head">
                <div className={`summary-card__icon ${card.iconClass}`}>
                  {card.icon}
                </div>
                <span className="summary-card__label">{card.label}</span>
              </div>
              <h2 className="summary-card__value">{card.value} <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>{card.unit}</span></h2>
              <div className="summary-card__subtext">{card.subtext}</div>
            </motion.div>
          ))}
        </section>

        {/* MAIN GRID */}
        <div className="toko-dashboard__grid">
          {/* LEFT COLUMN: SALES CHART */}
          <section className="dashboard-card sales-performance">
            <div className="card-header">
              <h3 className="card-title">Performa Penjualan</h3>
              <select className="filter-select">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            <div className="chart-container">
              <div className="chart-y-axis">
                <span>10jt</span>
                <span>7.5jt</span>
                <span>5jt</span>
                <span>2.5jt</span>
                <span>0</span>
              </div>
              <div className="chart-area">
                {/* SVG Chart Placeholder */}
                <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-sales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,150 L133,120 L266,130 L400,100 L533,90 L666,110 L800,85 L800,200 L0,200 Z"
                    fill="url(#gradient-sales)"
                  />
                  <path
                    d="M0,150 L133,120 L266,130 L400,100 L533,90 L666,110 L800,85"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                  />
                  {/* Points */}
                  {[
                    { x: 0, y: 150 }, { x: 133, y: 120 }, { x: 266, y: 130 },
                    { x: 400, y: 100 }, { x: 533, y: 90 }, { x: 666, y: 110 }, { x: 800, y: 85 }
                  ].map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#f97316" strokeWidth="2" />
                  ))}
                </svg>
                <div className="chart-x-axis">
                  <span>18 Mei</span>
                  <span>19 Mei</span>
                  <span>20 Mei</span>
                  <span>21 Mei</span>
                  <span>22 Mei</span>
                  <span>23 Mei</span>
                  <span>24 Mei</span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: BEST SELLERS */}
          <section className="dashboard-card best-sellers">
            <div className="card-header">
              <h3 className="card-title">Produk Terlaris</h3>
              <a href="#" className="view-all">Lihat Semua</a>
            </div>
            <div className="product-list">
              {bestSellers.map((product, idx) => (
                <div key={idx} className="product-item">
                  <div className="product-rank">{idx + 1}</div>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-sku">SKU: {product.sku}</span>
                  </div>
                  <div className="product-stats">
                    <span className="sold-count">{product.sold} {product.unit}</span>
                    <span className="stock-count">Stok: {product.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BOTTOM LEFT: RECENT ACTIVITIES */}
          <section className="dashboard-card recent-activities">
            <div className="card-header">
              <h3 className="card-title">Aktivitas Terbaru</h3>
              <a href="#" className="view-all">Semua Aktivitas</a>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-icon ${activity.iconClass}`}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="activity-meta">
                      <span className="activity-user">{activity.user}</span>
                      <span className="activity-dot">•</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BOTTOM RIGHT: STOCK SUMMARY */}
          <section className="dashboard-card stock-status">
            <div className="card-header">
              <h3 className="card-title">Status Stok</h3>
            </div>
            <div className="stock-summary-grid">
              <div className="stock-summary-item">
                <div className="stock-summary-label">Produk Aman</div>
                <div className="stock-summary-value" style={{ color: "#22c55e" }}>85%</div>
                <div className="stock-summary-unit">8 produk</div>
              </div>
              <div className="stock-summary-item">
                <div className="stock-summary-label">Stok Menipis</div>
                <div className="stock-summary-value" style={{ color: "#f97316" }}>12%</div>
                <div className="stock-summary-unit">1 produk</div>
              </div>
              <div className="stock-summary-item">
                <div className="stock-summary-label">Stok Habis</div>
                <div className="stock-summary-value" style={{ color: "#ef4444" }}>3%</div>
                <div className="stock-summary-unit">1 produk</div>
              </div>
            </div>
            <div className="stock-chart-mini">
              <div className="stock-bar-wrap">
                <div className="stock-bar stock-bar--aman" style={{ width: "70%" }}></div>
                <div className="stock-bar stock-bar--menipis" style={{ width: "20%" }}></div>
                <div className="stock-bar stock-bar--habis" style={{ width: "10%" }}></div>
              </div>
              <div className="stock-legend">
                <div className="legend-item"><span className="dot dot--green"></span> Aman</div>
                <div className="legend-item"><span className="dot dot--orange"></span> Menipis</div>
                <div className="legend-item"><span className="dot dot--red"></span> Habis</div>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
