import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeWarehouseStock, subscribeRequests, subscribeRestockToAdmin } from "../../../services/wmsApi";
import "./GudangDashboard.css";

export default function GudangDashboard() {
   const navigate = useNavigate();
   const [isLoaded, setIsLoaded] = useState(false);
   const [chartFilter, setChartFilter] = useState("Mingguan");
   const [allStock, setAllStock] = useState([]);
   const [allRequests, setAllRequests] = useState([]);
   const [allRestocks, setAllRestocks] = useState([]);
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
      const unsub1 = subscribeWarehouseStock((data) => setAllStock(data || []));
      const unsub2 = subscribeRequests((data) => setAllRequests(data || []));
      const unsub3 = subscribeRestockToAdmin((data) => setAllRestocks(data || []));
      
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);

      setIsLoaded(true);
      return () => {
         unsub1(); unsub2(); unsub3();
         clearInterval(timer);
      };
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

   const gudangStock = useMemo(() => allStock.filter(stock => !stock.branchId || stock.branchId === "BRC-001"), [allStock]);

   const totalStok = gudangStock.reduce((acc, item) => acc + item.qty, 0);
   const barangMasuk = allRestocks.length; 
   const barangKeluar = allRequests.filter(r => r.status === "Selesai" || r.status === "Diterima Toko").length;
   const orderMenunggu = allRequests.filter(r => r.status === "Menunggu" || r.status === "Pending").length;

   const stats = [
      { label: "Total Stok", value: totalStok.toLocaleString('id-ID'), sub: "Item", icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Barang Masuk (Total)", value: barangMasuk, sub: "Transaksi", icon: "⬇️", color: "#52c41a", bg: "#f6ffed" },
      { label: "Barang Keluar (Total)", value: barangKeluar, sub: "Transaksi", icon: "⬆️", color: "#e4915a", bg: "#fff8f3" },
      { label: "Order Menunggu Proses", value: orderMenunggu, sub: "Order", icon: "🕒", color: "#fa8c16", bg: "#fff7e6", link: "Lihat detail >" },
   ];

   const recentOrders = useMemo(() => {
      return allRequests.slice(0, 5).map(r => ({
         id: r.id,
         from: r.fromName || "Toko",
         date: new Date(r.createdAt || new Date()).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}),
         items: r.items ? r.items.reduce((acc, it) => acc + (it.qty || 0), 0) : 0,
         status: r.status
      }));
   }, [allRequests]);

   const activities = useMemo(() => {
      let combined = [
         ...allRequests.map(r => ({ 
            time: new Date(r.createdAt || new Date()).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}), 
            dateObj: new Date(r.createdAt || new Date()), 
            title: `Order dari ${r.fromName || "Toko"}`, 
            sub: r.id, 
            tag: `${r.items?.length || 0} jenis barang`, 
            color: "#e4915a" 
         })),
         ...allRestocks.map(r => ({ 
            time: new Date(r.createdAt || new Date()).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}), 
            dateObj: new Date(r.createdAt || new Date()), 
            title: `Request Restock`, 
            sub: r.id, 
            tag: `${r.items?.length || 0} jenis barang`, 
            color: "#52c41a" 
         }))
      ];
      return combined.sort((a,b) => b.dateObj - a.dateObj).slice(0, 5);
   }, [allRequests, allRestocks]);

   const chartData = useMemo(() => {
       const pts = chartFilter === "Mingguan" ? 7 : chartFilter === "Bulanan" ? 30 : 12;
       let masuk = new Array(pts).fill(0);
       let keluar = new Array(pts).fill(0);
       const now = new Date();
       
       allRestocks.forEach(r => {
           const d = new Date(r.createdAt || new Date());
           let idx = 0;
           if(chartFilter === "Tahunan") {
               idx = 11 - (now.getMonth() - d.getMonth() + 12 * (now.getFullYear() - d.getFullYear()));
           } else {
               const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
               idx = (pts - 1) - diffDays;
           }
           if (idx >= 0 && idx < pts) masuk[idx] += r.items ? r.items.length : 1;
       });
       
       allRequests.forEach(r => {
           const d = new Date(r.createdAt || new Date());
           let idx = 0;
           if(chartFilter === "Tahunan") {
               idx = 11 - (now.getMonth() - d.getMonth() + 12 * (now.getFullYear() - d.getFullYear()));
           } else {
               const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
               idx = (pts - 1) - diffDays;
           }
           if (idx >= 0 && idx < pts) keluar[idx] += r.items ? r.items.length : 1;
       });
       return { masuk, keluar, transfer: new Array(pts).fill(0) };
   }, [allRequests, allRestocks, chartFilter]);

   const generatePath = (data, filled = false) => {
       if(!data || data.length === 0) return filled ? "M0,195 L800,195 Z" : "M0,195 L800,195";
       const maxVal = Math.max(...data, 5);
       const step = 800 / (data.length <= 1 ? 1 : data.length - 1);
       let d = "";
       for(let i=0; i<data.length; i++) {
           const x = i * step;
           const y = 195 - (data[i] / maxVal * 140);
           if(i===0) d += `M${x},${y}`;
           else d += ` L${x},${y}`;
       }
       if(filled) d += ` L800,200 L0,200 Z`;
       return d;
   };

   const stokAman = gudangStock.filter(s => s.qty > 50).length;
   const stokMenipis = gudangStock.filter(s => s.qty <= 50 && s.qty > 0).length;
   const stokHabis = gudangStock.filter(s => s.qty === 0).length;
   const totalProduk = gudangStock.length;

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
                  <strong>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                  <span>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
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
                     {s.link && <a href="#" onClick={(e) => { e.preventDefault(); navigate('/gudang/requests'); }} className="gdash__link">{s.link}</a>}
                  </Card>
               </motion.div>
            ))}
         </div>

         {/* CHARTS */}
         <div className="gdash__chartsGrid">
            <motion.div className="gdash__card" variants={itemVariants}>
               <div className="gdash__cardHead">
                  <h3>Grafik Pergerakan Stok</h3>
                  <select className="moAdmin__select" value={chartFilter} onChange={(e) => setChartFilter(e.target.value)}>
                     <option value="Mingguan">Mingguan</option>
                     <option value="Bulanan">Bulanan</option>
                     <option value="Tahunan">Tahunan</option>
                  </select>
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
                        d={generatePath(chartData.masuk, true)} 
                        fill="url(#gradMasuk)"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                     />
                     <motion.path 
                        d={generatePath(chartData.masuk, false)} 
                        fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                     />

                     {/* Keluar (Orange) */}
                     <motion.path 
                        d={generatePath(chartData.keluar, true)} 
                        fill="url(#gradKeluar)"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 1 }}
                     />
                     <motion.path 
                        d={generatePath(chartData.keluar, false)} 
                        fill="none" stroke="#fa8c16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
                     />

                     {/* Transfer (Blue) */}
                     <motion.path 
                        d={generatePath(chartData.transfer, true)} 
                        fill="url(#gradTransfer)"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
                     />
                     <motion.path 
                        d={generatePath(chartData.transfer, false)} 
                        fill="none" stroke="#1890ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
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
                  <button className="btn-text" onClick={() => navigate('/gudang/stok')}>Lihat Semua</button>
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
                        >{totalProduk}</motion.strong>
                        <motion.span 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                           style={{ fontSize: '10px', color: '#888' }}
                        >Produk</motion.span>
                     </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                     {[
                        { label: "Aman", val: stokAman, pct: totalProduk ? `${((stokAman/totalProduk)*100).toFixed(1)}%` : "0%", color: "#52c41a" },
                        { label: "Stok Menipis", val: stokMenipis, pct: totalProduk ? `${((stokMenipis/totalProduk)*100).toFixed(1)}%` : "0%", color: "#fa8c16" },
                        { label: "Stok Habis", val: stokHabis, pct: totalProduk ? `${((stokHabis/totalProduk)*100).toFixed(1)}%` : "0%", color: "#ff4d4f" },
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
               <div className="gdash__cardHead"><h3>Order Masuk Terbaru</h3><button className="btn-text" onClick={() => navigate('/gudang/requests')}>Lihat Semua</button></div>
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
                        {recentOrders.length === 0 ? (
                           <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Belum ada order masuk</td>
                           </tr>
                         ) : (
                           recentOrders.map((o, i) => (
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
                           ))
                         )}
                     </tbody>
                  </table>
               </div>
            </motion.div>

            <motion.div className="gdash__card" variants={itemVariants}>
               <div className="gdash__cardHead"><h3>Aktivitas Hari Ini</h3><button className="btn-text" onClick={() => navigate('/gudang/requests')}>Lihat Semua</button></div>
               <div className="gdash__timeline">
                  {activities.length === 0 ? (
                     <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Tidak ada aktivitas terbaru</div>
                  ) : (
                     activities.map((a, i) => (
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
                           <span style={{ fontSize: '10px', color: a.color, fontWeight: 700, padding: '4px 10px', background: `${a.color}15`, borderRadius: '20px', height: 'fit-content', whiteSpace: 'nowrap' }}>{a.tag}</span>
                        </motion.div>
                     ))
                  )}
               </div>
            </motion.div>

            <div className="gdash__alerts">
               {[
                  { label: "Stok Menipis", val: stokMenipis, sub: "Produk", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
                  { label: "Stok Habis", val: stokHabis, sub: "Produk", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
                  { label: "Order Pending", val: orderMenunggu, sub: "Order", icon: "🕒", color: "#722ed1", bg: "#f9f0ff" },
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
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/gudang/stok'); }} style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Lihat daftar ➔</a>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </motion.div>
   );
}
