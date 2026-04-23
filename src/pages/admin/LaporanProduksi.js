import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./LaporanProduksiAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function LaporanProduksi() {
  const [timeRange, setTimeRange] = useState("Harian");

  const stats = [
    { label: "Total Produksi", value: "1.280", sub: "Rp 256.450.000", hint: "↑ 12.5% dari periode lalu", icon: "📈", color: "#52c41a", bg: "#f6ffed" },
    { label: "Total Produk Jadi", value: "1.180", sub: "Rp 238.760.000", hint: "↑ 10.2% dari periode lalu", icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Bahan Baku Terpakai", value: "2.450", sub: "Rp 125.340.000", hint: "↑ 8.7% dari periode lalu", icon: "🧱", color: "#722ed1", bg: "#f9f0ff" },
    { label: "Total Reject / Rusak", value: "100", sub: "Rp 17.690.000", hint: "↓ 5.1% dari periode lalu", icon: "⚠️", color: "#ff4d4f", bg: "#fff1f0" },
    { label: "Efisiensi Produksi", value: "87.6%", sub: "Skor rata-rata", hint: "↑ 6.3% dari periode lalu", icon: "⚡", color: "#e4915a", bg: "#fff8f3" },
  ];

  const productions = [
    { id: "PRD-2026-00029", product: "Produk A", sub: "Kran Air Stainless 1/2\"", wc: "Perakitan 1", date: "07 Feb 2026", shift: "Shift Pagi", target: 200, output: 195, reject: 5, rejPct: "2.5%", efficiency: "97.5%", status: "Selesai" },
    { id: "PRD-2026-00028", product: "Produk B", sub: "Stop Kontak Arde", wc: "Perakitan 2", date: "07 Feb 2026", shift: "Shift Pagi", target: 150, output: 148, reject: 2, rejPct: "1.3%", efficiency: "98.7%", status: "Selesai" },
    { id: "PRD-2026-00027", product: "Produk A", sub: "", wc: "Perakitan 1", date: "06 Feb 2026", shift: "Shift Siang", target: 180, output: 170, reject: 10, rejPct: "5.6%", efficiency: "94.4%", status: "Selesai" },
    { id: "PRD-2026-00026", product: "Produk C", sub: "Lampu LED 12W", wc: "Perakitan 3", date: "06 Feb 2026", shift: "Shift Siang", target: 160, output: 155, reject: 5, rejPct: "3.1%", efficiency: "96.9%", status: "Proses" },
    { id: "PRD-2026-00025", product: "Produk B", sub: "", wc: "Perakitan 2", date: "05 Feb 2026", shift: "Shift Malam", target: 150, output: 140, reject: 10, rejPct: "6.7%", efficiency: "93.3%", status: "Selesai" },
    { id: "PRD-2026-00024", product: "Produk A", sub: "", wc: "Perakitan 1", date: "05 Feb 2026", shift: "Shift Malam", target: 200, output: 180, reject: 20, rejPct: "10.0%", efficiency: "90.0%", status: "Tertunda" },
  ];

  const rawMaterials = [
    { label: "Pipa PVC 1/2 Inch", val: "450 unit", hint: "↑ 12.1%", color: "#52c41a" },
    { label: "Kabel NYM 3x1.5mm", val: "380 unit", hint: "↑ 8.7%", color: "#52c41a" },
    { label: "Fitting T 1/2\"", val: "320 unit", hint: "↓ 2.4%", color: "#ff4d4f" },
    { label: "Mur & Baut M6", val: "280 unit", hint: "↑ 5.6%", color: "#52c41a" },
    { label: "Kran Body", val: "240 unit", hint: "↑ 3.2%", color: "#52c41a" },
  ];

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="lpAdmin__head">
        <div>
          <h1 className="lpAdmin__title">Laporan Produksi</h1>
          <p className="lpAdmin__subtitle">
            Ringkasan aktivitas produksi, output, penggunaan bahan baku, dan efisiensi produksi.
          </p>
        </div>
        <div className="lpAdmin__headRight">
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
      <div className="lpAdmin__stats">
        {stats.map((s, i) => (
          <Card key={i} className="lpAdmin__statCard">
            <div className="lpAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="lpAdmin__statContent">
              <p className="lpAdmin__statLabel">{s.label}</p>
              <h3 className="lpAdmin__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.label === "Efisiensi Produksi" ? "" : "unit"}</span></h3>
              <p className="lpAdmin__statSub">{s.sub}</p>
              <p className="lpAdmin__statHint" style={{ color: s.hint.includes("↓") ? "#ff4d4f" : "#52c41a" }}>{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTERS */}
      <div className="lpAdmin__filterBar">
         <div className="lpsAdmin__filterGroup">
            <select className="lpsAdmin__select"><option>Semua Produk</option></select>
            <select className="lpsAdmin__select"><option>Semua Work Center</option></select>
            <select className="lpsAdmin__select"><option>Semua Shift</option></select>
            <div className="date-filter" style={{ border: '1px solid var(--border)', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>01 Feb 2026 - 07 Feb 2026 📅</div>
         </div>
         <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-reset-filter">Reset</button>
            <button className="btn-export" style={{ background: 'var(--bg-2)', color: 'var(--text)' }}><span>🔍</span> Filter Lainnya</button>
         </div>
      </div>

      {/* CHARTS ROW */}
      <div className="lpAdmin__chartsGrid">
        <div className="lpAdmin__card">
          <div className="lpAdmin__cardHead">
            <h3>Produksi vs Target</h3>
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
                <path d="M0,180 L100,170 L200,175 L300,165 L400,180 L500,170 L600,185 L700,175 L800,170" fill="none" stroke="#e4915a" strokeWidth="3" />
             </svg>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '11px', fontWeight: 600 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#52c41a' }}></span> Produksi Aktual</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#e4915a' }}></span> Target</div>
          </div>
        </div>

        <div className="lpAdmin__card">
          <div className="lpAdmin__cardHead">
            <h3>Komposisi Output Produksi</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
               <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="52 100" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="27 100" strokeDashoffset="-52" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#1890ff" strokeWidth="4" strokeDasharray="21 100" strokeDashoffset="-79" />
               </svg>
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Total</span>
                  <strong style={{ fontSize: '18px' }}>1.180</strong>
                  <span style={{ fontSize: '10px', color: '#888' }}>unit</span>
               </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {[
                 { label: "Produk A", val: 620, pct: "52.5%", color: "#52c41a" },
                 { label: "Produk B", val: 320, pct: "27.1%", color: "#fa8c16" },
                 { label: "Produk C", val: 240, pct: "20.3%", color: "#1890ff" },
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

        <div className="lpAdmin__card">
           <div className="lpAdmin__cardHead"><h3>Ringkasan Status Produksi</h3></div>
           <div className="loAdmin__sideList">
              {[
                { label: "Selesai", val: "18 Order", color: "#52c41a", icon: "✅" },
                { label: "Proses", val: "7 Order", color: "#1890ff", icon: "⚙️" },
                { label: "Tertunda", val: "3 Order", color: "#fa8c16", icon: "🕒" },
                { label: "Dibatalkan", val: "1 Order", color: "#ff4d4f", icon: "🚫" },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: item.color }}>{item.icon}</div>
                   <div style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{item.label}</div>
                   <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{item.val}</div>
                </div>
              ))}
              <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800 }}>
                 <span>Total</span>
                 <span>29 Order</span>
              </div>
           </div>
        </div>
      </div>

      {/* TABLES ROW */}
      <div className="lpAdmin__tablesGrid">
        <div className="lpAdmin__tableCard">
           <div className="rqAdmin__tableHeader" style={{ justifyContent: 'space-between', padding: '20px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Detail Produksi</h3>
           </div>
           <div className="lpsAdmin__tableWrap">
              <table className="lpsAdmin__table">
                <thead>
                  <tr>
                    <th>ID Produksi</th>
                    <th>Produk</th>
                    <th>Work Center</th>
                    <th>Tanggal Produksi</th>
                    <th>Shift</th>
                    <th>Target (Unit)</th>
                    <th>Hasil Produksi (Unit)</th>
                    <th>Reject (Unit)</th>
                    <th>Efisiensi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.map((p, i) => (
                    <tr key={i}>
                      <td className="rqAdmin__mono" style={{ fontSize: '11px' }}>{p.id}</td>
                      <td>
                        <p style={{ fontWeight: 700, margin: 0 }}>{p.product}</p>
                        <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>{p.sub}</p>
                      </td>
                      <td>{p.wc}</td>
                      <td>{p.date}</td>
                      <td>{p.shift}</td>
                      <td style={{ fontWeight: 600 }}>{p.target}</td>
                      <td style={{ fontWeight: 700 }}>{p.output}</td>
                      <td style={{ color: '#ff4d4f' }}>{p.reject} <span style={{ fontSize: '10px', color: '#888' }}>({p.rejPct})</span></td>
                      <td style={{ fontWeight: 700, color: '#1890ff' }}>{p.efficiency}</td>
                      <td>
                        <span className={`rqAdmin__pill ${p.status === 'Selesai' ? 'rqAdmin__pill--approved' : p.status === 'Proses' ? 'rqAdmin__pill--ship' : 'rqAdmin__pill--pending'}`}>
                          ● {p.status}
                        </span>
                      </td>
                      <td><button className="btn-icon">👁️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 6 dari 29 data</span>
              <div className="pagination">
                 <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
                 <div className="page-controls">
                    <button disabled>⟨</button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>...</span>
                    <button>5</button>
                    <button>⟩</button>
                 </div>
              </div>
           </footer>
        </div>

        <div className="lpsAdmin__sideStack">
           <div className="lpsAdmin__card">
              <div className="lpsAdmin__cardHead"><h3>Top Produk (Output Terbanyak)</h3><button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button></div>
              <div className="loAdmin__sideList">
                 {[
                   { label: "Kran Air Stainless 1/2\"", val: 620, pct: "95%", color: "#52c41a" },
                   { label: "Stop Kontak Arde", val: 320, pct: "60%", color: "#fa8c16" },
                   { label: "Lampu LED 12W Putih", val: 240, pct: "45%", color: "#1890ff" },
                 ].map((p, i) => (
                   <div key={i} className="loAdmin__sideItem">
                      <div className="loAdmin__sideLabelRow">
                         <span style={{ fontWeight: 600 }}>{p.label}</span>
                         <span style={{ color: '#888' }}>{p.val} unit</span>
                      </div>
                      <div className="loAdmin__progress">
                         <div className="loAdmin__progressBar" style={{ width: p.pct, background: p.color }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="lpsAdmin__card">
              <div className="lpsAdmin__cardHead"><h3>Penggunaan Bahan Baku</h3><button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button></div>
              <div className="loAdmin__sideList">
                 {rawMaterials.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '12px', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                       <span style={{ color: '#666' }}>{m.label}</span>
                       <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{m.val}</p>
                          <p style={{ margin: 0, fontSize: '10px', color: m.color, fontWeight: 700 }}>{m.hint}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* FOOTER ROW */}
      <div className="lpAdmin__footerGrid">
         <div className="lpsAdmin__card">
            <div className="lpsAdmin__cardHead"><h3>Efisiensi Produksi per Work Center</h3></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', padding: '0 20px' }}>
               {[
                 { label: "Perakitan 1", val: "91.2%", h: "91.2%" },
                 { label: "Perakitan 2", val: "83.7%", h: "83.7%" },
                 { label: "Perakitan 3", val: "84.3%", h: "84.3%" },
                 { label: "Finishing", val: "90.1%", h: "90.1%" },
                 { label: "Packaging", val: "86.2%", h: "86.2%" },
               ].map((b, i) => (
                 <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{b.val}</span>
                    <div style={{ width: '32px', height: b.h, background: '#52c41a', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '9px', color: '#888', textAlign: 'center', width: '50px' }}>{b.label}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="lpAdmin__card">
            <div className="lpsAdmin__cardHead"><h3>Analisis Produksi</h3></div>
            <div className="lpAdmin__analysisGrid">
               {[
                 { label: "Lead Time Rata-rata", val: "2.4 hari", hint: "+ 0.3 hari dari periode lalu", icon: "🕒", color: "#52c41a" },
                 { label: "Downtime", val: "12.5 jam", hint: "↑ 8.8% dari periode lalu", icon: "⬆️", color: "#e4915a" },
                 { label: "Reject Rate", val: "3.2%", hint: "↑ 0.8% dari periode lalu", icon: "🚫", color: "#ff4d4f" },
                 { label: "OEE (Overall Equipment Effectiveness)", val: "78.6%", hint: "↑ 5.6% dari periode lalu", icon: "⚙️", color: "#1890ff" },
               ].map((a, i) => (
                 <div key={i} className="lpAdmin__miniCard">
                    <div className="lpAdmin__miniIcon">{a.icon}</div>
                    <div>
                       <p className="lpAdmin__miniLabel">{a.label}</p>
                       <h4 className="lpAdmin__miniValue">{a.val}</h4>
                       <p className="lpAdmin__miniHint" style={{ color: a.color }}>{a.hint}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
