import { useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PengeluaranBarang.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function PengeluaranBarang() {
  const [activeTab, setActiveTab] = useState("Semua");

  const stats = [
    { label: "Total Pengeluaran", value: "270", sub: "Transaksi", hint: "↑ 12.5% dari periode lalu", icon: "📤", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Total Item Dikeluarkan", value: "4.250", sub: "Item", hint: "↑ 8.7% dari periode lalu", icon: "📦", color: "#52c41a", bg: "#f6ffed" },
    { label: "Total Nilai Pengeluaran", value: "Rp 985.750.000", sub: "", hint: "↑ 10.3% dari periode lalu", icon: "💰", color: "#722ed1", bg: "#f9f0ff" },
    { label: "Pengeluaran Hari Ini", value: "18", sub: "Transaksi", hint: "Lihat detail", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Barang Pending", value: "7", sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
  ];

  const transactions = [
    { id: "DO-2026-00125", ref: "SO-2026-00078", destination: "Toko A", date: "07 Feb 2026 10:15", items: 45, value: 125450000, status: "Menunggu" },
    { id: "DO-2026-00124", ref: "SO-2026-00077", destination: "Toko B", date: "07 Feb 2026 09:30", items: 30, value: 68250000, status: "Proses" },
    { id: "DO-2026-00123", ref: "TR-2026-00056", destination: "Gudang Timur", date: "06 Feb 2026 16:20", items: 25, value: 45600000, status: "Dikeluarkan" },
    { id: "DO-2026-00122", ref: "SO-2026-00076", destination: "Toko C", date: "06 Feb 2026 14:10", items: 18, value: 32800000, status: "Dikeluarkan" },
    { id: "DO-2026-00121", ref: "SO-2026-00075", destination: "Toko D", date: "06 Feb 2026 11:05", items: 22, value: 38750000, status: "Dikeluarkan" },
    { id: "DO-2026-00120", ref: "TR-2026-00055", destination: "Gudang Barat", date: "05 Feb 2026 15:45", items: 32, value: 75300000, status: "Proses" },
    { id: "DO-2026-00119", ref: "SO-2026-00074", destination: "Toko E", date: "05 Feb 2026 11:20", items: 15, value: 28150000, status: "Dikeluarkan" },
    { id: "DO-2026-00118", ref: "SO-2026-00073", destination: "Toko F", date: "04 Feb 2026 17:05", items: 28, value: 55900000, status: "Dikeluarkan" },
    { id: "DO-2026-00117", ref: "SO-2026-00072", destination: "Toko G", date: "04 Feb 2026 09:30", items: 20, value: 37600000, status: "Menunggu" },
    { id: "DO-2026-00116", ref: "TR-2026-00054", destination: "Gudang Selatan", date: "03 Feb 2026 14:45", items: 40, value: 89500000, status: "Dibatalkan" },
  ];

  const activities = [
    { title: "Pengeluaran barang untuk Toko A", sub: "DO-2026-00125", time: "10 menit lalu", color: "#fa8c16", icon: "🕒" },
    { title: "Pengeluaran barang untuk Toko B", sub: "DO-2026-00124", time: "40 menit lalu", color: "#1890ff", icon: "⚙️" },
    { title: "Pengeluaran barang untuk Gudang Timur", sub: "DO-2026-00123", time: "1 jam lalu", color: "#52c41a", icon: "✅" },
    { title: "Pengeluaran barang untuk Toko C", sub: "DO-2026-00122", time: "3 jam lalu", color: "#52c41a", icon: "✅" },
    { title: "Pengeluaran barang dibatalkan", sub: "DO-2026-00116", time: "1 hari lalu", color: "#ff4d4f", icon: "🚫" },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Menunggu": return "menunggu";
      case "Proses": return "proses";
      case "Dikeluarkan": return "dikeluarkan";
      case "Dibatalkan": return "dibatalkan";
      default: return "";
    }
  };

  return (
    <div className="pgBarang">
      {/* HEADER */}
      <header className="pgBarang__head">
        <div>
          <h1 className="pgBarang__title">Pengeluaran Barang</h1>
          <p className="pgBarang__subtitle">Kelola dan catat semua barang yang dikeluarkan dari gudang.</p>
          <div className="pgBarang__breadcrumb">
            <span>Gudang</span> <span>›</span> <span style={{ color: '#e4915a', fontWeight: 700 }}>Pengeluaran Barang</span>
          </div>
        </div>
        <button className="logout-btn" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f86c14', color: 'white' }}>
          <span style={{ fontSize: '18px' }}>+</span> Buat Pengeluaran
        </button>
      </header>

      {/* STATS */}
      <div className="pgBarang__stats">
        {stats.map((s, i) => (
          <Card key={i} className="pgBarang__statCard">
            <div className="pgBarang__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="pgBarang__statMain">
              <p className="pgBarang__statLabel">{s.label}</p>
              <h3 className="pgBarang__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.sub}</span></h3>
              <p className="pgBarang__statHint" style={{ color: s.hint.includes("detail") ? "#e4915a" : "#52c41a" }}>{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="pgBarang__filterBar">
         <select className="moAdmin__select"><option>Semua Status</option></select>
         <div className="date-filter" style={{ border: '1px solid var(--border)', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>01 Feb 2026 - 07 Feb 2026 📅</div>
         <select className="moAdmin__select"><option>Semua Tujuan</option></select>
         <select className="moAdmin__select"><option>Semua Jenis Pengeluaran</option></select>
         <div className="moAdmin__searchWrap" style={{ flex: 1 }}>
            <span className="moAdmin__searchIcon">🔍</span>
            <input placeholder="Cari No. DO, tujuan, atau produk..." style={{ padding: '10px 12px 10px 32px' }} />
         </div>
         <button className="btn-reset-filter">Reset</button>
      </div>

      {/* TABS */}
      <div className="pgBarang__tabs">
        {[
          { name: "Semua", count: 270 },
          { name: "Menunggu", count: 7 },
          { name: "Proses", count: 12 },
          { name: "Dikeluarkan", count: 238 },
          { name: "Dibatalkan", count: 13 }
        ].map(tab => (
          <div 
            key={tab.name} 
            className={`pgBarang__tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name} <span className="pgBarang__tabCount">({tab.count})</span>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="pgBarang__mainGrid">
        <div className="pgBarang__tableCard">
           <div className="lpsAdmin__tableWrap">
              <table className="pgBarang__table">
                <thead>
                  <tr>
                    <th>No. Pengeluaran</th>
                    <th>No. DO / Referensi</th>
                    <th>Tujuan</th>
                    <th>Tanggal</th>
                    <th>Total Item</th>
                    <th>Nilai (Rp)</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: t.id.startsWith('DO') ? '#1890ff' : '#52c41a' }}>
                          {t.id.startsWith('DO') ? '⇄' : '📦'}
                        </span> {t.id}
                      </td>
                      <td className="rqAdmin__mono" style={{ fontSize: '11px' }}>{t.ref}</td>
                      <td style={{ fontWeight: 700 }}>{t.destination}</td>
                      <td style={{ fontSize: '12px', color: '#888' }}>{t.date}</td>
                      <td>{t.items} item</td>
                      <td style={{ fontWeight: 700 }}>Rp {fmtIDR(t.value)}</td>
                      <td>
                        <span className={`status-pill ${getStatusClass(t.status)}`}>
                          ● {t.status}
                        </span>
                      </td>
                      <td>
                         <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn-icon">👁️</button>
                            <button className="btn-icon">⋮</button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 10 dari 270 data</span>
              <div className="pagination">
                 <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
                 <div className="page-controls">
                    <button disabled>⟨</button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>...</span>
                    <button>27</button>
                    <button>⟩</button>
                 </div>
              </div>
           </footer>
        </div>

        <div className="pgBarang__sideStack">
          <div className="pgBarang__sideCard">
            <div className="pgBarang__sideHead">
               <h3>Ringkasan Pengeluaran</h3>
            </div>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Periode: 01 - 07 Feb 2026</p>
            <div className="pgBarang__summaryItem"><span>Total Pengeluaran</span><b>Rp 985.750.000</b></div>
            <div className="pgBarang__summaryItem"><span>Total Item</span><b>4.250 item</b></div>
            <div className="pgBarang__summaryItem"><span>Rata-rata per Transaksi</span><b>Rp 3.650.000</b></div>
          </div>

          <div className="pgBarang__sideCard">
            <div className="pgBarang__sideHead">
               <h3>Pengeluaran per Tujuan (Top 5)</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'column' }}>
               <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="25 100" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-25" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#1890ff" strokeWidth="4" strokeDasharray="18 100" strokeDashoffset="-45" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#722ed1" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-63" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#13c2c2" strokeWidth="4" strokeDasharray="22 100" strokeDashoffset="-78" />
                  </svg>
               </div>
               <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: "Toko A", val: "Rp 245.300.000", pct: "24.9%", color: "#52c41a" },
                    { label: "Toko B", val: "Rp 198.750.000", pct: "20.2%", color: "#fa8c16" },
                    { label: "Gudang Timur", val: "Rp 175.600.000", pct: "17.8%", color: "#1890ff" },
                    { label: "Toko C", val: "Rp 149.800.000", pct: "15.2%", color: "#722ed1" },
                    { label: "Lainnya", val: "Rp 216.300.000", pct: "21.9%", color: "#13c2c2" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                       <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginRight: '8px' }}></span>
                       <span style={{ flex: 1, color: '#666' }}>{s.label}</span>
                       <span style={{ fontWeight: 700 }}>{s.pct}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="pgBarang__sideCard">
            <div className="pgBarang__sideHead"><h3>Aktivitas Terbaru</h3><button className="btn-text">Lihat Semua</button></div>
            <div className="gdash__timeline">
               {activities.map((a, i) => (
                 <div key={i} className="gdash__timeItem">
                    <div className="gdash__alertIcon" style={{ width: '32px', height: '32px', background: `${a.color}15`, color: a.color, fontSize: '14px' }}>{a.icon}</div>
                    <div className="gdash__timeContent">
                       <p className="gdash__timeTitle" style={{ fontSize: '12px' }}>{a.title}</p>
                       <p className="gdash__timeSub">{a.sub} • {a.time}</p>
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
