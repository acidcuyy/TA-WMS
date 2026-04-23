import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./LaporanStokAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function LaporanStok() {
  const [timeRange, setTimeRange] = useState("Harian");

  const stats = [
    { label: "Total Stok Saat Ini", value: "18.560", hint: "Semua gudang & toko", icon: "🏠", color: "#e4915a", bg: "#fff8f3" },
    { label: "Nilai Inventory", value: "Rp 275.450.000", hint: "Total nilai stok saat ini", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
    { label: "Stok Masuk (Periode)", value: "2.860", hint: "↑ 12.5% dari periode lalu", icon: "⬇️", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Stok Keluar (Periode)", value: "2.180", hint: "↑ 8.3% dari periode lalu", icon: "⬆️", color: "#e4915a", bg: "#fff8f3" },
    { label: "Item Low Stock", value: "24", hint: "Perlu restock", icon: "⚠️", color: "#ff4d4f", bg: "#fff1f0" },
  ];

  const locations = [
    { name: "Gudang Pusat", items: "8.450", value: 128350000, status: "Aman", statusColor: "#52c41a", icon: "🏢", bg: "#f0f5ff" },
    { name: "Gudang Barat", items: "3.120", value: 45280000, status: "Aman", statusColor: "#52c41a", icon: "🏠", bg: "#f0f5ff" },
    { name: "Gudang Timur", items: "2.980", value: 38760000, status: "Low Stock", statusColor: "#fa8c16", icon: "📍", bg: "#fff7e6" },
    { name: "Toko A", items: "1.850", value: 28150000, status: "Low Stock", statusColor: "#fa8c16", icon: "🛒", bg: "#fff7e6" },
    { name: "Toko B", items: "1.240", value: 18910000, status: "Critical", statusColor: "#ff4d4f", icon: "🏪", bg: "#fff1f0" },
  ];

  const alerts = [
    { title: "Kran Air Stainless 1/2\"", sub: "Toko C", val: "0 item", status: "Habis", color: "#ff4d4f", bg: "#fff1f0" },
    { title: "Kabel NYM 3x1.5mm", sub: "Gudang Barat", val: "10 item", status: "Low Stock", color: "#fa8c16", bg: "#fff7e6" },
    { title: "Stop Kontak Arde", sub: "Toko B", val: "7 item", status: "Low Stock", color: "#fa8c16", bg: "#fff7e6" },
  ];

  const products = [
    { name: "Lampu LED 12W Putih", sku: "LED-12W-PUTIH", cat: "Elektronik", loc: "Gudang Pusat", start: 120, in: 80, out: 50, end: 150, status: "Aman" },
    { name: "Kabel NYM 3x1.5mm", sku: "KBL-NYM-315", cat: "Elektronik", loc: "Gudang Barat", start: 15, in: 20, out: 25, end: 10, status: "Low Stock" },
    { name: "Cat Tembok 5kg Putih", sku: "CTT-SKG-PUTIH", cat: "Bahan Bangunan", loc: "Gudang Timur", start: 30, in: 10, out: 35, end: 5, status: "Critical" },
    { name: "Kran Air Stainless 1/2\"", sku: "KRN-SS-12", cat: "Plumbing", loc: "Toko A", start: 8, in: 12, out: 10, end: 10, status: "Aman" },
    { name: "Stop Kontak Arde", sku: "SK-ARDE", cat: "Elektronik", loc: "Toko B", start: 20, in: 5, out: 18, end: 7, status: "Low Stock" },
  ];

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="lsAdmin__head">
        <div>
          <h1 className="lsAdmin__title">Laporan Stok</h1>
          <p className="lsAdmin__subtitle">
            Monitoring stok barang, pergerakan, dan analisis inventori.
          </p>
        </div>
        <div className="lsAdmin__headRight">
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
      <div className="lsAdmin__stats">
        {stats.map((s, i) => (
          <Card key={i} className="lsAdmin__statCard">
            <div className="lsAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="lsAdmin__statContent">
              <p className="lsAdmin__statLabel">{s.label}</p>
              <h3 className="lsAdmin__statValue">{s.value}</h3>
              <p className="lsAdmin__statHint">
                {s.hint.includes("↑") ? (
                  <><b style={{ color: s.color === "#ff4d4f" ? "#ff4d4f" : "#52c41a" }}>{s.hint.split(" ")[0]} {s.hint.split(" ")[1]}</b> {s.hint.split(" ").slice(2).join(" ")}</>
                ) : s.hint}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="lsAdmin__chartsGrid">
        <div className="lsAdmin__card">
          <div className="lsAdmin__cardHead">
            <h3>Pergerakan Stok</h3>
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
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '0 10px' }}>
             {/* Simple Line Chart Simulation */}
             <svg width="100%" height="100%" viewBox="0 0 800 200">
                <path d="M0,150 L100,130 L200,160 L300,110 L400,140 L500,120 L600,150 L700,130 L800,140" fill="none" stroke="#52c41a" strokeWidth="3" />
                <path d="M0,180 L100,170 L200,190 L300,160 L400,180 L500,170 L600,190 L700,170 L800,180" fill="none" stroke="#e4915a" strokeWidth="3" />
                <circle cx="100" cy="130" r="4" fill="#52c41a" />
                <circle cx="200" cy="160" r="4" fill="#52c41a" />
                <circle cx="300" cy="110" r="4" fill="#52c41a" />
                <circle cx="400" cy="140" r="4" fill="#52c41a" />
                <circle cx="500" cy="120" r="4" fill="#52c41a" />
                <circle cx="600" cy="150" r="4" fill="#52c41a" />
                <circle cx="700" cy="130" r="4" fill="#52c41a" />
             </svg>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '11px', fontWeight: 600 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#52c41a' }}></span> Stok Masuk</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#e4915a' }}></span> Stok Keluar</div>
          </div>
        </div>

        <div className="lsAdmin__card">
          <div className="lsAdmin__cardHead">
            <h3>Kesehatan Stok</h3>
            <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Detail</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
               <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="40 100" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#1890ff" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-40" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-65" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#ff4d4f" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-80" />
               </svg>
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Total</span>
                  <strong style={{ fontSize: '18px' }}>248</strong>
                  <span style={{ fontSize: '10px', color: '#888' }}>Produk</span>
               </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {[
                 { label: "Fast Moving", val: 98, pct: "39.5%", color: "#52c41a" },
                 { label: "Slow Moving", val: 64, pct: "25.8%", color: "#1890ff" },
                 { label: "Dead Stock", val: 30, pct: "12.1%", color: "#fa8c16" },
                 { label: "Overstock", val: 56, pct: "22.6%", color: "#ff4d4f" },
               ].map((h, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.color, marginRight: '10px' }}></span>
                    <span style={{ flex: 1, color: '#666' }}>{h.label}</span>
                    <span style={{ width: '40px', fontWeight: 600 }}>{h.val}</span>
                    <span style={{ width: '40px', textAlign: 'right', color: '#888' }}>{h.pct}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOCATIONS & ALERTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '32px' }}>
        <div className="lsAdmin__locations">
          {locations.map((loc, i) => (
            <div key={i} className="lsAdmin__locCard">
              <div className="lsAdmin__locIcon" style={{ background: loc.bg }}>{loc.icon}</div>
              <p className="lsAdmin__locName">{loc.name}</p>
              <p className="lsAdmin__locMeta">Total Item: <b>{loc.items}</b></p>
              <p className="lsAdmin__locValue">Rp {fmtIDR(loc.value)}</p>
              <p className="lsAdmin__locStatus">Status: <span style={{ color: loc.statusColor }}>● {loc.status}</span></p>
            </div>
          ))}
        </div>

        <div className="lsAdmin__card">
          <div className="lsAdmin__cardHead">
            <h3>Peringatan Stok</h3>
            <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
          </div>
          <div className="lsAdmin__alertList">
            {alerts.map((a, i) => (
              <div key={i} className="lsAdmin__alertItem">
                <div className="lsAdmin__alertIcon" style={{ background: a.bg, color: a.color }}>{a.status === "Habis" ? "🚫" : "⚠️"}</div>
                <div className="lsAdmin__alertMain">
                  <p className="lsAdmin__alertTitle">{a.title}</p>
                  <p className="lsAdmin__alertSub">{a.sub}</p>
                </div>
                <div className="lsAdmin__alertVal">{a.val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-2)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
             <span style={{ fontSize: '18px' }}>ℹ️</span>
             <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Terdapat 17 produk yang membutuhkan restock.</p>
          </div>
        </div>
      </div>

      {/* TABLE & CATEGORY ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div className="lsAdmin__tableCard">
           <div className="rqAdmin__tableHeader" style={{ justifyContent: 'space-between', padding: '20px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Rincian Laporan Stok</h3>
              <div className="moAdmin__filterGroup">
                <select className="moAdmin__select"><option>Semua Kategori</option></select>
                <select className="moAdmin__select"><option>Semua Gudang / Toko</option></select>
                <select className="moAdmin__select"><option>Semua Status</option></select>
                <div className="moAdmin__searchWrap" style={{ maxWidth: '200px' }}>
                   <span className="moAdmin__searchIcon">🔍</span>
                   <input placeholder="Cari produk..." style={{ padding: '8px 12px 8px 32px' }} />
                </div>
                <button className="btn-reset-filter">Reset</button>
              </div>
           </div>
           <div className="lsAdmin__tableWrap">
              <table className="lsAdmin__table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>SKU / Barcode</th>
                    <th>Kategori</th>
                    <th>Gudang / Toko</th>
                    <th>Stok Awal</th>
                    <th>Stok Masuk</th>
                    <th>Stok Keluar</th>
                    <th>Stok Akhir</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{p.name}</td>
                      <td className="rqAdmin__mono" style={{ fontSize: '11px', color: '#888' }}>{p.sku}</td>
                      <td><span className="mpAdmin__tag">{p.cat}</span></td>
                      <td style={{ fontWeight: 600 }}>{p.loc}</td>
                      <td>{p.start}</td>
                      <td style={{ color: '#52c41a', fontWeight: 600 }}>+{p.in}</td>
                      <td style={{ color: '#ff4d4f', fontWeight: 600 }}>-{p.out}</td>
                      <td style={{ fontWeight: 700 }}>{p.end}</td>
                      <td>
                        <span className={`lsAdmin__pill ${p.status === 'Aman' ? 'lsAdmin__pill--safe' : p.status === 'Low Stock' ? 'lsAdmin__pill--low' : 'lsAdmin__pill--out'}`}>
                          ● {p.status}
                        </span>
                      </td>
                      <td><button className="btn-icon">⋮</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 5 dari 248 data</span>
              <div className="pagination">
                 <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
                 <div className="page-controls">
                    <button disabled>⟨</button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>...</span>
                    <button>25</button>
                    <button>⟩</button>
                 </div>
              </div>
           </footer>
        </div>

        <div className="lsAdmin__card">
           <div className="lsAdmin__cardHead">
              <h3>Stok per Kategori</h3>
              <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { label: "Elektronik", pct: "42.5%", color: "#1890ff" },
                { label: "Bahan Bangunan", pct: "28.7%", color: "#e4915a" },
                { label: "Plumbing", pct: "17.9%", color: "#52c41a" },
                { label: "Perkakas", pct: "7.3%", color: "#722ed1" },
                { label: "Lainnya", pct: "3.6%", color: "#888" },
              ].map((c, i) => (
                <div key={i}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{c.label}</span>
                      <span style={{ color: '#888' }}>{c.pct}</span>
                   </div>
                   <div style={{ height: '6px', background: 'var(--bg-2)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: c.pct, background: c.color }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
