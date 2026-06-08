import { useState, useEffect, useMemo } from "react";
import Card from "../../../components/common/Card";
import DetailModal from "../../../components/common/DetailModal";
import DateRangePicker from "../../../components/common/DateRangePicker";
import { subscribeRestockToAdmin, subscribeAdminRestockToGudang } from "../../../services/wmsApi";
import "./PenerimaanBarangGudang.css";

export default function PenerimaanBarang() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [sourceFilter, setSourceFilter] = useState("Semua Sumber");
  const [allRestocks, setAllRestocks] = useState([]);
  const [adminRestocks, setAdminRestocks] = useState([]);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const unsub1 = subscribeRestockToAdmin((data) => setAllRestocks(data || []));
    const unsub2 = subscribeAdminRestockToGudang((data) => setAdminRestocks(data || []));
    return () => { unsub1(); unsub2(); };
  }, []);

  const receipts = useMemo(() => {
    const combined = [];

    // Map Gudang -> Admin restocks
    allRestocks.forEach(r => {
      let totalItems = 0;
      let value = 0;
      let itemsList = [];

      (r.items || []).forEach(it => {
        totalItems += it.qty;
        // Mock price based on category
        const p = it.category === "Elektronik" ? 450000 : it.category === "Minuman" ? 8000 : 25000;
        value += it.qty * p;
        itemsList.push(`${it.name} (${it.sku || "SAK-" + Math.floor(Math.random()*1000)}) x${it.qty}`);
      });

      let statusLabel = r.status;
      if (statusLabel === "Diproses") statusLabel = "Proses";
      if (statusLabel === "Pending") statusLabel = "Menunggu";

      combined.push({
        id: r.id,
        po: `PO-${r.id.split('-')[1] || r.id}`,
        supplier: r.supplierName || r.supplier || "Supplier Utama",
        date: new Date(r.createdAt || new Date()).toLocaleString("id-ID", {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        itemsCount: totalItems,
        itemsText: itemsList.join(', '),
        value,
        status: statusLabel,
        rawStatus: r.status,
        source: 'Gudang'
      });
    });

    // Map Admin -> Gudang restocks
    adminRestocks.forEach(r => {
      let totalItems = r.jumlah || 0;
      const p = r.jenisBarang === "Elektronik" ? 450000 : r.jenisBarang === "Minuman" ? 8000 : 25000;
      let value = totalItems * p;
      let itemsList = [`${r.namaBarang} (${r.kodeBarang}) x${r.jumlah}`];

      let statusLabel = r.status;
      if (statusLabel === "Diproses") statusLabel = "Proses";
      if (statusLabel === "Pending") statusLabel = "Menunggu";

      combined.push({
        id: r.id,
        po: `PO-${r.id.split('-')[1] || r.id}`,
        supplier: r.supplier || "Supplier Utama",
        date: new Date(r.createdAt || new Date()).toLocaleString("id-ID", {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        itemsCount: totalItems,
        itemsText: itemsList.join(', '),
        value,
        status: statusLabel,
        rawStatus: r.status,
        source: 'Admin'
      });
    });

    // Sort combined by date descending (latest first)
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allRestocks, adminRestocks]);

  const filteredReceipts = useMemo(() => {
    let result = receipts;
    if (activeTab !== "Semua") {
      result = result.filter(r => r.status === activeTab);
    }
    if (sourceFilter !== "Semua Sumber") {
      const targetSource = sourceFilter === "Dari Gudang" ? "Gudang" : "Admin";
      result = result.filter(r => r.source === targetSource);
    }
    return result;
  }, [receipts, activeTab, sourceFilter]);

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
      </header>

      {/* STATS */}
      <div className="pbGudang__stats">
        {[
          { label: "Total Penerimaan", value: receipts.length, sub: "Transaksi", hint: "Dari keseluruhan data", icon: "⬇️", color: "#1890ff", bg: "#e6f7ff" },
          { label: "Total Item Diterima", value: receipts.filter(r => r.status === "Selesai").reduce((sum, r) => sum + r.itemsCount, 0), sub: "Item", hint: "Yang sudah selesai", icon: "📦", color: "#52c41a", bg: "#f6ffed" },

          { label: "Dalam Proses", value: receipts.filter(r => r.status === "Proses").length, sub: "Transaksi", hint: "Sedang dikirim Admin", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
          { label: "Menunggu Acc", value: receipts.filter(r => r.status === "Menunggu").length, sub: "Transaksi", hint: "Menunggu Admin", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
        ].map((s, i) => (
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
        <select className="moAdmin__select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option>Semua Sumber</option>
          <option>Dari Admin</option>
          <option>Dari Gudang</option>
        </select>
        <select className="moAdmin__select"><option>Semua Status</option></select>
        <DateRangePicker />
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
        {["Semua", "Menunggu", "Proses", "Selesai", "Ditolak"].map(tab => {
          const count = tab === "Semua" ? receipts.length : receipts.filter(r => r.status === tab).length;
          return (
            <div
              key={tab}
              className={`pbGudang__tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span className="pbGudang__tabCount">({count})</span>
            </div>
          )
        })}
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
                  <th>Daftar Barang (SKU)</th>

                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                      Belum ada data penerimaan.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#888' }}>🚚</span> {r.id}
                        </div>
                        <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: r.source === 'Admin' ? '#e6f7ff' : '#f6ffed', color: r.source === 'Admin' ? '#1890ff' : '#52c41a', fontWeight: 'bold' }}>
                          {r.source === 'Admin' ? 'ADMIN ➔ GUDANG' : 'GUDANG ➔ ADMIN'}
                        </span>
                      </td>
                      <td className="rqAdmin__mono" style={{ fontSize: '11px' }}>{r.po}</td>
                      <td style={{ fontWeight: 700 }}>{r.supplier}</td>
                      <td style={{ fontSize: '12px', color: '#888' }}>{r.date}</td>
                      <td style={{ fontSize: '11px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.itemsText}>
                        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{r.itemsCount} item total</div>
                        <div style={{ color: '#64748b' }}>{r.itemsText}</div>
                      </td>

                      <td>
                        <span className={`rqAdmin__pill ${r.status === 'Selesai' ? 'rqAdmin__pill--approved' : r.status === 'Proses' ? 'rqAdmin__pill--ship' : r.status === 'Ditolak' ? 'rqAdmin__pill--declined' : 'rqAdmin__pill--pending'}`}>
                          ● {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn-icon" onClick={() => setDetailModal(r)}>👁️</button>
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
            <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - {filteredReceipts.length} dari {filteredReceipts.length} data</span>
            <div className="pagination">
              <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
              <div className="page-controls">
                <button disabled>⟨</button>
                <button className="active">1</button>
                <button disabled>⟩</button>
              </div>
            </div>
          </footer>
        </div>

        <div className="pbGudang__sideStack">
          <div className="pbGudang__sideCard">
            <div className="pbGudang__sideHead">
              <h3>Ringkasan Penerimaan</h3>
            </div>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Semua Waktu</p>

            <div className="pbGudang__summaryItem"><span>Total Item</span><b>{receipts.reduce((sum, r) => sum + r.itemsCount, 0)} item</b></div>

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
      {/* MODAL DETAIL */}
      {detailModal && (
        <DetailModal
          isOpen={!!detailModal}
          onClose={() => setDetailModal(null)}
          title="Detail Penerimaan"
          subtitle={`${detailModal.id} • ${detailModal.source === 'Admin' ? 'Instruksi Admin' : 'Request Gudang'}`}
          details={[
            { label: "Tanggal Terima", value: detailModal.date },
            { label: "Status", value: detailModal.status, color: detailModal.status === 'Selesai' ? '#52c41a' : '#1890ff' },
            { label: "No. PO/Referensi", value: detailModal.po },
            { label: "Supplier", value: detailModal.supplier },
          ]}
          items={detailModal.itemsText.split(', ')}

        />
      )}
    </div>
  );
}
