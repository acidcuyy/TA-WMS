import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./LaporanOrderAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function LaporanOrder() {
  const [activeTab, setActiveTab] = useState("Semua Order");
  const [timeRange, setTimeRange] = useState("Harian");

  const stats = [
    { label: "Total Order", value: "128", hint: "↑ 12.5% dari periode lalu", icon: "📊", color: "#e4915a", bg: "#fff8f3" },
    { label: "Sales Order", value: "72", hint: "↑ 10.2% dari periode lalu", icon: "🛒", color: "#52c41a", bg: "#f6ffed" },
    { label: "Purchase Order", value: "36", hint: "↓ 5.1% dari periode lalu", icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Transfer Order", value: "20", hint: "↑ 8.7% dari periode lalu", icon: "⇄", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Total Nilai Order", value: "Rp 875.450.000", hint: "↑ 13.4% dari periode lalu", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
  ];

  const orders = [
    { id: "SO-2026-00248", type: "Sales Order", date: "03 Feb 2026, 09:15", from: "Gudang Pusat", fromLoc: "Jakarta", to: "Toko A", toLoc: "Jakarta", items: 15, value: 3250000, status: "Pending", ship: "Belum dikirim", icon: "🛒", iconColor: "#52c41a" },
    { id: "SO-2026-00247", type: "Sales Order", date: "03 Feb 2026, 08:40", from: "Gudang Pusat", fromLoc: "Jakarta", to: "Toko B", toLoc: "Surabaya", items: 8, value: 1750000, status: "Processing", ship: "Sedang diproses", icon: "🛒", iconColor: "#52c41a" },
    { id: "PO-2026-00078", type: "Purchase Order", date: "02 Feb 2026, 14:30", from: "Gudang Pusat", fromLoc: "Jakarta", to: "Supplier Jaya Abadi", toLoc: "Bandung", items: 23, value: 12500000, status: "Processing", ship: "Partial", icon: "📦", iconColor: "#1890ff" },
    { id: "TR-2026-00056", type: "Transfer Order", date: "02 Feb 2026, 11:10", from: "Gudang Pusat", fromLoc: "Jakarta", to: "Gudang Timur", toLoc: "Surabaya", items: 12, value: 980000, status: "Shipped", ship: "Dalam pengiriman Resi: JT123456789", icon: "⇄", iconColor: "#fa8c16" },
    { id: "SO-2026-00246", type: "Sales Order", date: "01 Feb 2026, 17:05", from: "Gudang Barat", fromLoc: "Bandung", to: "Toko C", toLoc: "Semarang", items: 5, value: 650000, status: "Completed", ship: "Selesai 03 Feb 2026", icon: "🛒", iconColor: "#52c41a" },
    { id: "PO-2026-00077", type: "Purchase Order", date: "01 Feb 2026, 10:25", from: "Gudang Timur", fromLoc: "Surabaya", to: "Mitra Elektronik", toLoc: "Jakarta", items: 18, value: 8250000, status: "Completed", ship: "Selesai 02 Feb 2026", icon: "📦", iconColor: "#1890ff" },
    { id: "SO-2026-00245", type: "Sales Order", date: "31 Jan 2026, 15:20", from: "Gudang Pusat", fromLoc: "Jakarta", to: "Toko D", toLoc: "Medan", items: 9, value: 2150000, status: "Cancelled", ship: "Dibatalkan 31 Jan 2026", icon: "🛒", iconColor: "#ff4d4f" },
  ];

  const statusSummary = [
    { label: "Pending", val: 28, pct: "21.9%", color: "#fa8c16" },
    { label: "Processing", val: 42, pct: "32.8%", color: "#1890ff" },
    { label: "Shipped", val: 26, pct: "20.3%", color: "#52c41a" },
    { label: "Completed", val: 22, pct: "17.2%", color: "#52c41a" },
    { label: "Cancelled", val: 10, pct: "7.8%", color: "#ff4d4f" },
  ];

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="loAdmin__head">
        <div>
          <h1 className="loAdmin__title">Laporan Order</h1>
          <p className="loAdmin__subtitle">
            Ringkasan performa order penjualan, pembelian, dan transfer dalam periode tertentu.
          </p>
        </div>
        <div className="loAdmin__headRight">
          <span className="mtAdmin__badge mtAdmin__badge--live">
            <span className="mtAdmin__dot" />
            Live Monitoring
          </span>
          <div className="date-filter" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', marginLeft: '12px' }}>
            01 Feb 2026 - 07 Feb 2026 📅
          </div>
          <button className="btn-export" style={{ marginLeft: '12px', height: '40px' }}><span>📥</span> Export <span className="chevron">⌄</span></button>
        </div>
      </header>

      {/* STATS */}
      <div className="loAdmin__stats">
        {stats.map((s, i) => (
          <Card key={i} className="loAdmin__statCard">
            <div className="loAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="loAdmin__statContent">
              <p className="loAdmin__statLabel">{s.label}</p>
              <h3 className="loAdmin__statValue">{s.value}</h3>
              <p className="loAdmin__statHint">
                <b className={s.hint.includes("↓") ? "down" : ""}>{s.hint.split(" ")[0]} {s.hint.split(" ")[1]}</b> {s.hint.split(" ").slice(2).join(" ")}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="loAdmin__chartsGrid">
        <div className="loAdmin__card">
          <div className="loAdmin__cardHead">
            <h3>Tren Order (Jumlah Order)</h3>
            <div className="mpAdmin__tabs" style={{ background: 'var(--bg-2)', padding: '4px', borderRadius: '8px' }}>
              {["Harian", "Mingguan", "Bulanan"].map(t => (
                <button 
                  key={t} 
                  style={{ 
                    padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, 
                    background: timeRange === t ? 'var(--bg)' : 'transparent', 
                    color: timeRange === t ? 'var(--primary)' : 'var(--muted)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setTimeRange(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '0 10px' }}>
             <svg width="100%" height="100%" viewBox="0 0 800 200">
                <path d="M0,150 L100,130 L200,140 L300,100 L400,130 L500,110 L600,140 L700,120 L800,110" fill="none" stroke="#52c41a" strokeWidth="3" />
                <path d="M0,180 L100,160 L200,170 L300,150 L400,170 L500,160 L600,180 L700,160 L800,150" fill="none" stroke="#fa8c16" strokeWidth="3" />
                <path d="M0,195 L100,185 L200,190 L300,175 L400,190 L500,185 L600,195 L700,185 L800,175" fill="none" stroke="#1890ff" strokeWidth="3" />
             </svg>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '11px', fontWeight: 600 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#52c41a' }}></span> Sales Order</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#fa8c16' }}></span> Purchase Order</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#1890ff' }}></span> Transfer Order</div>
          </div>
        </div>

        <div className="loAdmin__card">
          <div className="loAdmin__cardHead">
            <h3>Distribusi Order (Berdasarkan Tipe)</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
               <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="56 100" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="28 100" strokeDashoffset="-56" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#1890ff" strokeWidth="4" strokeDasharray="16 100" strokeDashoffset="-84" />
               </svg>
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Total</span>
                  <strong style={{ fontSize: '18px' }}>128</strong>
                  <span style={{ fontSize: '10px', color: '#888' }}>Order</span>
               </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {[
                 { label: "Sales Order", val: 72, pct: "56.3%", color: "#52c41a" },
                 { label: "Purchase Order", val: 36, pct: "28.1%", color: "#fa8c16" },
                 { label: "Transfer Order", val: 20, pct: "15.6%", color: "#1890ff" },
               ].map((h, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.color, marginRight: '10px' }}></span>
                    <span style={{ flex: 1, color: '#666' }}>{h.label}</span>
                    <span style={{ width: '40px', fontWeight: 600 }}>{h.val}</span>
                    <span style={{ width: '40px', textAlign: 'right', color: '#888' }}>({h.pct})</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="loAdmin__card">
          <div className="loAdmin__cardHead">
            <h3>Status Order</h3>
            <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
          </div>
          <div className="loAdmin__sideList">
            {statusSummary.map((s, i) => (
              <div key={i} className="loAdmin__sideItem">
                <div className="loAdmin__sideLabelRow">
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></span> {s.label}
                  </span>
                  <span style={{ color: '#888' }}>{s.val} ({s.pct})</span>
                </div>
                <div className="loAdmin__progress">
                  <div className="loAdmin__progressBar" style={{ width: s.pct, background: s.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
             <span>Total</span>
             <span>128 (100%)</span>
          </div>
        </div>
      </div>

      {/* TABLE & SIDE ROW */}
      <div className="loAdmin__tableGrid">
        <div className="loAdmin__tableCard">
          <div className="loAdmin__tabsHeader">
             <div className="moAdmin__tabs">
                {["Semua Order", "Sales Order", "Purchase Order", "Transfer Order"].map(tab => (
                   <div 
                     key={tab} 
                     className={`moAdmin__tab ${activeTab === tab ? 'active' : ''}`}
                     onClick={() => setActiveTab(tab)}
                   >
                     {tab === "Semua Order" && "📊 "}
                     {tab === "Sales Order" && "🛒 "}
                     {tab === "Purchase Order" && "📦 "}
                     {tab === "Transfer Order" && "⇄ "}
                     {tab}
                   </div>
                ))}
             </div>
          </div>
          <div className="loAdmin__tableFilters">
             <select className="moAdmin__select"><option>Semua Tipe Order</option></select>
             <select className="moAdmin__select"><option>Semua Status</option></select>
             <select className="moAdmin__select"><option>Semua Gudang / Toko</option></select>
             <div className="date-filter" style={{ border: '1px solid var(--border)', background: 'var(--bg)', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>Pilih Rentang Tanggal 📅</div>
             <div className="moAdmin__searchWrap" style={{ maxWidth: '200px' }}>
                <span className="moAdmin__searchIcon">🔍</span>
                <input placeholder="Cari no. order, toko, supplier..." style={{ padding: '8px 12px 8px 32px' }} />
             </div>
             <button className="btn-reset-filter">Reset</button>
          </div>
          <div className="loAdmin__tableWrap">
            <table className="loAdmin__table">
              <thead>
                <tr>
                  <th>ID Order</th>
                  <th>Tipe Order</th>
                  <th>Tanggal Order</th>
                  <th>Dari</th>
                  <th>Ke</th>
                  <th>Total Item</th>
                  <th>Total Nilai</th>
                  <th>Status</th>
                  <th>Pengiriman</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <p className="loAdmin__id">{o.id}</p>
                      <p className="loAdmin__type">{o.type}</p>
                    </td>
                    <td>
                      <div className="loAdmin__sideIcon" style={{ color: o.iconColor }}>{o.icon}</div>
                    </td>
                    <td>{o.date}</td>
                    <td>
                      <p style={{ fontWeight: 700 }}>{o.from}</p>
                      <p style={{ fontSize: '11px', color: '#888' }}>{o.fromLoc}</p>
                    </td>
                    <td>
                      <p style={{ fontWeight: 700 }}>{o.to}</p>
                      <p style={{ fontSize: '11px', color: '#888' }}>{o.toLoc}</p>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.items} item</td>
                    <td style={{ fontWeight: 700 }}>Rp {fmtIDR(o.value)}</td>
                    <td>
                       <span className={`status-pill status-pill--${o.status.toLowerCase()}`}>
                         ● {o.status}
                       </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#666' }}>{o.ship}</td>
                    <td><button className="btn-icon">👁️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 10 dari 128 data</span>
            <div className="pagination">
               <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
               <div className="page-controls">
                  <button disabled>⟨</button>
                  <button className="active">1</button>
                  <button>2</button>
                  <button>3</button>
                  <span>...</span>
                  <button>13</button>
                  <button>⟩</button>
               </div>
            </div>
          </footer>
        </div>

        <div className="loAdmin__sideCard">
           <div className="loAdmin__card">
              <div className="loAdmin__cardHead">
                 <h3>Top 5 Toko (Sales Order)</h3>
                 <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
              </div>
              <div className="loAdmin__sideList">
                 {[
                   { label: "Toko A", val: 24, pct: "85%", color: "#52c41a" },
                   { label: "Toko B", val: 18, pct: "65%", color: "#fa8c16" },
                   { label: "Toko C", val: 14, pct: "50%", color: "#1890ff" },
                   { label: "Toko D", val: 9, pct: "30%", color: "#e4915a" },
                   { label: "Toko E", val: 7, pct: "25%", color: "#888" },
                 ].map((t, i) => (
                   <div key={i} className="loAdmin__sideItem">
                      <div className="loAdmin__sideLabelRow">
                         <span style={{ fontWeight: 600 }}>🏠 {t.label}</span>
                         <span style={{ color: '#888' }}>{t.val} order</span>
                      </div>
                      <div className="loAdmin__progress">
                         <div className="loAdmin__progressBar" style={{ width: t.pct, background: t.color }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="loAdmin__card">
              <div className="loAdmin__cardHead">
                 <h3>Total Order Value (Rp)</h3>
                 <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
              </div>
              <div className="loAdmin__sideList">
                 {[
                   { label: "Sales Order", val: 245350000, color: "#52c41a" },
                   { label: "Purchase Order", val: 425600000, color: "#fa8c16" },
                   { label: "Transfer Order", val: 204500000, color: "#1890ff" },
                 ].map((v, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                       <span style={{ color: '#666' }}>{v.label}</span>
                       <span style={{ fontWeight: 700 }}>Rp {fmtIDR(v.val)}</span>
                    </div>
                 ))}
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, marginTop: '8px' }}>
                    <span>Total</span>
                    <span>Rp {fmtIDR(875450000)}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
