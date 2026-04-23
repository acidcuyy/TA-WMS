import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./RequestsAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function RequestsAdmin() {
  const [activeTab, setActiveTab] = useState("Dari Admin ke Gudang (Saya)");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stats
  const stats = [
    { label: "Total Request", value: 72, hint: "Semua permintaan", icon: "🏪", color: "#e4915a", bg: "#fff8f3" },
    { label: "Menunggu", value: 24, hint: "Perlu diproses", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Disetujui", value: 36, hint: "Disetujui", icon: "⚙️", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Dalam Pengiriman", value: 8, hint: "Sedang dikirim", icon: "🚚", color: "#52c41a", bg: "#f6ffed" },
    { label: "Selesai", value: 4, hint: "Selesai", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
  ];

  // Data Request: Dari Admin ke Gudang
  const adminToGudang = [
    { id: "REQ-ADM-0008", date: "03 Feb 2026", time: "10:30", target: "Gudang Pusat", city: "Jakarta", items: 12, note: "Restock lampu LED untuk promosi toko", status: "Menunggu", createdBy: "Admin / Owner" },
    { id: "REQ-ADM-0007", date: "02 Feb 2026", time: "15:20", target: "Gudang Barat", city: "Bandung", items: 8, note: "Permintaan kabel & stop kontak", status: "Disetujui", createdBy: "Admin / Owner" },
    { id: "REQ-ADM-0006", date: "01 Feb 2026", time: "09:15", target: "Gudang Timur", city: "Lampung", items: 15, note: "Restock cat tembok berbagai warna", status: "Dalam Pengiriman", createdBy: "Admin / Owner" },
    { id: "REQ-ADM-0005", date: "31 Jan 2026", time: "16:45", target: "Gudang Pusat", city: "Jakarta", items: 20, note: "Permintaan barang untuk event weekend", status: "Selesai", createdBy: "Admin / Owner" },
    { id: "REQ-ADM-0004", date: "30 Jan 2026", time: "11:10", target: "Gudang Barat", city: "Bandung", items: 6, note: "Tambahan fitting lampu dan saklar", status: "Ditolak", createdBy: "Admin / Owner" },
  ];

  // Data Request: Dari Gudang ke Admin
  const gudangToAdmin = [
    { id: "REQ-GUD-0012", date: "03 Feb 2026", time: "14:15", source: "Gudang Pusat", city: "Jakarta", items: 50, note: "Stok semen habis total", status: "Menunggu", createdBy: "Staff Gudang" },
    { id: "REQ-GUD-0011", date: "02 Feb 2026", time: "09:00", source: "Gudang Timur", city: "Lampung", items: 100, note: "Pipa PVC menipis", status: "Disetujui", createdBy: "Staff Gudang" },
  ];

  // Data Request: Dari Toko ke Gudang
  const tokoToGudang = [
    { id: "REQ-TKO-0027", date: "03 Feb 2026", time: "11:45", source: "Toko A", target: "Gudang Pusat", items: 10, note: "Butuh gembok untuk stok toko", status: "Menunggu", createdBy: "Admin Toko" },
    { id: "REQ-TKO-0026", date: "02 Feb 2026", time: "16:30", source: "Toko B", target: "Gudang Barat", items: 5, note: "Restock sealant silicone", status: "Dalam Pengiriman", createdBy: "Admin Toko" },
  ];

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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
         <select className="mpAdmin__select" style={{ minWidth: '140px' }}><option>Semua Status</option></select>
         <div className="date-filter" style={{ border: '1px solid var(--border)', background: 'var(--bg)', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}>
           Pilih Tanggal 📅
         </div>
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
              <div className="rqAdmin__modalHead">
                <h2>Tambah Permintaan Restock</h2>
                <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="rqAdmin__form">
                <div className="rqAdmin__formGroup">
                  <label>Gudang Tujuan</label>
                  <select>
                    <option>Pilih Gudang...</option>
                    <option>Gudang Pusat (Jakarta)</option>
                    <option>Gudang Barat (Bandung)</option>
                    <option>Gudang Timur (Lampung)</option>
                  </select>
                </div>
                <div className="rqAdmin__formGroup">
                  <label>Barang yang Diminta</label>
                  <textarea placeholder="Contoh: Lampu LED 12W (100 pcs), Kabel NYM (50 roll)..." rows={4}></textarea>
                </div>
                <div className="rqAdmin__formGroup">
                  <label>Catatan (Opsional)</label>
                  <input placeholder="Tambahkan catatan untuk staf gudang..." />
                </div>
                <div className="rqAdmin__modalFoot">
                  <button className="btn-outline" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>Batal</button>
                  <button className="btn-primary" style={{ flex: 2 }} onClick={() => setIsAddModalOpen(false)}>Kirim Permintaan</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
