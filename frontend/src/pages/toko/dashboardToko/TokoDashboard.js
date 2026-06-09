import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import DateRangePicker from "../../../components/common/DateRangePicker";
import "./TokoDashboard.css";
import { subscribeTokoInventory, subscribeRequests, subscribeNotifications, subscribeTokoOutflow } from "../../../services/wmsApi";

export default function TokoDashboard() {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  const [stock, setStock] = useState([]);
  const [requests, setRequests] = useState([]);
  const [outflows, setOutflows] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubStock = subscribeTokoInventory(data => setStock(data));
    const unsubReq = subscribeRequests(data => setRequests(data.filter(r => (r.fromRole || "").toLowerCase() === "toko")));
    const unsubOut = subscribeTokoOutflow(data => setOutflows(data));
    const unsubNotif = subscribeNotifications(data => {
      setNotifications(data.filter(n => n.targetRoles && n.targetRoles.includes("toko")));
    });

    return () => {
      unsubStock();
      unsubReq();
      unsubOut();
      unsubNotif();
    };
  }, []);

  // Compute metrics for Toko Inventory
  const totalStok = stock.reduce((sum, item) => sum + (item.qty || 0), 0);
  const stokMenipisItems = stock.filter(item => item.qty > 0 && item.qty <= (item.minQty || 5));
  const stokHabisItems = stock.filter(item => item.qty === 0);
  const stokAmanItems = stock.filter(item => item.qty > (item.minQty || 5));

  const totalMenipis = stokMenipisItems.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalAman = stokAmanItems.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalHabis = stokHabisItems.length; // Count SKU, qty is 0

  // Request stats (Penerimaan)
  const reqPending = requests.filter(r => {
    const s = (r.status || "").toLowerCase();
    return s.includes("menunggu") || s.includes("memproses") || s.includes("siap");
  }).length;

  const reqDikirim = requests.filter(r => {
    const s = (r.status || "").toLowerCase();
    return s.includes("mengirim");
  }).length;

  // Outflow stats (Pengeluaran)
  const today = new Date().toISOString().slice(0, 10);
  const outflowHariIni = outflows.filter(o => o.createdAt?.slice(0, 10) === today).length;

  // Sort best sellers (we use top stock for now)
  const topStock = [...stock].sort((a, b) => (b.qty || 0) - (a.qty || 0)).slice(0, 5);

  const summaryCards = [
    {
      label: "Total Stok",
      value: totalStok.toLocaleString("id-ID"),
      unit: "Item",
      subtext: "Stok fisik di toko",
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
      value: (stokMenipisItems.length + stokHabisItems.length).toString(),
      unit: "SKU",
      subtext: "Perlu restock segera",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
        </svg>
      ),
      iconClass: "summary-card__icon--orange",
    },
    {
      label: "Request Pending",
      value: reqPending.toString(),
      unit: "Request",
      subtext: "Menunggu diproses gudang",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      ),
      iconClass: "summary-card__icon--purple",
    },
    {
      label: "Dalam Pengiriman",
      value: reqDikirim.toString(),
      unit: "Request",
      subtext: "Sedang dikirim oleh driver",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      iconClass: "summary-card__icon--sky",
    },
    {
      label: "Pengeluaran Hari Ini",
      value: outflowHariIni.toString(),
      unit: "Transaksi",
      subtext: "Barang keluar hari ini",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
      iconClass: "summary-card__icon--green",
    },
  ];

  // Helper for notification icons
  const getIcon = (type) => {
    switch (type) {
      case "request_accepted": return { i: "👍", c: "activity-icon--green" };
      case "request_declined": return { i: "🚫", c: "activity-icon--red" };
      case "shipping_ready": return { i: "📦", c: "activity-icon--blue" };
      case "shipping": return { i: "🚚", c: "activity-icon--orange" };
      case "done": return { i: "✅", c: "activity-icon--purple" };
      default: return { i: "ℹ️", c: "activity-icon--sky" };
    }
  };

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
              Dashboard Toko
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Ringkasan aktivitas dan stok barang di toko Anda.
            </motion.p>
          </div>
          <motion.div 
            className="toko-dashboard__date-picker"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <DateRangePicker />
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
          {/* SALES CHART -> ACTIVITY CHART */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: easing }}
          >
            <div className="content-card__header">
              <h3 className="content-card__title">Tren Pengeluaran Barang</h3>
              <select className="content-card__select">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            <div className="chart-container">
              {/* Y Labels on the left */}
              <div style={{ position: "absolute", left: "0", top: "0", bottom: "30px", width: "80px", fontSize: "10px", color: "#94a3b8", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", zIndex: 5 }}>
                <span>100 Trx</span>
                <span>75 Trx</span>
                <span>50 Trx</span>
                <span>25 Trx</span>
                <span>0</span>
              </div>
              
              <svg width="100%" height="100%" viewBox="0 0 800 220" preserveAspectRatio="none" style={{ overflow: "visible", paddingLeft: "80px", boxSizing: "border-box" }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
                {/* Line */}
                <motion.path
                  d="M0,160 C100,140 150,100 200,120 C250,140 350,80 400,90 C450,100 550,60 600,80 C650,100 750,70 800,90"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1.8, ease: "easeInOut" }}
                />
                {/* Points */}
                {[
                  {x: 0, y: 160}, {x: 200, y: 120}, {x: 400, y: 90}, {x: 600, y: 80}, {x: 800, y: 90}
                ].map((p, i) => (
                  <motion.circle 
                    key={i} cx={p.x} cy={p.y} r="5.5" fill="white" stroke="#22c55e" strokeWidth="2.5" 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.8 + i * 0.1 }}
                  />
                ))}
              </svg>
              {/* X Labels */}
              <div style={{ position: "absolute", left: "80px", right: "0", bottom: "0", height: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>H-4</div>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>H-3</div>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>H-2</div>
                <div className="chart-label-x" style={{ position: "static", transform: "none" }}>Kemarin</div>
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
              <h3 className="content-card__title">Status Stok Toko</h3>
            </div>
            <div className="donut-container">
              <div className="donut-wrapper">
                <svg className="donut-svg" width="140" height="140" viewBox="0 0 100 100">
                  <circle className="donut-segment donut-segment--gray" cx="50" cy="50" r="38" strokeDasharray="238 238" strokeDashoffset="0" opacity="0.3" />
                  
                  {totalStok > 0 && (
                    <>
                      <motion.circle 
                        className="donut-segment donut-segment--green" cx="50" cy="50" r="38" 
                        strokeDasharray={`${(totalAman/totalStok) * 238} 238`} strokeDashoffset="0"
                        initial={{ strokeDashoffset: 238 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ delay: 1, duration: 1.5, ease: easing }}
                      />
                      <motion.circle 
                        className="donut-segment donut-segment--orange" cx="50" cy="50" r="38" 
                        strokeDasharray={`${(totalMenipis/totalStok) * 238} 238`} strokeDashoffset={`-${(totalAman/totalStok) * 238}`}
                        initial={{ strokeDashoffset: 238 }}
                        animate={{ strokeDashoffset: -(totalAman/totalStok) * 238 }}
                        transition={{ delay: 1.2, duration: 1.2, ease: easing }}
                      />
                      <motion.circle 
                        className="donut-segment donut-segment--red" cx="50" cy="50" r="38" 
                        strokeDasharray={`${(totalHabis/totalStok) * 238} 238`} strokeDashoffset={`-${((totalAman + totalMenipis)/totalStok) * 238}`}
                        initial={{ strokeDashoffset: 238 }}
                        animate={{ strokeDashoffset: -((totalAman + totalMenipis)/totalStok) * 238 }}
                        transition={{ delay: 1.4, duration: 1, ease: easing }}
                      />
                    </>
                  )}
                </svg>
                <div className="donut-center">
                  <span className="donut-center__label">Total</span>
                  <span className="donut-center__value">{totalStok > 999 ? `${(totalStok/1000).toFixed(1)}k` : totalStok}</span>
                  <span className="donut-center__label">Item</span>
                </div>
              </div>
              <div className="donut-legend">
                {[
                  { color: "#22c55e", label: "Aman", value: totalAman, percent: totalStok ? Math.round((totalAman/totalStok)*100)+"%" : "0%" },
                  { color: "#f97316", label: "Menipis", value: totalMenipis, percent: totalStok ? Math.round((totalMenipis/totalStok)*100)+"%" : "0%" },
                  { color: "#ef4444", label: "Habis", value: totalHabis, percent: totalStok ? Math.round((totalHabis/totalStok)*100)+"%" : "0%" },
                ].map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <div className="legend-item__left">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      {item.label}
                    </div>
                    <div className="legend-item__right">{item.value} <span style={{fontSize: '10px', color: '#94a3b8', marginLeft: '4px'}}>{item.percent}</span></div>
                  </div>
                ))}
              </div>
              {(stokMenipisItems.length > 0 || stokHabisItems.length > 0) && (
                <motion.div 
                  className="alert-box"
                  whileHover={{ scale: 1.01, x: 2 }}
                >
                  <div className="alert-box__left">
                    <span className="alert-box__icon">⚠️</span>
                    <span className="alert-box__text">{stokMenipisItems.length + stokHabisItems.length} produk perlu restock segera</span>
                  </div>
                  <span className="alert-box__arrow">›</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>

        {/* BOTTOM GRID */}
        <section className="toko-dashboard__bottom-grid">
          {/* TOP PRODUCTS (STOK TERBANYAK) */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: easing }}
          >
            <div className="content-card__header">
              <h3 className="content-card__title">Stok Terbanyak (Top 5)</h3>
              <a href="/toko/stok" className="view-all-link">Lihat Stok</a>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Produk</th>
                    <th style={{ textAlign: "center" }}>Kategori</th>
                    <th style={{ textAlign: "center" }}>Stok Tersedia</th>
                  </tr>
                </thead>
                <tbody>
                  {topStock.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign: "center", padding: "20px"}}>Tidak ada data stok</td></tr>
                  ) : topStock.map((item, i) => (
                    <motion.tr 
                      key={item.sku}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.05 }}
                    >
                      <td>{i + 1}</td>
                      <td>
                        <div className="product-cell">
                        <div className="product-image" style={{ backgroundColor: ["#f1f5f9", "#e2e8f0", "#fee2e2", "#ffedd5", "#f0fdf4"][i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                          {["📦", "🔧", "⚙️", "🧴", "🔌"][i % 5]}
                        </div>
                          <div className="product-info">
                            <span className="product-info__name">{item.name}</span>
                            <span className="product-info__sku">SKU: {item.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ color: "#64748b", fontSize: "13px" }}>{item.category || "Umum"}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`stock-badge ${item.qty <= (item.minQty||5) ? "stock-badge--low" : ""}`}>
                          {item.qty} {item.unit || "pcs"}
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
              <h3 className="content-card__title">Notifikasi Terbaru</h3>
              <span className="view-all-link">Ringkasan</span>
            </div>
            <div className="activity-list">
              {notifications.length === 0 ? (
                <div style={{textAlign: "center", padding: "20px", color: "#94a3b8"}}>Belum ada notifikasi</div>
              ) : notifications.slice(0, 5).map((activity, idx) => {
                const iconData = getIcon(activity.type);
                return (
                  <motion.div 
                    key={activity.id} 
                    className="activity-item"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + idx * 0.08 }}
                  >
                    <div className={`activity-icon ${iconData.c}`}>
                      {iconData.i}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.title}</p>
                      <span className="activity-user">{activity.message}</span>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
