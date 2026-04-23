import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./LaporanPergerakanAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function LaporanPergerakanStok() {
  const [timeRange, setTimeRange] = useState("Harian");

  const stats = [
    { label: "Total Stok Masuk", value: "3.250", sub: "Rp 245.350.000", hint: "↑ 12.6% dari periode lalu", icon: "⬇️", color: "#52c41a", bg: "#f6ffed" },
    { label: "Total Stok Keluar", value: "2.780", sub: "Rp 198.750.000", hint: "↑ 8.3% dari periode lalu", icon: "⬆️", color: "#e4915a", bg: "#fff8f3" },
    { label: "Total Transfer", value: "520", sub: "Rp 45.600.000", hint: "↑ 15.7% dari periode lalu", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Net Movement", value: "470", sub: "Rp 46.600.000", hint: "↑ 10.2% dari periode lalu", icon: "📦", color: "#722ed1", bg: "#f9f0ff" },
    { label: "Rata-rata Per Hari", value: "67", sub: "Rp 6.657.000", hint: "Selama 7 hari", icon: "📈", color: "#ff4d4f", bg: "#fff1f0" },
  ];

  const movements = [
    { date: "07 Feb 2026", time: "14:35", type: "Stok Masuk", ref: "PO-2026-00078", product: "Lampu LED 12W Putih", sku: "LED-12W-PUTIH", loc: "Gudang Pusat", in: 150, out: null, balance: 1250, unit: "pcs", note: "Purchase Order dari Supplier Jaya Abadi", color: "#52c41a" },
    { date: "07 Feb 2026", time: "11:20", type: "Stok Keluar", ref: "SO-2026-00248", product: "Kabel NYM 3x1.5mm", sku: "KBL-NYM-315", loc: "Toko A", in: null, out: 20, balance: 180, unit: "roll", note: "Sales Order ke Toko A", color: "#e4915a" },
    { date: "07 Feb 2026", time: "09:10", type: "Transfer", ref: "TR-2026-00056", product: "Cat Tembok 5kg Putih", sku: "CTT-SKG-PUTIH", loc: "Gudang Pusat → Gudang Timur", in: null, out: 30, balance: 270, unit: "kaleng", note: "Transfer antar gudang", color: "#1890ff" },
    { date: "06 Feb 2026", time: "16:45", type: "Stok Masuk", ref: "PO-2026-00077", product: "Stop Kontak Arde", sku: "SK-ARDE", loc: "Gudang Barat", in: 200, out: null, balance: 600, unit: "pcs", note: "Purchase Order dari Supplier Elektronik", color: "#52c41a" },
    { date: "06 Feb 2026", time: "13:30", type: "Stok Keluar", ref: "SO-2026-00246", product: "Kran Air Stainless 1/2\"", sku: "KRN-SS-12", loc: "Toko B", in: null, out: 15, balance: 85, unit: "pcs", note: "Sales Order ke Toko B", color: "#e4915a" },
    { date: "06 Feb 2026", time: "10:05", type: "Transfer", ref: "TR-2026-00055", product: "Kabel NYM 3x1.5mm", sku: "KBL-NYM-315", loc: "Gudang Barat → Toko C", in: null, out: 25, balance: 155, unit: "roll", note: "Transfer ke toko", color: "#1890ff" },
  ];

  const locationPerformance = [
    { loc: "Gudang Pusat", in: 1250, out: 980, tr: 210, net: "+270" },
    { loc: "Gudang Barat", in: 750, out: 610, tr: 80, net: "+140" },
    { loc: "Gudang Timur", in: 820, out: 540, tr: 120, net: "+280" },
    { loc: "Toko A", in: 120, out: 350, tr: 50, net: "-230" },
    { loc: "Toko B", in: 80, out: 210, tr: 70, net: "-130" },
  ];

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="lpsAdmin__head">
        <div>
          <h1 className="lpsAdmin__title">Laporan Pergerakan Stok</h1>
          <p className="lpsAdmin__subtitle">
            Pantau semua pergerakan stok masuk, keluar, dan transfer dalam periode tertentu.
          </p>
        </div>
        <div className="lpsAdmin__headRight">
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
      <div className="lpsAdmin__stats">
        {stats.map((s, i) => (
          <Card key={i} className="lpsAdmin__statCard">
            <div className="lpsAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="lpsAdmin__statContent">
              <p className="lpsAdmin__statLabel">{s.label}</p>
              <h3 className="lpsAdmin__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>item</span></h3>
              <p className="lpsAdmin__statSub">{s.sub}</p>
              <p className="lpsAdmin__statHint">{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTERS */}
      <div className="lpsAdmin__filterBar">
         <div className="lpsAdmin__filterGroup">
            <select className="lpsAdmin__select"><option>Semua Tipe Pergerakan</option></select>
            <select className="lpsAdmin__select"><option>Semua Gudang / Toko</option></select>
            <select className="lpsAdmin__select"><option>Semua Produk</option></select>
            <select className="lpsAdmin__select"><option>Semua Kategori</option></select>
            <div className="date-filter" style={{ border: '1px solid var(--border)', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>01 Feb 2026 - 07 Feb 2026 📅</div>
         </div>
         <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-reset-filter">Reset</button>
            <button className="btn-export" style={{ background: 'var(--bg-2)', color: 'var(--text)' }}><span>🔍</span> Filter Lainnya</button>
         </div>
      </div>

      {/* CHARTS ROW */}
      <div className="lpsAdmin__chartsGrid">
        <div className="lpsAdmin__card">
          <div className="lpsAdmin__cardHead">
            <h3>Grafik Pergerakan Stok</h3>
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
                <path d="M0,180 L100,160 L200,170 L300,150 L400,170 L500,160 L600,180 L700,160 L800,150" fill="none" stroke="#e4915a" strokeWidth="3" />
                <path d="M0,195 L100,185 L200,190 L300,175 L400,190 L500,185 L600,195 L700,185 L800,175" fill="none" stroke="#1890ff" strokeWidth="3" />
             </svg>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '11px', fontWeight: 600 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#52c41a' }}></span> Stok Masuk</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#e4915a' }}></span> Stok Keluar</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#1890ff' }}></span> Transfer</div>
          </div>
        </div>

        <div className="lpsAdmin__card">
          <div className="lpsAdmin__cardHead">
            <h3>Komposisi Pergerakan</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
               <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="50 100" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="42 100" strokeDashoffset="-50" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#1890ff" strokeWidth="4" strokeDasharray="8 100" strokeDashoffset="-92" />
               </svg>
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Total</span>
                  <strong style={{ fontSize: '18px' }}>6.550</strong>
                  <span style={{ fontSize: '10px', color: '#888' }}>item</span>
               </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {[
                 { label: "Stok Masuk", val: "3.250", pct: "49.6%", color: "#52c41a" },
                 { label: "Stok Keluar", val: "2.780", pct: "42.4%", color: "#fa8c16" },
                 { label: "Transfer", val: "520", pct: "7.9%", color: "#1890ff" },
               ].map((h, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.color, marginRight: '10px' }}></span>
                    <span style={{ flex: 1, color: '#666' }}>{h.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#444' }}>{h.val} ({h.pct})</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="lpsAdmin__card">
           <div className="lpsAdmin__cardHead"><h3>Ringkasan Per Tipe</h3></div>
           <div className="loAdmin__sideList">
              {[
                { label: "Stok Masuk", val: "3.250 item", color: "#52c41a", icon: "⬇️", price: "Rp 245.350.000" },
                { label: "Stok Keluar", val: "2.780 item", color: "#fa8c16", icon: "⬆️", price: "Rp 198.750.000" },
                { label: "Transfer", val: "520 item", color: "#1890ff", icon: "⇄", price: "Rp 45.600.000" },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: item.color }}>{item.icon}</div>
                   <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{item.price}</p>
                   </div>
                   <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{item.val}</div>
                </div>
              ))}
              <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800 }}>
                 <span>Total</span>
                 <span>6.550 item | Rp 489.700.000</span>
              </div>
           </div>
        </div>
      </div>

      {/* TABLES ROW */}
      <div className="lpsAdmin__tablesGrid">
        <div className="lpsAdmin__tableCard">
           <div className="rqAdmin__tableHeader" style={{ justifyContent: 'space-between', padding: '20px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Detail Pergerakan Stok</h3>
              <div className="moAdmin__searchWrap" style={{ maxWidth: '300px' }}>
                 <span className="moAdmin__searchIcon">🔍</span>
                 <input placeholder="Cari produk, SKU, atau reference..." style={{ padding: '8px 12px 8px 32px' }} />
              </div>
           </div>
           <div className="lpsAdmin__tableWrap">
              <table className="lpsAdmin__table">
                <thead>
                  <tr>
                    <th>Tanggal & Waktu</th>
                    <th>Tipe</th>
                    <th>Reference</th>
                    <th>Produk</th>
                    <th>SKU / Barcode</th>
                    <th>Gudang / Toko</th>
                    <th>Masuk</th>
                    <th>Keluar</th>
                    <th>Saldo</th>
                    <th>Satuan</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m, i) => (
                    <tr key={i}>
                      <td>
                        <p style={{ fontWeight: 600, margin: 0 }}>{m.date}</p>
                        <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>{m.time}</p>
                      </td>
                      <td>
                        <span className={`lpsAdmin__typeTag ${m.type === 'Stok Masuk' ? 'lpsAdmin__typeTag--in' : m.type === 'Stok Keluar' ? 'lpsAdmin__typeTag--out' : 'lpsAdmin__typeTag--tr'}`}>
                          {m.type === 'Stok Masuk' ? '⬇️' : m.type === 'Stok Keluar' ? '⬆️' : '⇄'} {m.type}
                        </span>
                      </td>
                      <td className="rqAdmin__mono" style={{ fontSize: '11px' }}>{m.ref}</td>
                      <td style={{ fontWeight: 700 }}>{m.product}</td>
                      <td className="rqAdmin__mono" style={{ fontSize: '11px', color: '#888' }}>{m.sku}</td>
                      <td>{m.loc}</td>
                      <td style={{ color: '#52c41a', fontWeight: 700 }}>{m.in ? `+${m.in}` : '-'}</td>
                      <td style={{ color: '#ff4d4f', fontWeight: 700 }}>{m.out ? `-${m.out}` : '-'}</td>
                      <td style={{ fontWeight: 800 }}>{m.balance}</td>
                      <td>{m.unit}</td>
                      <td style={{ fontSize: '11px', color: '#666', maxWidth: '150px' }}>{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 8 dari 228 data</span>
              <div className="pagination">
                 <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
                 <div className="page-controls">
                    <button disabled>⟨</button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>...</span>
                    <button>23</button>
                    <button>⟩</button>
                 </div>
              </div>
           </footer>
        </div>

        <div className="lpsAdmin__sideStack">
           <div className="lpsAdmin__card">
              <div className="lpsAdmin__cardHead">
                 <h3>Pergerakan per Gudang / Toko</h3>
                 <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
              </div>
              <div className="lpsAdmin__tableWrap">
                 <table className="lpsAdmin__table" style={{ fontSize: '11px' }}>
                    <thead>
                       <tr>
                          <th>Lokasi</th>
                          <th>Masuk</th>
                          <th>Keluar</th>
                          <th>Transfer</th>
                          <th>Net</th>
                       </tr>
                    </thead>
                    <tbody>
                       {locationPerformance.map((l, i) => (
                          <tr key={i}>
                             <td style={{ fontWeight: 700 }}>{l.loc}</td>
                             <td style={{ color: '#52c41a' }}>{l.in}</td>
                             <td style={{ color: '#ff4d4f' }}>{l.out}</td>
                             <td style={{ color: '#1890ff' }}>{l.tr}</td>
                             <td style={{ fontWeight: 700, color: l.net.startsWith('+') ? '#52c41a' : '#ff4d4f' }}>{l.net}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="lpsAdmin__card">
              <div className="lpsAdmin__cardHead">
                 <h3>Top 5 Produk (Pergerakan Tertinggi)</h3>
                 <button className="btn-text" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
              </div>
              <div className="loAdmin__sideList">
                 {[
                   { label: "Kabel NYM 3x1.5mm", val: 620, pct: "95%", color: "#1890ff" },
                   { label: "Lampu LED 12W Putih", val: 480, pct: "75%", color: "#52c41a" },
                   { label: "Cat Tembok 5kg Putih", val: 450, pct: "70%", color: "#fa8c16" },
                   { label: "Pipa PVC 1/2 Inch", val: 380, pct: "60%", color: "#722ed1" },
                   { label: "Stop Kontak Arde", val: 320, pct: "50%", color: "#ff4d4f" },
                 ].map((p, i) => (
                   <div key={i} className="loAdmin__sideItem">
                      <div className="loAdmin__sideLabelRow">
                         <span style={{ fontWeight: 600 }}>{p.label}</span>
                         <span style={{ color: '#888' }}>{p.val} item</span>
                      </div>
                      <div className="loAdmin__progress">
                         <div className="loAdmin__progressBar" style={{ width: p.pct, background: p.color }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
