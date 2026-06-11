import { useState, useMemo, useEffect } from "react";
import Card from "../../../components/common/Card";
import DetailModal from "../../../components/common/DetailModal";
import DateRangePicker from "../../../components/common/DateRangePicker";
import { subscribeRequests, subscribeNotifications } from "../../../services/wmsApi";
import "./TransferBarang.css";

export default function TransferBarang() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [detailModal, setDetailModal] = useState(null);

  const [allRequests, setAllRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubReq = subscribeRequests(data => setAllRequests(data || []));
    const unsubNotif = subscribeNotifications(data => setNotifications(data || []));
    return () => { unsubReq(); unsubNotif(); };
  }, []);

  const transfers = useMemo(() => {
    return allRequests.map(r => ({
      id: r.id.replace('REQ', 'TR'), 
      rawId: r.id,
      date: new Date(r.createdAt || new Date()).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      from: r.toName || "Gudang",
      to: r.fromName || "Toko",
      items: r.items ? r.items.reduce((acc, it) => acc + (it.qty || 0), 0) : 0,
      value: r.items ? r.items.reduce((acc, it) => acc + (it.qty * 25000), 0) : 0,
      status: r.status === "Selesai" || r.status === "Diterima Toko" ? "Selesai" : r.status === "Mengirim" ? "Dalam Pengiriman" : r.status === "Declined" ? "Dibatalkan" : r.status === "Accepted" ? "Disetujui" : "Menunggu",
      est: r.status === "Selesai" || r.status === "Diterima Toko" ? "-" : "Segera",
    }));
  }, [allRequests]);

  const filteredTransfers = useMemo(() => {
    if (activeTab === "Semua") return transfers;
    return transfers.filter(t => t.status === activeTab);
  }, [transfers, activeTab]);

  const stats = useMemo(() => {
    const total = transfers.length;
    const totalItems = transfers.reduce((sum, t) => sum + t.items, 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayTransfers = allRequests.filter(r => r.createdAt && r.createdAt.slice(0, 10) === today).length;
    const shipping = transfers.filter(t => t.status === "Dalam Pengiriman").length;

    return [
      { label: "Total Transfer", value: total.toString(), sub: "Transaksi", hint: "Keseluruhan", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Total Item Ditransfer", value: totalItems.toLocaleString('id-ID'), sub: "Item", hint: "Keseluruhan", icon: "📦", color: "#52c41a", bg: "#f6ffed" },
      { label: "Transfer Hari Ini", value: todayTransfers.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🚚", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Dalam Pengiriman", value: shipping.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    ];
  }, [transfers, allRequests]);

  const topDestinations = useMemo(() => {
    const map = {};
    let totalItems = 0;
    transfers.forEach(t => {
      map[t.to] = (map[t.to] || 0) + t.items;
      totalItems += t.items;
    });
    const colors = ["#52c41a", "#fa8c16", "#1890ff", "#722ed1", "#13c2c2"];
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, val], i) => ({
        label,
        val: val.toString(),
        pct: totalItems > 0 ? ((val / totalItems) * 100).toFixed(1) : 0,
        color: colors[i % colors.length]
      }));
  }, [transfers]);

  const activities = useMemo(() => {
    return notifications
      .filter(n => n.targetRoles?.includes("gudang") && n.type?.includes("transfer"))
      .slice(0, 5)
      .map(n => ({
        title: n.title,
        sub: n.message,
        time: n.time || new Date(n.date || new Date()).toLocaleString(),
        color: n.type?.includes("done") ? "#52c41a" : "#1890ff",
        icon: n.type?.includes("done") ? "✅" : "⇄"
      }));
  }, [notifications]);

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
          <DateRangePicker />
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
            { name: "Semua", count: transfers.length },
            { name: "Menunggu", count: transfers.filter(t => t.status === "Menunggu").length },
            { name: "Disetujui", count: transfers.filter(t => t.status === "Disetujui").length },
            { name: "Dalam Pengiriman", count: transfers.filter(t => t.status === "Dalam Pengiriman").length },
            { name: "Selesai", count: transfers.filter(t => t.status === "Selesai").length },
            { name: "Dibatalkan", count: transfers.filter(t => t.status === "Dibatalkan").length }
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

                      <th>Status</th>
                      <th>Tgl. Estimasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          Belum ada data transfer.
                        </td>
                      </tr>
                    ) : filteredTransfers.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setDetailModal(t)}>
                          <span style={{ fontSize: '14px', color: '#1890ff' }}>⇄</span> {t.id}
                        </td>
                        <td style={{ fontSize: '12px', color: '#888' }}>{t.date}</td>
                        <td style={{ fontWeight: 600 }}>{t.from}</td>
                        <td style={{ fontWeight: 600 }}>{t.to}</td>
                        <td>{t.items} item</td>

                        <td>
                          <span className={`status-pill ${getStatusClass(t.status)}`}>
                            ● {t.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#888' }}>{t.est}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - {filteredTransfers.length} dari {filteredTransfers.length} data</span>
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
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Semua Waktu</p>
                <div className="trBarang__summaryItem"><span>Total Transfer</span><b>{transfers.length}</b></div>
                <div className="trBarang__summaryItem"><span>Total Item Ditransfer</span><b>{transfers.reduce((sum, t) => sum + t.items, 0)} item</b></div>
              </div>

              <div className="trBarang__sideCard">
                <div className="trBarang__sideHead">
                  <h3>Transfer per Tujuan (Top 5)</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                      {topDestinations.map((s, i) => {
                        const prevPcts = topDestinations.slice(0, i).reduce((sum, sp) => sum + Number(sp.pct), 0);
                        return (
                          <circle 
                            key={i} cx="18" cy="18" r="16" fill="none" stroke={s.color} strokeWidth="4" 
                            strokeDasharray={`${Number(s.pct)} 100`} strokeDashoffset={-prevPcts} 
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {topDestinations.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#888", fontSize: "11px" }}>Belum ada data</div>
                    ) : topDestinations.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginRight: '8px' }}></span>
                        <span style={{ flex: 1, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                        <span style={{ width: '20px', textAlign: 'right', marginRight: '8px' }}>{s.val}</span>
                        <span style={{ fontWeight: 700 }}>({s.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="trBarang__sideCard">
                <div className="trBarang__sideHead"><h3>Aktivitas Terbaru</h3><button className="btn-text">Lihat Semua</button></div>
                <div className="gdash__timeline">
                  {activities.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: "12px" }}>Belum ada aktivitas terbaru</div>
                  ) : activities.map((a, i) => (
                    <div key={i} className="gdash__timeItem">
                      <div className="gdash__alertIcon" style={{ width: '32px', height: '32px', background: `${a.color}15`, color: a.color, fontSize: '14px' }}>{a.icon}</div>
                      <div className="gdash__timeContent">
                        <p className="gdash__timeTitle" style={{ fontSize: '12px' }}>{a.title}</p>
                        <p className="gdash__timeSub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{a.sub}</p>
                        <p className="gdash__timeSub" style={{ fontSize: '10px' }}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <DetailModal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Detail Transfer Barang"
        subtitle={detailModal ? `${detailModal.id} • Tgl: ${detailModal.date}` : ''}
        details={detailModal ? [
          { label: "Asal", value: detailModal.from },
          { label: "Tujuan", value: detailModal.to },
          { label: "Status", value: detailModal.status, color: detailModal.status === 'Selesai' ? '#52c41a' : detailModal.status === 'Dibatalkan' ? '#ff4d4f' : '#1890ff' },
          { label: "Estimasi Tiba", value: detailModal.est },
        ] : []}
        itemsTitle="Total Item"
        items={detailModal ? [`${detailModal.items} item (Detail tidak tersedia di mode riwayat)`] : []}

      />
    </div>
  );
}
