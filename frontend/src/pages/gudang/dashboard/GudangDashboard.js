import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import "./GudangDashboard.css";

const fmtIDR = (n) =>
   new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function GudangDashboard() {
   const [isLoaded, setIsLoaded] = useState(false);

   useEffect(() => {
      setIsLoaded(true);
   }, []);

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
         }
      }
   };

   const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
         opacity: 1,
         y: 0,
         transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }
   };

   const stats = [
      { label: "Total Stok", value: "12.560", sub: "Nilai: Rp 2.450.000.000", icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Barang Masuk (Hari Ini)", value: "350", sub: "5 Transaksi", icon: "⬇️", color: "#52c41a", bg: "#f6ffed" },
      { label: "Barang Keluar (Hari Ini)", value: "270", sub: "6 Transaksi", icon: "⬆️", color: "#e4915a", bg: "#fff8f3" },
      { label: "Transfer (Hari Ini)", value: "120", sub: "3 Transaksi", icon: "⇄", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Order Menunggu Proses", value: "8", sub: "Order", icon: "🕒", color: "#fa8c16", bg: "#fff7e6", link: "Lihat detail >" },
   ];

   const recentOrders = [
      { id: "PO-2026-00078", from: "Toko A", date: "07 Feb 2026 09:15", items: 45, status: "Menunggu" },
      { id: "PO-2026-00077", from: "Toko B", date: "07 Feb 2026 08:30", items: 30, status: "Proses" },
      { id: "TR-2026-00056", from: "Gudang Timur", date: "07 Feb 2026 07:45", items: 20, status: "Menunggu" },
      { id: "PO-2026-00076", from: "Toko C", date: "06 Feb 2026 16:20", items: 25, status: "Selesai" },
      { id: "PO-2026-00075", from: "Toko D", date: "06 Feb 2026 14:10", items: 18, status: "Selesai" },
   ];

   const activities = [
      { time: "10:15", title: "Penerimaan barang dari Toko A", sub: "PO-2026-00078", tag: "45 item", color: "#52c41a" },
      { time: "09:40", title: "Pengeluaran barang untuk Toko B", sub: "SO-2026-00064", tag: "20 item", color: "#e4915a" },
      { time: "09:10", title: "Transfer ke Gudang Timur", sub: "TR-2026-00056", tag: "20 item", color: "#1890ff" },
      { time: "08:35", title: "Penerimaan barang dari Toko C", sub: "PO-2026-00076", tag: "25 item", color: "#52c41a" },
      { time: "08:00", title: "Pengeluaran barang untuk Toko D", sub: "SO-2026-00063", tag: "15 item", color: "#e4915a" },
   ];

   const quickActions = [
      { label: "Penerimaan Barang", icon: "⬇️", color: "#52c41a" },
      { label: "Pengeluaran Barang", icon: "⬆️", color: "#e4915a" },
      { label: "Transfer Barang", icon: "⇄", color: "#1890ff" },
      { label: "Request Masuk", icon: "📥", color: "#722ed1" },
      { label: "Cek Stok", icon: "📦", color: "#fa8c16" },
      { label: "Scan Barcode", icon: "📷", color: "#595959" },
   ];

   return (
      <motion.div 
         className="gdash"
         initial="hidden"
         animate="visible"
         variants={containerVariants}
      >
         {/* HEADER */}
         <motion.header className="gdash__head" variants={itemVariants}>
            <div>
               <h1 className="gdash__title">Selamat datang, Admin Gudang! 👋</h1>
               <p className="gdash__subtitle">Berikut adalah ringkasan aktivitas dan kondisi gudang hari ini.</p>
            </div>
            <div className="gdash__dateCard">
               <span className="gdash__dateIcon">📅</span>
               <div className="gdash__dateText">
                  <strong>Rabu, 07 Feb 2026</strong>
                  <span>10:30 WIB</span>
               </div>
            </div>
         </motion.header>

         {/* STATS */}
         <div className="gdash__stats">
            {stats.map((s, i) => (
               <motion.div key={i} variants={itemVariants}>
                  <Card className="gdash__statCard">
                     <div className="gdash__statTop">
                        <div className="gdash__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <span className="gdash__statLabel">{s.label}</span>
                     </div>
                     <div className="gdash__statMain">
                        <h3>{s.value} <span>{s.label === "Order Menunggu Proses" ? "Order" : "item"}</span></h3>
                        <p className="gdash__statFooter" style={{ color: s.color }}>{s.sub}</p>
                     </div>
                     {s.link && <a href="#" className="gdash__link">{s.link}</a>}
                  </Card>
               </motion.div>
            ))}
         </div>

         {/* CHARTS */}
         <div className="gdash__chartsGrid">
            <motion.div className="gdash__card" variants={itemVariants}>
               <div className="gdash__cardHead">
                  <h3>Grafik Pergerakan Stok</h3>
                  <select className="moAdmin__select"><option>7 Hari Terakhir</option></select>
               </div>
               <div className="chart-wrapper-main" style={{ height: '220px', position: 'relative', marginTop: '10px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                     <defs>
                        <linearGradient id="gradMasuk" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#52c41a" stopOpacity="0.2" />
                           <stop offset="100%" stopColor="#52c41a" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#fa8c16" stopOpacity="0.15" />
                           <stop offset="100%" stopColor="#fa8c16" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradTransfer" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#1890ff" stopOpacity="0.1" />
                           <stop offset="100%" stopColor="#1890ff" stopOpacity="0" />
                        </linearGradient>
                     </defs>

                     {/* Grid Lines */}
                     {[0, 50, 100, 150, 200].map(y => (
                        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                     ))}

                     {/* Masuk (Green) */}
                     <motion.path 
                        d="M0,150 C100,120 150,140 200,130 C250,120 350,80 400,100 C450,110 550,70 600,90 C650,100 750,85 800,95 L800,200 L0,200 Z" 
                        fill="url(#gradMasuk)"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                     />
                     <motion.path 
                        d="M0,150 C100,120 150,140 200,130 C250,120 350,80 400,100 C450,110 550,70 600,90 C650,100 750,85 800,95" 
                        fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" 
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                     />

                     {/* Keluar (Orange) */}
                     <motion.path 
                        d="M0,180 C100,160 150,165 200,155 C250,145 350,130 400,140 C450,150 550,125 600,145 C650,155 750,140 800,135 L800,200 L0,200 Z" 
                        fill="url(#gradKeluar)"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 1 }}
                     />
                     <motion.path 
                        d="M0,180 C100,160 150,165 200,155 C250,145 350,130 400,140 C450,150 550,125 600,145 C650,155 750,140 800,135" 
                        fill="none" stroke="#fa8c16" strokeWidth="3" strokeLinecap="round" 
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
                     />

                     {/* Transfer (Blue) */}
                     <motion.path 
                        d="M0,195 C100,185 150,190 200,180 C250,175 350,165 400,175 C450,180 550,165 600,180 C650,185 750,175 800,170 L800,200 L0,200 Z" 
                        fill="url(#gradTransfer)"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
                     />
                     <motion.path 
                        d="M0,195 C100,185 150,190 200,180 C250,175 350,165 400,175 C450,180 550,165 600,180 C650,185 750,175 800,170" 
                        fill="none" stroke="#1890ff" strokeWidth="3" strokeLinecap="round" 
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 1.5, ease: "easeInOut" }}
                     />
                  </svg>
               </div>
               <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '11px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#52c41a' }}></span> Masuk</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#fa8c16' }}></span> Keluar</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#1890ff' }}></span> Transfer</div>
               </div>
            </motion.div>

            <motion.div className="gdash__card" variants={itemVariants}>
               <div className="gdash__cardHead">
                  <h3>Status Stok</h3>
                  <button className="btn-text">Lihat Semua</button>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '10px 0' }}>
                  <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                     <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                        <motion.circle 
                           cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="3.5" strokeLinecap="round"
                           strokeDasharray="75 100" 
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <motion.circle 
                           cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="3.5" strokeLinecap="round"
                           strokeDasharray="16 100" strokeDashoffset="-75" 
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
                        />
                        <motion.circle 
                           cx="18" cy="18" r="16" fill="none" stroke="#ff4d4f" strokeWidth="3.5" strokeLinecap="round"
                           strokeDasharray="5 100" strokeDashoffset="-91" 
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                        />
                        <motion.circle 
                           cx="18" cy="18" r="16" fill="none" stroke="#722ed1" strokeWidth="3.5" strokeLinecap="round"
                           strokeDasharray="4 100" strokeDashoffset="-96" 
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                        />
                     </svg>
                     <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.span 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                           style={{ fontSize: '11px', color: '#888' }}
                        >Total</motion.span>
                        <motion.strong 
                           initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}
                           style={{ fontSize: '22px', fontWeight: 800 }}
                        >3.245</motion.strong>
                        <motion.span 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                           style={{ fontSize: '10px', color: '#888' }}
                        >Produk</motion.span>
                     </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                     {[
                        { label: "Aman", val: "2.450", pct: "75.5%", color: "#52c41a" },
                        { label: "Stok Menipis", val: "520", pct: "16.0%", color: "#fa8c16" },
                        { label: "Stok Habis", val: "180", pct: "5.5%", color: "#ff4d4f" },
                        { label: "Lewat Minimum", val: "95", pct: "3.0%", color: "#722ed1" },
                     ].map((h, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 1 + i * 0.1 }}
                           style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}
                        >
                           <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: h.color, marginRight: '12px', boxShadow: `0 0 10px ${h.color}40` }}></span>
                           <span style={{ flex: 1, color: '#666', fontWeight: 500 }}>{h.label}</span>
                           <span style={{ fontSize: '11px', fontWeight: 700 }}>{h.val} <span style={{ color: '#aaa', fontWeight: 400, marginLeft: '4px' }}>{h.pct}</span></span>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </motion.div>
         </div>

         {/* DATA GRID */}
         <div className="gdash__dataGrid">
            <motion.div className="gdash__card" variants={itemVariants}>
               <div className="gdash__cardHead"><h3>Order Masuk Terbaru</h3><button className="btn-text">Lihat Semua</button></div>
               <div style={{ overflowX: 'auto' }}>
                  <table className="gdash__table">
                     <thead>
                        <tr>
                           <th>ID Order</th>
                           <th>Dari</th>
                           <th>Tanggal</th>
                           <th>Total Item</th>
                           <th>Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        {recentOrders.map((o, i) => (
                           <motion.tr 
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + i * 0.05 }}
                           >
                              <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{o.id}</td>
                              <td>{o.from}</td>
                              <td style={{ fontSize: '12px', color: '#888' }}>{o.date}</td>
                              <td style={{ fontWeight: 600 }}>{o.items} item</td>
                              <td>
                                 <span className={`rqAdmin__pill ${o.status === 'Selesai' ? 'rqAdmin__pill--approved' : o.status === 'Proses' ? 'rqAdmin__pill--ship' : 'rqAdmin__pill--pending'}`}>
                                    ● {o.status}
                                 </span>
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>

            <motion.div className="gdash__card" variants={itemVariants}>
               <div className="gdash__cardHead"><h3>Aktivitas Hari Ini</h3><button className="btn-text">Lihat Semua</button></div>
               <div className="gdash__timeline">
                  {activities.map((a, i) => (
                     <motion.div 
                        key={i} 
                        className="gdash__timeItem"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                     >
                        <span className="gdash__time">{a.time}</span>
                        <div className="gdash__timePoint" style={{ '--color': a.color }}></div>
                        <div className="gdash__timeContent">
                           <p className="gdash__timeTitle">{a.title}</p>
                           <p className="gdash__timeSub">{a.sub}</p>
                        </div>
                        <span style={{ fontSize: '10px', color: a.color, fontWeight: 700, padding: '4px 10px', background: `${a.color}15`, borderRadius: '20px', height: 'fit-content' }}>{a.tag}</span>
                     </motion.div>
                  ))}
               </div>
            </motion.div>

            <div className="gdash__alerts">
               {[
                  { label: "Stok Menipis", val: "15", sub: "Produk", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
                  { label: "Stok Habis", val: "8", sub: "Produk", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
                  { label: "Order Terlambat", val: "2", sub: "Order", icon: "🕒", color: "#722ed1", bg: "#f9f0ff" },
               ].map((a, i) => (
                  <motion.div 
                     key={i} 
                     className="gdash__alertCard"
                     variants={itemVariants}
                     whileHover={{ x: 5, backgroundColor: 'var(--bg-2)' }}
                  >
                     <div className="gdash__alertIcon" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                     <div className="gdash__alertMain">
                        <p className="gdash__alertTitle">{a.label}</p>
                        <h4 className="gdash__alertValue">{a.val} <span style={{ fontSize: '12px', fontWeight: 500 }}>{a.sub}</span></h4>
                        <a href="#" style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Lihat daftar ➔</a>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* QUICK ACTIONS */}
         <motion.h3 className="gdash__actionsTitle" variants={itemVariants}>Aksi Cepat</motion.h3>
         <div className="gdash__actionsGrid">
            {quickActions.map((a, i) => (
               <motion.button 
                  key={i} 
                  className="gdash__actionBtn"
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
                  whileTap={{ scale: 0.95 }}
               >
                  <span style={{ fontSize: '20px', color: a.color }}>{a.icon}</span>
                  {a.label}
               </motion.button>
            ))}
         </div>
      </motion.div>
   );
}
