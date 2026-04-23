import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./GudangDashboard.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function GudangDashboard() {
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
    <div className="gdash">
      {/* HEADER */}
      <header className="gdash__head">
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
      </header>

      {/* STATS */}
      <div className="gdash__stats">
        {stats.map((s, i) => (
          <Card key={i} className="gdash__statCard">
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
        ))}
      </div>

      {/* CHARTS */}
      <div className="gdash__chartsGrid">
        <div className="gdash__card">
           <div className="gdash__cardHead">
              <h3>Grafik Pergerakan Stok</h3>
              <select className="moAdmin__select"><option>7 Hari Terakhir</option></select>
           </div>
           <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '0 10px' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 200">
                <path d="M0,150 L100,130 L200,140 L300,100 L400,130 L500,110 L600,140 L700,120 L800,110" fill="none" stroke="#52c41a" strokeWidth="3" />
                <path d="M0,180 L100,160 L200,170 L300,150 L400,170 L500,160 L600,180 L700,160 L800,150" fill="none" stroke="#fa8c16" strokeWidth="3" />
                <path d="M0,195 L100,185 L200,190 L300,175 L400,190 L500,185 L600,195 L700,185 L800,175" fill="none" stroke="#1890ff" strokeWidth="3" />
             </svg>
           </div>
           <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '11px', fontWeight: 600 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#52c41a' }}></span> Masuk</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#fa8c16' }}></span> Keluar</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#1890ff' }}></span> Transfer</div>
          </div>
        </div>

        <div className="gdash__card">
           <div className="gdash__cardHead">
              <h3>Status Stok</h3>
              <button className="btn-text">Lihat Semua</button>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                   <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                   <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="75 100" />
                   <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="16 100" strokeDashoffset="-75" />
                   <circle cx="18" cy="18" r="16" fill="none" stroke="#ff4d4f" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="-91" />
                   <circle cx="18" cy="18" r="16" fill="none" stroke="#722ed1" strokeWidth="4" strokeDasharray="4 100" strokeDashoffset="-96" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                   <span style={{ fontSize: '11px', color: '#888' }}>Total</span>
                   <strong style={{ fontSize: '18px' }}>3.245</strong>
                   <span style={{ fontSize: '10px', color: '#888' }}>Produk</span>
                </div>
             </div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: "Aman", val: "2.450", pct: "75.5%", color: "#52c41a" },
                  { label: "Stok Menipis", val: "520", pct: "16.0%", color: "#fa8c16" },
                  { label: "Stok Habis", val: "180", pct: "5.5%", color: "#ff4d4f" },
                  { label: "Lewat Minimum", val: "95", pct: "3.0%", color: "#722ed1" },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                     <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.color, marginRight: '10px' }}></span>
                     <span style={{ flex: 1, color: '#666' }}>{h.label}</span>
                     <span style={{ fontSize: '11px', fontWeight: 600 }}>{h.val} ({h.pct})</span>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="gdash__dataGrid">
        <div className="gdash__card">
           <div className="gdash__cardHead"><h3>Order Masuk Terbaru</h3><button className="btn-text">Lihat Semua</button></div>
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
                    <tr key={i}>
                       <td style={{ fontWeight: 700 }}>{o.id}</td>
                       <td>{o.from}</td>
                       <td style={{ fontSize: '12px', color: '#888' }}>{o.date}</td>
                       <td>{o.items} item</td>
                       <td>
                          <span className={`rqAdmin__pill ${o.status === 'Selesai' ? 'rqAdmin__pill--approved' : o.status === 'Proses' ? 'rqAdmin__pill--ship' : 'rqAdmin__pill--pending'}`}>
                            ● {o.status}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        <div className="gdash__card">
           <div className="gdash__cardHead"><h3>Aktivitas Hari Ini</h3><button className="btn-text">Lihat Semua</button></div>
           <div className="gdash__timeline">
              {activities.map((a, i) => (
                 <div key={i} className="gdash__timeItem">
                    <span className="gdash__time">{a.time}</span>
                    <div className="gdash__timePoint" style={{ '--color': a.color }}></div>
                    <div className="gdash__timeContent">
                       <p className="gdash__timeTitle">{a.title}</p>
                       <p className="gdash__timeSub">{a.sub}</p>
                    </div>
                    <span style={{ fontSize: '10px', color: a.color, fontWeight: 700, padding: '2px 8px', background: `${a.color}15`, borderRadius: '20px', height: 'fit-content' }}>{a.tag}</span>
                 </div>
              ))}
           </div>
        </div>

        <div className="gdash__alerts">
           {[
             { label: "Stok Menipis", val: "15", sub: "Produk", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
             { label: "Stok Habis", val: "8", sub: "Produk", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
             { label: "Order Terlambat", val: "2", sub: "Order", icon: "🕒", color: "#722ed1", bg: "#f9f0ff" },
           ].map((a, i) => (
             <div key={i} className="gdash__alertCard">
                <div className="gdash__alertIcon" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                <div className="gdash__alertMain">
                   <p className="gdash__alertTitle">{a.label}</p>
                   <h4 className="gdash__alertValue">{a.val} <span style={{ fontSize: '12px', fontWeight: 500 }}>{a.sub}</span></h4>
                   <a href="#" style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Lihat daftar ></a>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <h3 className="gdash__actionsTitle">Aksi Cepat</h3>
      <div className="gdash__actionsGrid">
        {quickActions.map((a, i) => (
           <button key={i} className="gdash__actionBtn">
              <span style={{ fontSize: '18px', color: a.color }}>{a.icon}</span>
              {a.label}
           </button>
        ))}
      </div>
    </div>
  );
}
