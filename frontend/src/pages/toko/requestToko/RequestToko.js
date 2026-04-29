import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./RequestToko.css";
import {
  createTokoRequest,
  subscribeRequests,
  tokoSelesaiTerima,
} from "../../../services/wmsApi";

const getBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (!s || s.includes("menunggu") || s.includes("pending")) return "badge--pending";
  if (s.includes("accepted")) return "badge--accepted";
  if (s.includes("mengirim") || s.includes("ship")) return "badge--ship";
  if (s.includes("selesai") || s.includes("done")) return "badge--done";
  if (s.includes("ditolak") || s.includes("declined")) return "badge--declined";
  if (s.includes("proses") || s.includes("processing")) return "badge--process";
  return "";
};

export default function RequestToko() {
  const navigate = useNavigate();
  const [allReq, setAllReq] = useState([]);
  const [kode, setKode] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [catatan, setCatatan] = useState("");

  const easing = [0.22, 1, 0.36, 1];

  useEffect(() => {
    const unsub = subscribeRequests((rows) => setAllReq(rows || []));
    return () => typeof unsub === "function" && unsub();
  }, []);

  const tokoReq = useMemo(() => {
    return allReq.filter((r) => (r.fromRole || "").toLowerCase() === "toko");
  }, [allReq]);

  const stats = useMemo(() => {
    const total = tokoReq.length;
    const pending = tokoReq.filter(r => (r.status || "").toLowerCase().includes("menunggu") || (r.status || "").toLowerCase().includes("pending")).length;
    const process = tokoReq.filter(r => (r.status || "").toLowerCase().includes("proses") || (r.status || "").toLowerCase().includes("accepted")).length;
    const shipping = tokoReq.filter(r => (r.status || "").toLowerCase().includes("mengirim")).length;
    const done = tokoReq.filter(r => (r.status || "").toLowerCase().includes("selesai")).length;
    return { total, pending, process, shipping, done };
  }, [tokoReq]);

  const sendRequest = async () => {
    if (!kode || !jumlah) return;
    await createTokoRequest({
      fromName: "Toko",
      items: [{ code: kode, qty: Number(jumlah) || 0 }],
      note: catatan,
    });
    setKode("");
    setJumlah("");
    setCatatan("");
  };

  const lihatPengiriman = (id) => {
    navigate(`/toko/pengiriman/${id}`);
  };

  const selesaiTerima = async (id) => {
    await tokoSelesaiTerima(id);
  };

  const summaryCards = [
    { label: "Total Request", value: stats.total, unit: "Permintaan", icon: "📝", iconClass: "summary-card__icon--purple" },
    { label: "Menunggu ACC", value: stats.pending, unit: "Pending", icon: "⏳", iconClass: "summary-card__icon--orange" },
    { label: "Dalam Proses", value: stats.process, unit: "Gudang", icon: "🏭", iconClass: "summary-card__icon--blue" },
    { label: "Dalam Pengiriman", value: stats.shipping, unit: "Kurir", icon: "🚚", iconClass: "summary-card__icon--cyan" },
    { label: "Selesai", value: stats.done, unit: "Diterima", icon: "✅", iconClass: "summary-card__icon--green" },
  ];

  return (
    <div className="request-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="request-toko__header">
          <div className="request-toko__title-section">
            <h1>Request Stok</h1>
            <p>Kirim permintaan stok barang ke gudang pusat dan pantau status pemenuhannya.</p>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="request-toko__summary">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={idx}
              className="summary-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05, duration: 0.5 }}
            >
              <div className="summary-card__head">
                <div className={`summary-card__icon ${card.iconClass}`}>{card.icon}</div>
                <span className="summary-card__label">{card.label}</span>
              </div>
              <h2 className="summary-card__value">{card.value} <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{card.unit}</span></h2>
            </motion.div>
          ))}
        </section>

        <div className="request-toko__main">
          <div className="request-left-col">
            {/* FORM CARD */}
            <section className="request-form-card">
              <div className="form-title">Buat Request Baru</div>
              <p className="form-sub">Isi detail barang yang Anda butuhkan dari gudang pusat.</p>

              <div className="form-grid">
                <div className="input-group">
                  <label>Kode Barang</label>
                  <input
                    className="input-field"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="Contoh: BRG-002"
                  />
                </div>
                <div className="input-group">
                  <label>Jumlah</label>
                  <input
                    className="input-field"
                    type="number"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "16px" }}>
                <label>Catatan (Opsional)</label>
                <input
                  className="input-field"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Untuk stok promo weekend"
                />
              </div>

              <button className="btn-submit" onClick={sendRequest} style={{ width: "100%", marginTop: "24px" }}>
                Kirim Request ke Gudang
              </button>
            </section>

            {/* LIST CARD */}
            <section className="request-list-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div className="form-title">Daftar Riwayat Request</div>
                <div className="filter-search" style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "4px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px" }}>🔍</span>
                  <input placeholder="Cari ID atau produk..." style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px" }} />
                </div>
              </div>

              <table className="request-table">
                <thead>
                  <tr>
                    <th>ID Request</th>
                    <th>Tanggal</th>
                    <th>Produk & Catatan</th>
                    <th>Keputusan</th>
                    <th>Status Alur</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tokoReq.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Belum ada data request.</td></tr>
                  ) : (
                    tokoReq.map((r, idx) => {
                      const date = (r.createdAt || "").split("T")[0] || "-";
                      const item = r.items?.[0];
                      const itemText = item ? `${item.code} (${item.qty})` : "-";
                      const status = (r.status || "").toLowerCase();
                      const canSeeTrack = status.includes("mengirim");
                      const canFinish = status.includes("mengirim");
                      const done = status.includes("selesai");

                      return (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05 }}
                        >
                          <td style={{ fontWeight: 600 }}>{r.id}</td>
                          <td>{date}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{itemText}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{r.note || "-"}</div>
                          </td>
                          <td>
                            <span className={`badge ${r.decision?.toLowerCase() === 'accepted' ? 'badge--accepted' : r.decision?.toLowerCase() === 'declined' ? 'badge--declined' : 'badge--pending'}`}>
                              {r.decision || "Pending"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getBadgeClass(r.status)}`}>
                              {r.status || "Menunggu"}
                            </span>
                          </td>
                          <td>
                            <div className="action-group">
                              {!done && (
                                <>
                                  {canSeeTrack && (
                                    <button className="btn-action-small" onClick={() => lihatPengiriman(r.id)}>Lacak</button>
                                  )}
                                  {canFinish && (
                                    <button className="btn-action-small primary" onClick={() => selesaiTerima(r.id)}>Selesai</button>
                                  )}
                                </>
                              )}
                              {done && <span style={{ color: "#94a3b8", fontSize: "11px" }}>Terselesaikan</span>}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="request-sidebar">
            <div className="sidebar-widget">
              <h3 className="widget-title">Panduan Request</h3>
              <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                <li>Gunakan kode barang yang valid (SKU).</li>
                <li>Gudang akan meninjau stok yang tersedia.</li>
                <li>Setelah disetujui, status akan menjadi "Proses".</li>
                <li>Tombol "Selesai" muncul saat barang dikirim.</li>
              </ul>
            </div>

            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Aktivitas Terbaru</h3>
                <a href="#" style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 600 }}>Lihat Semua</a>
              </div>
              <div className="activity-list">
                {tokoReq.slice(0, 4).map(r => (
                  <div key={r.id} className="activity-item">
                    <div className="activity-icon" style={{ background: "#f8fafc" }}>
                      {r.status?.includes("selesai") ? "✅" : "📄"}
                    </div>
                    <div className="activity-content">
                      <span className="activity-name">Request {r.id}</span>
                      <span className="activity-sub">{r.status || "Baru dibuat"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}
