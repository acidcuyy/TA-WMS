import { motion } from "framer-motion";
import { useMemo } from "react";
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
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
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
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
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
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
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
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
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
          <path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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
    {
      id: 5,
      type: "out",
      text: "Pengeluaran barang #OUT-2025-0022",
      user: "oleh Admin Toko",
      time: "Kemarin, 11:10",
      icon: "📤",
      iconClass: "activity-icon--purple",
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
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Ringkasan aktivitas dan informasi penting toko Anda hari ini.
            </motion.p>
          </div>
          <motion.div 
            className="toko-dashboard__date-picker"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span>📅 24 Mei 2025</span>
            <span style={{ fontSize: "10px", opacity: 0.5 }}>▼</span>
          </motion.div>
        </header>

        {/* SUMMARY CARDS */}
        <section className="toko-dashboard__summary">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={idx}
              className="summary-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.08, duration: 0.5, ease: easing }}
              whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
            >
              <div className="summary-card__head">
                <div className={`summary-card__icon ${card.iconClass}`}>
                  {card.icon}
                </div>
                <span className="summary-card__label">{card.label}</span>
              </div>
              <h2 className="summary-card__value">
                {card.value} <span style={{ fontSize: "13px", fontWeight: 500, color: "#94a3b8" }}>{card.unit}</span>
              </h2>
              <div className="summary-card__subtext">{card.subtext}</div>
            </motion.div>
          ))}
        </section>

        {/* MIDDLE GRID */}
        <section className="toko-dashboard__middle-grid">
          {/* SALES CHART */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: easing }}
          >
            <div className="content-card__header">
              <h3 className="content-card__title">Grafik Penjualan</h3>
              <select className="content-card__select">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            <div className="chart-container">
              {/* Y Labels on the left */}
              <div style={{ position: "absolute", left: "0", top: "0", bottom: "30px", width: "80px", fontSize: "10px", color: "#94a3b8", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", zIndex: 5 }}>
                <span>Rp 5.000.000</span>
                <span>Rp 3.750.000</span>
                <span>Rp 2.500.000</span>
                <span>Rp 1.250.000</span>
                <span>0</span>
              </div>
              
              <svg width="100%" height="100%" viewBox="0 0 800 220" preserveAspectRatio="none" style={{ overflow: "visible", paddingLeft: "80px", boxSizing: "border-box" }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                {[0, 50, 100, 150, 200].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {/* Area */}
                <motion.path
                  d="M0,160 C100,140 150,100 200,120 C250,140 350,80 400,90 C450,100 550,60 600,80 C650,100 750,70 800,90 L800,220 L0,220 Z"
                  fill="url(#chartGradient)"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1.2 }}
                />
                {/* Line */}
                <motion.path
                  d="M0,160 C100,140 150,100 200,120 C250,140 350,80 400,90 C450,100 550,60 600,80 C650,100 750,70 800,90"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                />
                {/* Points */}
                {[
                  {x: 0, y: 160}, {x: 200, y: 120}, {x: 400, y: 90}, {x: 600, y: 80}, {x: 800, y: 90}
                ].map((p, i) => (
                  <motion.circle 
                    key={i} cx={p.x} cy={p.y} r="5.5" fill="white" stroke="#f97316" strokeWidth="2.5" 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.8 + i * 0.1 }}
                  />
                ))}
              </svg>
              {/* X Labels */}
              <div style={{ position: "absolute", left: "80px", right: "0", bottom: "0", height: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>18 Mei</div>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>20 Mei</div>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>22 Mei</div>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>24 Mei</div>
              </div>
            </div>
          </motion.div>

          {/* STOCK SUMMARY (Donut) */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: easing }}
          >
            <div className="content-card__header">
              <h3 className="content-card__title">Ringkasan Stok</h3>
            </div>
            <div className="donut-container">
              <div className="donut-wrapper">
                <svg className="donut-svg" width="160" height="160" viewBox="0 0 100 100">
                  <circle className="donut-segment donut-segment--gray" cx="50" cy="50" r="38" strokeDasharray="238 238" strokeDashoffset="0" opacity="0.3" />
                  <motion.circle 
                    className="donut-segment donut-segment--green" cx="50" cy="50" r="38" 
                    strokeDasharray="200 238" strokeDashoffset="0"
                    initial={{ strokeDashoffset: 238 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ delay: 1, duration: 1.5, ease: easing }}
                  />
                  <motion.circle 
                    className="donut-segment donut-segment--orange" cx="50" cy="50" r="38" 
                    strokeDasharray="30 238" strokeDashoffset="-200"
                    initial={{ strokeDashoffset: 238 }}
                    animate={{ strokeDashoffset: -200 }}
                    transition={{ delay: 1.2, duration: 1.2, ease: easing }}
                  />
                  <motion.circle 
                    className="donut-segment donut-segment--red" cx="50" cy="50" r="38" 
                    strokeDasharray="15 238" strokeDashoffset="-230"
                    initial={{ strokeDashoffset: 238 }}
                    animate={{ strokeDashoffset: -230 }}
                    transition={{ delay: 1.4, duration: 1, ease: easing }}
                  />
                </svg>
                <div className="donut-center" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span className="donut-center__label" style={{ marginBottom: "-4px" }}>Total</span>
                  <span className="donut-center__value" style={{ lineHeight: "1" }}>1.250</span>
                  <span className="donut-center__label" style={{ marginTop: "-2px" }}>Item</span>
                </div>
              </div>
              <div className="donut-legend">
                {[
                  { color: "#22c55e", label: "Stok Aman", value: "1.050", percent: "84%" },
                  { color: "#f97316", label: "Stok Menipis", value: "120", percent: "10%" },
                  { color: "#ef4444", label: "Stok Habis", value: "40", percent: "3%" },
                  { color: "#94a3b8", label: "Tidak Aktif", value: "40", percent: "3%" },
                ].map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <div className="legend-item__left">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      {item.label}
                    </div>
                    <div className="legend-item__right">{item.value} <span className="legend-item__percent">({item.percent})</span></div>
                  </div>
                ))}
              </div>
              <motion.div 
                className="alert-box"
                whileHover={{ scale: 1.02, x: 3 }}
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                <div className="alert-box__left">
                  <span>⚠️</span>
                  <span>18 produk perlu restock</span>
                </div>
                <span>›</span>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* BOTTOM GRID */}
        <section className="toko-dashboard__bottom-grid">
          {/* TOP PRODUCTS */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: easing }}
          >
            <div className="content-card__header">
              <h3 className="content-card__title">Produk Terlaris</h3>
              <a href="#" className="view-all-link">Lihat Semua</a>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Produk</th>
                    <th style={{ textAlign: "center" }}>Terjual</th>
                    <th style={{ textAlign: "center" }}>Stok Tersedia</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map((item, i) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.05 }}
                    >
                      <td>{i + 1}</td>
                      <td>
                        <div className="product-cell">
                        <div className="product-image" style={{ backgroundColor: ["#f1f5f9", "#e2e8f0", "#fee2e2", "#ffedd5", "#f0fdf4"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                          {["📦", "🔧", "⚙️", "🧴", "🔌"][i]}
                        </div>
                          <div className="product-info">
                            <span className="product-info__name">{item.name}</span>
                            <span className="product-info__sku">SKU: {item.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <strong>{item.sold}</strong> <span style={{ color: "#94a3b8", fontSize: "11px" }}>{item.unit}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`stock-badge ${item.stock < 100 ? "stock-badge--low" : ""}`}>
                          {item.stock}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* RECENT ACTIVITY */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: easing }}
          >
            <div className="content-card__header">
              <h3 className="content-card__title">Aktivitas Terbaru</h3>
              <a href="#" className="view-all-link">Lihat Semua</a>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, idx) => (
                <motion.div 
                  key={activity.id} 
                  className="activity-item"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + idx * 0.08 }}
                >
                  <div className={`activity-icon ${activity.iconClass}`}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.text}</p>
                    <span className="activity-user">{activity.user}</span>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
