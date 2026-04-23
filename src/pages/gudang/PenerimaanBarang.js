import { useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PenerimaanBarangGudang.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function PenerimaanBarang() {
  const [activeTab, setActiveTab] = useState("Semua");

  const stats = [
    { label: "Total Penerimaan", value: "350", sub: "Transaksi", hint: "↑ 12.5% dari periode lalu", icon: "⬇️", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Total Item Diterima", value: "6.450", sub: "Item", hint: "↑ 8.3% dari periode lalu", icon: "📦", color: "#52c41a", bg: "#f6ffed" },
    { label: "Nilai Penerimaan", value: "Rp 1.245.300.000", sub: "", hint: "↑ 10.2% dari periode lalu", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
    { label: "Penerimaan Hari Ini", value: "28", sub: "Transaksi", hint: "Lihat detail", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Barang Pending", value: "12", sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
  ];

  const receipts = [
    { id: "GR-2026-00078", po: "PO-2026-00078", supplier: "Supplier Jaya Abadi", date: "07 Feb 2026 09:15", items: 45, value: 125450000, status: "Menunggu" },
    { id: "GR-2026-00077", po: "PO-2026-00077", supplier: "Elektronik Sentosa", date: "07 Feb 2026 08:30", items: 30, value: 68250000, status: "Proses" },
    { id: "GR-2026-00076", po: "PO-2026-00076", supplier: "Bangun Jaya", date: "06 Feb 2026 16:20", items: 25, value: 45600000, status: "Diterima" },
    { id: "GR-2026-00075", po: "PO-2026-00075", supplier: "Mitra Konstruksi", date: "06 Feb 2026 14:10", items: 18, value: 32800000, status: "Diterima" },
    { id: "GR-2026-00074", po: "PO-2026-00074", supplier: "Plumbing Sejahtera", date: "06 Feb 2026 10:05", items: 22, value: 38750000, status: "Diterima" },
    { id: "GR-2026-00073", po: "PO-2026-00073", supplier: "Supplier Makmur", date: "05 Feb 2026 15:45", items: 32, value: 75300000, status: "Proses" },
    { id: "GR-2026-00072", po: "PO-2026-00072", supplier: "Sukses Abadi", date: "05 Feb 2026 11:20", items: 15, value: 28150000, status: "Diterima" },
    { id: "GR-2026-00071", po: "PO-2026-00071", supplier: "Teknik Utama", date: "04 Feb 2026 17:05", items: 28, value: 55900000, status: "Menunggu" },
    { id: "GR-2026-00070", po: "PO-2026-00070", supplier: "Multi Material", date: "04 Feb 2026 09:30", items: 20, value: 37600000, status: "Diterima" },
    { id: "GR-2026-00069", po: "PO-2026-00069", supplier: "Baja Perkasa", date: "03 Feb 2026 14:45", items: 40, value: 89500000, status: "Ditolak" },
  ];

  const activities = [
    { title: "Penerimaan barang dari Supplier Jaya Abadi", sub: "GR-2026-00078", time: "5 menit lalu", color: "#fa8c16", icon: "🕒" },
    { title: "Penerimaan barang dari Elektronik Sentosa", sub: "GR-2026-00077", time: "35 menit lalu", color: "#1890ff", icon: "⚙️" },
    { title: "Penerimaan barang dari Bangun Jaya", sub: "GR-2026-00076", time: "2 jam lalu", color: "#52c41a", icon: "✅" },
    { title: "Penerimaan barang dari Mitra Konstruksi", sub: "GR-2026-00075", time: "4 jam lalu", color: "#52c41a", icon: "✅" },
    { title: "Penerimaan ditolak dari Baja Perkasa", sub: "GR-2026-00069", time: "1 hari lalu", color: "#ff4d4f", icon: "🚫" },
  ];

  return (
    <div className="gdash">
      {/* HEADER */}
      <header className="pbGudang__head">
        <div>
          <h1 className="pbGudang__title">Penerimaan Barang</h1>
          <p className="pbGudang__subtitle">Kelola dan catat semua barang yang masuk ke gudang.</p>
          <div className="pbGudang__breadcrumb">
            <span>Gudang</span> <span>›</span> <span style={{ color: '#e4915a', fontWeight: 700 }}>Penerimaan Barang</span>
          </div>
        </div>
        <button className="logout-btn" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>+</span> Terima Barang
        </button>
      </header>

      {/* STATS */}
      <div className="pbGudang__stats">
        {stats.map((s, i) => (
          <Card key={i} className="pbGudang__statCard">
            <div className="pbGudang__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="pbGudang__statMain">
              <p className="pbGudang__statLabel">{s.label}</p>
              <h3 className="pbGudang__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.sub}</span></h3>
              <p className="pbGudang__statHint" style={{ color: s.hint.includes("detail") ? "#e4915a" : "#52c41a" }}>{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="pbGudang__filterBar">
         <select className="moAdmin__select"><option>Semua Status</option></select>
         <div className="date-filter" style={{ border: '1px solid var(--border)', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>01 Feb 2026 - 07 Feb 2026 📅</div>
         <select className="moAdmin__select"><option>Semua Supplier</option></select>
         <select className="moAdmin__select"><option>Semua Jenis</option></select>
         <div className="moAdmin__searchWrap" style={{ flex: 1 }}>
            <span className="moAdmin__searchIcon">🔍</span>
            <input placeholder="Cari No. PO, Supplier, atau produk..." style={{ padding: '10px 12px 10px 32px' }} />
         </div>
         <button className="btn-reset-filter">Reset</button>
      </div>

      {/* TABS */}
      <div className="pbGudang__tabs">
        {["Semua", "Menunggu", "Proses", "Diterima", "Ditolak"].map(tab => (
          <div 
            key={tab} 
            className={`pbGudang__tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} <span className="pbGudang__tabCount">({tab === "Semua" ? "350" : tab === "Menunggu" ? "12" : tab === "Proses" ? "18" : tab === "Diterima" ? "290" : "5"})</span>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="pbGudang__mainGrid">
        <div className="pbGudang__tableCard">
           <div className="lpsAdmin__tableWrap">
              <table className="pbGudang__table">
                <thead>
                  <tr>
                    <th>No. Penerimaan</th>
                    <th>No. PO / Referensi</th>
                    <th>Supplier</th>
                    <th>Tanggal Terima</th>
                    <th>Total Item</th>
                    <th>Nilai (Rp)</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#888' }}>🚚</span> {r.id}
                      </td>
                      <td className="rqAdmin__mono" style={{ fontSize: '11px' }}>{r.po}</td>
                      <td style={{ fontWeight: 700 }}>{r.supplier}</td>
                      <td style={{ fontSize: '12px', color: '#888' }}>{r.date}</td>
                      <td>{r.items} item</td>
                      <td style={{ fontWeight: 700 }}>Rp {fmtIDR(r.value)}</td>
                      <td>
                        <span className={`rqAdmin__pill ${r.status === 'Diterima' ? 'rqAdmin__pill--approved' : r.status === 'Proses' ? 'rqAdmin__pill--ship' : r.status === 'Ditolak' ? 'rqAdmin__pill--declined' : 'rqAdmin__pill--pending'}`}>
                          ● {r.status}
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
              <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 10 dari 350 data</span>
              <div className="pagination">
                 <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
                 <div className="page-controls">
                    <button disabled>⟨</button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>...</span>
                    <button>35</button>
                    <button>⟩</button>
                 </div>
              </div>
           </footer>
        </div>

        <div className="pbGudang__sideStack">
          <div className="pbGudang__sideCard">
            <div className="pbGudang__sideHead">
               <h3>Ringkasan Penerimaan</h3>
            </div>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Periode: 01 - 07 Feb 2026</p>
            <div className="pbGudang__summaryItem"><span>Total Penerimaan</span><b>Rp 1.245.300.000</b></div>
            <div className="pbGudang__summaryItem"><span>Total Item</span><b>6.450 item</b></div>
            <div className="pbGudang__summaryItem"><span>Rata-rata per Transaksi</span><b>Rp 3.558.000</b></div>
          </div>

          <div className="pbGudang__sideCard">
            <div className="pbGudang__sideHead">
               <h3>Penerimaan per Supplier (Top 5)</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'column' }}>
               <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="34 100" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-34" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#1890ff" strokeWidth="4" strokeDasharray="17 100" strokeDashoffset="-59" />
                  </svg>
               </div>
               <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: "Supplier Jaya Abadi", val: "Rp 425.000.000", pct: "34%", color: "#52c41a" },
                    { label: "Bangun Jaya", val: "Rp 320.750.000", pct: "25.7%", color: "#fa8c16" },
                    { label: "Elektronik Sentosa", val: "Rp 215.000.000", pct: "17.3%", color: "#1890ff" },
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

          <div className="pbGudang__sideCard">
            <div className="pbGudang__sideHead"><h3>Aktivitas Terbaru</h3><button className="btn-text">Lihat Semua</button></div>
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
