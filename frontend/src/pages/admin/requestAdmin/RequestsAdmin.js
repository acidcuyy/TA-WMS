import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import DetailModal from "../../../components/common/DetailModal";
import DateRangePicker from "../../../components/common/DateRangePicker";
import "../PageAdmin.css";
import "./RequestsAdmin.css";
import { subscribeRestockToAdmin, subscribeRequests, adminDecideRestock, subscribeAdminRestockToGudang } from "../../../services/wmsApi";

export default function RequestsAdmin() {
  const [activeTab, setActiveTab] = useState("Dari Toko ke Gudang");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formLocked, setFormLocked] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [actualGudangReqs, setActualGudangReqs] = useState([]);
  const [actualTokoReqs, setActualTokoReqs] = useState([]);
  const [actualAdminReqs, setActualAdminReqs] = useState([]);

  useEffect(() => {
    const unsubGudang = subscribeRestockToAdmin((data) => setActualGudangReqs(data || []));
    const unsubToko = subscribeRequests((data) => setActualTokoReqs(data || []));
    const unsubAdmin = subscribeAdminRestockToGudang((data) => setActualAdminReqs(data || []));
    return () => { unsubGudang(); unsubToko(); unsubAdmin(); };
  }, []);

  // Stats dynamically calculated
  const allRequests = useMemo(() => {
    return [...actualGudangReqs, ...actualTokoReqs, ...actualAdminReqs];
  }, [actualGudangReqs, actualTokoReqs, actualAdminReqs]);

  const stats = useMemo(() => {
    const total = allRequests.length;
    const pending = allRequests.filter(r => r.status === "Menunggu").length;
    const approved = allRequests.filter(r => r.status === "Disetujui").length;
    const shipping = allRequests.filter(r => r.status === "Mengirim" || r.status === "Dalam Pengiriman").length;
    const done = allRequests.filter(r => r.status === "Selesai").length;
    return [
      { label: "Total Request", value: total, hint: "Semua permintaan", icon: "🏪", color: "#e4915a", bg: "#fff8f3" },
      { label: "Menunggu", value: pending, hint: "Perlu diproses", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Disetujui", value: approved, hint: "Disetujui", icon: "⚙️", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Dalam Pengiriman", value: shipping, hint: "Sedang dikirim", icon: "🚚", color: "#52c41a", bg: "#f6ffed" },
      { label: "Selesai", value: done, hint: "Selesai", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
    ];
  }, [allRequests]);

  // Data Request: Dari Admin ke Gudang
  const adminToGudang = actualAdminReqs.map(r => {
    let itemsLabel = r.jumlah ? `${r.jumlah} ${r.satuan || 'pcs'}` : '0';
    let noteStr = r.catatan || "-";

    if (r.confirmationData) {
      itemsLabel = `${r.confirmationData.qtyGood} ${r.satuan || 'pcs'} (Req: ${r.jumlah})`;
      if (Number(r.confirmationData.qtyBad) > 0) {
        noteStr = `Rusak: ${r.confirmationData.qtyBad}. Catatan: ${r.confirmationData.notes}`;
      }
    }

    return {
      id: r.id,
      date: r.createdAt,
      time: "-",
      target: r.toName || r.cabangGudangNama || r.cabangGudang,
      city: "-",
      items: itemsLabel,
      note: noteStr,
      status: r.status,
      createdBy: r.fromName || "Admin / Owner",
      rawData: r // passed for detail modal
    };
  });

  // Data Request: Dari Gudang ke Admin
  const gudangToAdmin = actualGudangReqs.map(r => {
    const qty = r.items ? r.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) : 0;
    return {
      id: r.id,
      date: r.createdAt,
      time: "-",
      source: r.fromName,
      city: "-",
      items: qty,
      note: r.note,
      status: r.status,
      createdBy: r.fromName
    };
  });

  // Data Request: Dari Toko ke Gudang
  const tokoToGudang = actualTokoReqs.map(r => {
    const qty = r.items ? r.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) : 0;
    return {
      id: r.id,
      date: r.createdAt,
      time: "-",
      source: r.fromName,
      target: r.toName,
      city: "-",
      items: qty,
      note: r.note,
      status: r.status,
      createdBy: r.fromRole === 'toko' ? 'Admin Toko' : r.fromName
    };
  });

  const getPillClass = (status) => {
    const s = status.toLowerCase();
    if (s.includes("menunggu")) return "rqAdmin__pill--pending";
    if (s.includes("disetujui")) return "rqAdmin__pill--approved";
    if (s.includes("dalam pengiriman")) return "rqAdmin__pill--ship";
    if (s.includes("selesai")) return "rqAdmin__pill--done";
    if (s.includes("ditolak")) return "rqAdmin__pill--declined";
    return "";
  };

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="rqAdmin__head">
        <div>
          <h1 className="rqAdmin__title">Manajemen Request</h1>
          <p className="rqAdmin__subtitle">
            Kelola semua permintaan stok dalam sistem dari gudang, toko, dan admin ke gudang.
          </p>
        </div>
        <div className="rqAdmin__headRight">
          <span className="mtAdmin__badge mtAdmin__badge--live">
            <span className="mtAdmin__dot" />
            Live Monitoring
          </span>
          <div className="stokAdm__heroBadge">
            <span className="user-icon">👤</span> Admin / Owner <span className="chevron">⌄</span>
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="rqAdmin__stats">
        {stats.map((s, i) => (
          <Card key={i} className="rqAdmin__statCard">
            <div className="rqAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="rqAdmin__statContent">
              <p className="rqAdmin__statLabel">{s.label}</p>
              <h3 className="rqAdmin__statValue">{s.value}</h3>
              <p className="rqAdmin__statHint">{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTER BAR / TABS */}
      <div className="rqAdmin__filterBar">
        <div className="rqAdmin__tabs">
          {[
            { label: "Dari Gudang", count: 12, icon: "🏠" },
            { label: "Dari Toko ke Gudang", count: 27, icon: "⇄" },
            { label: "Dari Admin ke Gudang (Saya)", count: 8, icon: "🛒" },
          ].map((tab) => (
            <div
              key={tab.label}
              className={`rqAdmin__tab ${activeTab === tab.label ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.label)}
            >
              <span>{tab.icon}</span> {tab.label} <span className="rqAdmin__tabCount">{tab.count}</span>
            </div>
          ))}
        </div>

        {activeTab === "Dari Admin ke Gudang (Saya)" && (
          <button className="btn-add-request" onClick={() => setIsAddModalOpen(true)}>
            <span>+</span> Tambahkan Permintaan
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <select className="mpAdmin__select" style={{ minWidth: '140px' }}><option>Semua Status</option></select>
        <DateRangePicker />
      </div>

      {/* TABLE */}
      <div className="rqAdmin__tableCard">
        <div className="rqAdmin__tableWrap">
          <table className="rqAdmin__table">
            <thead>
              <tr>
                <th>ID Request</th>
                <th>Tanggal Request</th>
                <th>{activeTab === "Dari Gudang" ? "Gudang Asal" : activeTab === "Dari Toko ke Gudang" ? "Toko Asal" : "Gudang Tujuan"}</th>
                {activeTab === "Dari Toko ke Gudang" && <th>Gudang Tujuan</th>}
                <th>Total Item</th>
                <th>Catatan</th>
                <th>Status</th>
                <th>Dibuat Oleh</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === "Dari Gudang" ? gudangToAdmin : activeTab === "Dari Toko ke Gudang" ? tokoToGudang : adminToGudang).map((r) => (
                <tr key={r.id}>
                  <td className="rqAdmin__mono">{r.id}</td>
                  <td>
                    <p style={{ fontWeight: 600 }}>{r.date}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{r.time}</p>
                  </td>
                  <td>
                    <p style={{ fontWeight: 700 }}>{r.source || r.target}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{r.city}</p>
                  </td>
                  {activeTab === "Dari Toko ke Gudang" && <td>{r.target}</td>}
                  <td style={{ fontWeight: 600 }}>{r.items} item</td>
                  <td style={{ color: '#666', maxWidth: '200px' }}>{r.note}</td>
                  <td>
                    <span className={`rqAdmin__pill ${getPillClass(r.status)}`}>
                      ● {r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', fontWeight: 600 }}>{r.createdBy}</td>
                  <td>
                    <div className="action-btns">
                      {activeTab === "Dari Gudang" && r.status === "Menunggu" && (
                         <>
                           <button className="btn-icon" style={{color: '#52c41a'}} title="Setujui" onClick={() => adminDecideRestock(r.id, 'Accepted')}>✅</button>
                           <button className="btn-icon" style={{color: '#ff4d4f'}} title="Tolak" onClick={() => adminDecideRestock(r.id, 'Declined')}>❌</button>
                         </>
                      )}
                      <button className="btn-icon" onClick={() => setDetailModal(r)}>👁️</button>
                      <button className="btn-icon">⋮</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 5 dari 8 data</span>
          <div className="pagination">
            <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
            <div className="page-controls">
              <button disabled>⟨</button>
              <button className="active">1</button>
              <button>2</button>
              <button>⟩</button>
            </div>
          </div>
        </footer>
      </div>

      {/* INFO FOOTER */}
      <div className="rqAdmin__infoBox">
        <div className="rqAdmin__infoIcon">ℹ️</div>
        <div className="rqAdmin__infoContent">
          <h4>Tentang Request</h4>
          <p>
            Request adalah permintaan kebutuhan stok yang akan diproses oleh gudang. Anda dapat memantau status permintaan pada masing-masing tab di atas.
          </p>
        </div>
        <button className="btn-learn">Pelajari Alur Request →</button>
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="rqAdmin__overlay" onClick={() => setIsAddModalOpen(false)}>
            <motion.div
              className="rqAdmin__modal"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="rqAdmin__modalHead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <h2 style={{ margin: 0 }}>Tambah Permintaan Restock</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setFormLocked(v => !v)}
                    title={formLocked ? "Buka kunci form" : "Kunci form agar tidak ada yang berubah"}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '5px 12px', borderRadius: '8px', border: '1.5px solid',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      background: formLocked ? '#fff7ed' : '#f8fafc',
                      borderColor: formLocked ? '#f97316' : '#e2e8f0',
                      color: formLocked ? '#f97316' : '#64748b',
                      transition: 'all 0.2s',
                    }}
                  >
                    {formLocked ? '🔒 Terkunci' : '🔓 Kunci Form'}
                  </button>
                  <button onClick={() => { setIsAddModalOpen(false); setFormLocked(false); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              <div className="rqAdmin__form">
                <div className="rqAdmin__formGroup">
                  <label>Gudang Tujuan</label>
                  <select disabled={formLocked} style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}>
                    <option>Pilih Gudang...</option>
                    <option>Gudang Pusat (Jakarta)</option>
                    <option>Gudang Barat (Bandung)</option>
                    <option>Gudang Timur (Lampung)</option>
                  </select>
                </div>
                <div className="rqAdmin__formGroup">
                  <label>Barang yang Diminta</label>
                  <textarea placeholder="Contoh: Lampu LED 12W (100 pcs), Kabel NYM (50 roll)..." rows={4} disabled={formLocked} style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}></textarea>
                </div>
                <div className="rqAdmin__formGroup">
                  <label>Catatan (Opsional)</label>
                  <input placeholder="Tambahkan catatan untuk staf gudang..." disabled={formLocked} style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }} />
                </div>
                <div className="rqAdmin__modalFoot">
                  <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setIsAddModalOpen(false); setFormLocked(false); }}>Batal</button>
                  <button className="btn-primary" style={{ flex: 2, opacity: formLocked ? 0.5 : 1, cursor: formLocked ? 'not-allowed' : 'pointer' }} onClick={formLocked ? undefined : () => { setIsAddModalOpen(false); setFormLocked(false); }} disabled={formLocked}>{formLocked ? '🔒 Form Terkunci' : 'Kirim Permintaan'}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* DETAIL MODAL */}
      <DetailModal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Detail Request"
        subtitle={detailModal ? `${detailModal.id} • ${detailModal.source} ➔ ${detailModal.target}` : ''}
        details={detailModal ? [
          { label: "Tanggal & Waktu", value: `${detailModal.date} ${detailModal.time}` },
          { label: "Status", value: detailModal.status, color: detailModal.status === 'Selesai' || detailModal.status === 'Accepted' ? '#52c41a' : detailModal.status === 'Ditolak' || detailModal.status === 'Declined' ? '#ff4d4f' : '#1890ff' },
          { label: "Dibuat Oleh", value: detailModal.createdBy },
          { label: "Catatan", value: detailModal.rawData?.catatan || detailModal.note || "-" },
          ...(detailModal.rawData?.confirmationData ? [
            { label: "Diterima Baik", value: `${detailModal.rawData.confirmationData.qtyGood} ${detailModal.rawData.satuan || ''}`, color: '#52c41a' },
            ...(Number(detailModal.rawData.confirmationData.qtyBad) > 0 ? [
              { label: "Barang Rusak", value: `${detailModal.rawData.confirmationData.qtyBad} ${detailModal.rawData.satuan || ''}`, color: '#ff4d4f' },
              { label: "Catatan Gudang", value: detailModal.rawData.confirmationData.notes, color: '#ff4d4f' }
            ] : [])
          ] : [])
        ] : []}
        itemsTitle="Daftar Kebutuhan"
        items={detailModal ? [
          detailModal.rawData?.confirmationData 
            ? `${detailModal.rawData.confirmationData.qtyGood} Item (Diterima) / ${detailModal.rawData.jumlah} Item (Diminta)`
            : `${detailModal.rawData?.jumlah || detailModal.items} Item (Kalkulasi otomatis dari sistem)`
        ] : []}
      />
    </div>
  );
}
