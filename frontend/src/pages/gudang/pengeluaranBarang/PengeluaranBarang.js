import { useState, useEffect, useMemo } from "react";
import Card from "../../../components/common/Card";
import DetailModal from "../../../components/common/DetailModal";
import DateRangePicker from "../../../components/common/DateRangePicker";
import { subscribeRequests } from "../../../services/wmsApi";
import "./PengeluaranBarang.css";

export default function PengeluaranBarang() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [allRequests, setAllRequests] = useState([]);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const unsub = subscribeRequests((data) => setAllRequests(data || []));
    return () => unsub();
  }, []);

  const transactions = useMemo(() => {
    return allRequests.map(r => {
      let totalItems = 0;
      let value = 0;
      let itemsList = [];

      (r.items || []).forEach(it => {
        totalItems += it.qty;
        const p = it.category === "Elektronik" ? 450000 : it.category === "Minuman" ? 8000 : 25000;
        value += it.qty * p;
        itemsList.push(`${it.name} (${it.sku || "SAK-" + Math.floor(Math.random()*1000)}) x${it.qty}`);
      });
      
      let statusLabel = r.status;
      if (statusLabel === "Memproses") statusLabel = "Proses";
      if (statusLabel === "Selesai") statusLabel = "Dikeluarkan";
      if (statusLabel === "Diterima Toko") statusLabel = "Dikeluarkan";
      if (statusLabel === "Declined") statusLabel = "Dibatalkan";

      return {
        id: `DO-${r.id.split('-')[1] || r.id}`,
        ref: r.id,
        destination: r.fromName || "Toko",
        date: new Date(r.createdAt || new Date()).toLocaleString("id-ID", {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        itemsCount: totalItems,
        itemsText: itemsList.join(', '),
        value,
        status: statusLabel,
        rawStatus: r.status
      };
    });
  }, [allRequests]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === "Semua") return transactions;
    return transactions.filter(t => t.status === activeTab);
  }, [transactions, activeTab]);

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
    <div className="gdash">
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
        </header>

        {/* STATS */}
        <div className="pgBarang__stats">
          {[
            { label: "Total Pengeluaran", value: transactions.length, sub: "Transaksi", hint: "Dari keseluruhan data", icon: "📤", color: "#1890ff", bg: "#e6f7ff" },
            { label: "Total Item Dikeluarkan", value: transactions.filter(t => t.status === "Dikeluarkan").reduce((sum, t) => sum + t.itemsCount, 0), sub: "Item", hint: "Telah dikeluarkan", icon: "📦", color: "#52c41a", bg: "#f6ffed" },

            { label: "Sedang Diproses", value: transactions.filter(t => t.status === "Proses" || t.status === "Mengirim").length, sub: "Transaksi", hint: "Proses & kirim", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
            { label: "Menunggu Acc", value: transactions.filter(t => t.status === "Menunggu").length, sub: "Transaksi", hint: "Menunggu Acc Gudang", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
          ].map((s, i) => (
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
          <DateRangePicker />
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
            { name: "Semua", count: transactions.length },
            { name: "Menunggu", count: transactions.filter(t => t.status === "Menunggu").length },
            { name: "Proses", count: transactions.filter(t => t.status === "Proses").length },
            { name: "Mengirim", count: transactions.filter(t => t.status === "Mengirim").length },
            { name: "Dikeluarkan", count: transactions.filter(t => t.status === "Dikeluarkan").length },
            { name: "Dibatalkan", count: transactions.filter(t => t.status === "Dibatalkan").length }
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
                    <th>Daftar Barang (SKU)</th>

                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                        Belum ada data pengeluaran.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: t.id.startsWith('DO') ? '#1890ff' : '#52c41a' }}>
                              {t.id.startsWith('DO') ? '⇄' : '📦'}
                            </span> {t.id}
                          </div>
                        </td>
                        <td className="rqAdmin__mono" style={{ fontSize: '11px' }}>{t.ref}</td>
                        <td style={{ fontWeight: 700 }}>{t.destination}</td>
                        <td style={{ fontSize: '12px', color: '#888' }}>{t.date}</td>
                        <td style={{ fontSize: '11px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.itemsText}>
                          <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{t.itemsCount} item total</div>
                          <div style={{ color: '#64748b' }}>{t.itemsText}</div>
                        </td>

                        <td>
                          <span className={`status-pill ${getStatusClass(t.status)}`}>
                            ● {t.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn-icon" onClick={() => setDetailModal(t)}>👁️</button>
                            <button className="btn-icon">⋮</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - {filteredTransactions.length} dari {filteredTransactions.length} data</span>
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
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Semua Waktu</p>

              <div className="pgBarang__summaryItem"><span>Total Item</span><b>{transactions.reduce((sum, t) => sum + t.itemsCount, 0)} item</b></div>

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

      {/* MODAL DETAIL */}
      {detailModal && (
        <DetailModal
          isOpen={!!detailModal}
          onClose={() => setDetailModal(null)}
          title="Detail Pengeluaran"
          subtitle={`${detailModal.id} • Tujuan: ${detailModal.destination}`}
          details={[
            { label: "Tanggal Dibuat", value: detailModal.date },
            { label: "Status", value: detailModal.status, color: detailModal.status === 'Selesai' ? '#52c41a' : '#1890ff' },
            { label: "No. DO / Referensi", value: detailModal.ref },
            { label: "Tujuan (Cabang/Toko)", value: detailModal.destination },
          ]}
          items={detailModal.itemsText.split(', ')}

        />
      )}
    </div>
  );
}
