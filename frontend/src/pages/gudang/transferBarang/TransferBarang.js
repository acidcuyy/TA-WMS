import { useState } from "react";
import { motion } from "framer-motion";
import Card from "../../../components/common/Card";
import "./TransferBarang.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function TransferBarang() {
  const [activeTab, setActiveTab] = useState("Semua");

  const stats = [
    { label: "Total Transfer", value: "120", sub: "Transaksi", hint: "↑ 12.4% dari periode lalu", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Total Item Ditransfer", value: "2.850", sub: "Item", hint: "↑ 8.6% dari periode lalu", icon: "📦", color: "#52c41a", bg: "#f6ffed" },
    { label: "Total Nilai Transfer", value: "Rp 685.350.000", sub: "", hint: "↑ 10.1% dari periode lalu", icon: "💰", color: "#722ed1", bg: "#f9f0ff" },
    { label: "Transfer Hari Ini", value: "6", sub: "Transaksi", hint: "Lihat detail", icon: "🚚", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Dalam Pengiriman", value: "8", sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
  ];

  const transfers = [
    { id: "TR-2026-00125", date: "07 Feb 2026 10:15", from: "Gudang Pusat", to: "Toko A", items: 45, value: 125450000, status: "Dalam Pengiriman", est: "08 Feb 2026" },
    { id: "TR-2026-00124", date: "07 Feb 2026 09:30", from: "Gudang Pusat", to: "Gudang Timur", items: 30, value: 68250000, status: "Menunggu", est: "08 Feb 2026" },
    { id: "TR-2026-00123", date: "06 Feb 2026 16:20", from: "Gudang Barat", to: "Gudang Pusat", items: 25, value: 45600000, status: "Disetujui", est: "07 Feb 2026" },
    { id: "TR-2026-00122", date: "06 Feb 2026 14:10", from: "Gudang Pusat", to: "Toko B", items: 18, value: 32800000, status: "Selesai", est: "06 Feb 2026" },
    { id: "TR-2026-00121", date: "06 Feb 2026 11:05", from: "Gudang Pusat", to: "Toko C", items: 22, value: 38750000, status: "Selesai", est: "06 Feb 2026" },
    { id: "TR-2026-00120", date: "05 Feb 2026 15:45", from: "Gudang Timur", to: "Toko D", items: 32, value: 75300000, status: "Dalam Pengiriman", est: "06 Feb 2026" },
    { id: "TR-2026-00119", date: "05 Feb 2026 11:20", from: "Gudang Barat", to: "Gudang Pusat", items: 15, value: 28150000, status: "Disetujui", est: "06 Feb 2026" },
    { id: "TR-2026-00118", date: "04 Feb 2026 17:05", from: "Gudang Pusat", to: "Toko E", items: 28, value: 55900000, status: "Selesai", est: "05 Feb 2026" },
    { id: "TR-2026-00117", date: "04 Feb 2026 09:30", from: "Gudang Timur", to: "Toko F", items: 20, value: 37600000, status: "Menunggu", est: "05 Feb 2026" },
    { id: "TR-2026-00116", date: "03 Feb 2026 14:45", from: "Gudang Pusat", to: "Toko G", items: 40, value: 89500000, status: "Dibatalkan", est: "-" },
  ];

  const activities = [
    { title: "Transfer dari Gudang Pusat ke Toko A", sub: "TR-2026-00125", time: "10 menit lalu", color: "#fa8c16", icon: "🕒" },
    { title: "Transfer dari Gudang Barat ke Gudang Pusat", sub: "TR-2026-00123", time: "1 jam lalu", color: "#52c41a", icon: "✅" },
    { title: "Transfer dari Gudang Pusat ke Toko C", sub: "TR-2026-00121", time: "2 jam lalu", color: "#1890ff", icon: "🚚" },
    { title: "Transfer dari Gudang Timur ke Toko D", sub: "TR-2026-00120", time: "3 jam lalu", color: "#1890ff", icon: "🚚" },
    { title: "Transfer dari Gudang Pusat ke Toko G", sub: "TR-2026-00116", time: "1 hari lalu", color: "#ff4d4f", icon: "🚫" },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Menunggu": return "menunggu";
      case "Disetujui": return "disetujui";
      case "Dalam Pengiriman": return "pengiriman";
      case "Selesai": return "selesai";
      case "Dibatalkan": return "dibatalkan";
      default: return "";
    }
  };

  return (
    <div className="trBarang">
      {/* HEADER */}
      <div className="gdash">
        <header className="trBarang__head">
          <div>
            <h1 className="trBarang__title">Transfer Barang</h1>
            <p className="trBarang__subtitle">Kelola dan pantau semua aktivitas transfer barang antar gudang atau ke toko.</p>
            <div className="trBarang__breadcrumb">
              <span>Gudang</span> <span>›</span> <span style={{ color: '#e4915a', fontWeight: 700 }}>Transfer Barang</span>
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="trBarang__stats">
          {stats.map((s, i) => (
            <Card key={i} className="trBarang__statCard">
              <div className="trBarang__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="trBarang__statMain">
                <p className="trBarang__statLabel">{s.label}</p>
                <h3 className="trBarang__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.sub}</span></h3>
                <p className="trBarang__statHint" style={{ color: s.hint.includes("detail") ? "#e4915a" : "#52c41a" }}>{s.hint}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="trBarang__filterBar">
          <select className="moAdmin__select"><option>Semua Status</option></select>
          <div className="date-filter" style={{ border: '1px solid var(--border)', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>01 Feb 2026 - 07 Feb 2026 📅</div>
          <select className="moAdmin__select"><option>Semua Asal</option></select>
          <select className="moAdmin__select"><option>Semua Tujuan</option></select>
          <div className="moAdmin__searchWrap" style={{ flex: 1 }}>
            <span className="moAdmin__searchIcon">🔍</span>
            <input placeholder="Cari No. Transfer, tujuan, atau produk..." style={{ padding: '10px 12px 10px 32px' }} />
          </div>
          <button className="btn-reset-filter">Reset</button>
        </div>

        {/* TABS */}
        <div className="trBarang__tabs">
          {[
            { name: "Semua", count: 120 },
            { name: "Menunggu", count: 8 },
            { name: "Disetujui", count: 20 },
            { name: "Dalam Pengiriman", count: 8 },
            { name: "Selesai", count: 80 },
            { name: "Dibatalkan", count: 4 }
          ].map(tab => (
            <div
              key={tab.name}
              className={`trBarang__tab ${activeTab === tab.name ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.name} <span className="trBarang__tabCount">({tab.count})</span>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="gdash">
          <div className="trBarang__mainGrid">
            <div className="trBarang__tableCard">
              <div className="lpsAdmin__tableWrap">
                <table className="trBarang__table">
                  <thead>
                    <tr>
                      <th>No. Transfer</th>
                      <th>Tanggal</th>
                      <th>Dari</th>
                      <th>Tujuan</th>
                      <th>Total Item</th>
                      <th>Nilai (Rp)</th>
                      <th>Status</th>
                      <th>Tgl. Estimasi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#1890ff' }}>⇄</span> {t.id}
                        </td>
                        <td style={{ fontSize: '12px', color: '#888' }}>{t.date}</td>
                        <td style={{ fontWeight: 600 }}>{t.from}</td>
                        <td style={{ fontWeight: 600 }}>{t.to}</td>
                        <td>{t.items} item</td>
                        <td style={{ fontWeight: 700 }}>Rp {fmtIDR(t.value)}</td>
                        <td>
                          <span className={`status-pill ${getStatusClass(t.status)}`}>
                            ● {t.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#888' }}>{t.est}</td>
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
                <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 10 dari 120 data</span>
                <div className="pagination">
                  <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
                  <div className="page-controls">
                    <button disabled>⟨</button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>...</span>
                    <button>12</button>
                    <button>⟩</button>
                  </div>
                </div>
              </footer>
            </div>

            <div className="trBarang__sideStack">
              <div className="trBarang__sideCard">
                <div className="trBarang__sideHead">
                  <h3>Ringkasan Transfer</h3>
                </div>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Periode: 01 - 07 Feb 2026</p>
                <div className="trBarang__summaryItem"><span>Total Transfer</span><b>120</b></div>
                <div className="trBarang__summaryItem"><span>Total Item Ditransfer</span><b>2.850 item</b></div>
                <div className="trBarang__summaryItem"><span>Total Nilai Transfer</span><b>Rp 685.350.000</b></div>
                <div className="trBarang__summaryItem"><span>Rata-rata per Transaksi</span><b>Rp 5.711.250</b></div>
              </div>

              <div className="trBarang__sideCard">
                <div className="trBarang__sideHead">
                  <h3>Transfer per Tujuan (Top 5)</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="32 100" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-32" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#1890ff" strokeWidth="4" strokeDasharray="17 100" strokeDashoffset="-52" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#722ed1" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-69" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#13c2c2" strokeWidth="4" strokeDasharray="16 100" strokeDashoffset="-84" />
                    </svg>
                  </div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: "Toko A", val: "38", pct: "31.7%", color: "#52c41a" },
                      { label: "Toko B", val: "24", pct: "20.0%", color: "#fa8c16" },
                      { label: "Gudang Timur", val: "20", pct: "16.7%", color: "#1890ff" },
                      { label: "Toko C", val: "18", pct: "15.0%", color: "#722ed1" },
                      { label: "Lainnya", val: "20", pct: "16.6%", color: "#13c2c2" },
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginRight: '8px' }}></span>
                        <span style={{ flex: 1, color: '#666' }}>{s.label}</span>
                        <span style={{ width: '20px', textAlign: 'right', marginRight: '8px' }}>{s.val}</span>
                        <span style={{ fontWeight: 700 }}>({s.pct})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="trBarang__sideCard">
                <div className="trBarang__sideHead"><h3>Aktivitas Terbaru</h3><button className="btn-text">Lihat Semua</button></div>
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
      </div>
    </div>
  );
}
