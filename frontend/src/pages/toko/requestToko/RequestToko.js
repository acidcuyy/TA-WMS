import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./RequestToko.css";
import {
  createTokoRequest,
  subscribeRequests,
  tokoSelesaiTerima,
  subscribeBranches,
} from "../../../services/wmsApi";

const getBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (!s || s.includes("menunggu") || s.includes("pending")) return "badge--pending";
  if (s.includes("accepted")) return "badge--accepted";
  if (s.includes("mengirim") || s.includes("ship")) return "badge--ship";
  if (s.includes("siap")) return "badge--ready";
  if (s.includes("selesai") || s.includes("done")) return "badge--done";
  if (s.includes("declined") || s.includes("ditolak")) return "badge--declined";
  if (s.includes("memproses") || s.includes("processing")) return "badge--process";
  return "";
};

export default function RequestToko() {
  const navigate = useNavigate();
  const [allReq, setAllReq] = useState([]);
  const [branches, setBranches] = useState([]);
  const [kode, setKode] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [catatan, setCatatan] = useState("");
  const [targetGudang, setTargetGudang] = useState("");

  // Confirmation Modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Proof Modal
  const [showProof, setShowProof] = useState(false);
  const [proofImg, setProofImg] = useState(null);

  const easing = [0.22, 1, 0.36, 1];

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubBranch = subscribeBranches((rows) => {
      const gudangs = rows.filter(b => b.type === 'gudang');
      setBranches(gudangs);
      if (gudangs.length > 0 && !targetGudang) setTargetGudang(gudangs[0].id);
    });
    return () => {
      unsubReq();
      unsubBranch();
    };
  }, [targetGudang]);

  const openProof = (img) => {
    setProofImg(img);
    setShowProof(true);
  };

  const tokoReq = useMemo(() => {
    return allReq.filter((r) => (r.fromRole || "").toLowerCase() === "toko");
  }, [allReq]);

  const stats = useMemo(() => {
    const total = tokoReq.length;
    const pending = tokoReq.filter(r => (r.status || "").toLowerCase().includes("menunggu")).length;
    const process = tokoReq.filter(r => (r.status || "").toLowerCase().includes("memproses")).length;
    const shipping = tokoReq.filter(r => (r.status || "").toLowerCase().includes("mengirim")).length;
    const done = tokoReq.filter(r => (r.status || "").toLowerCase().includes("selesai")).length;
    return { total, pending, process, shipping, done };
  }, [tokoReq]);

  const sendRequest = async () => {
    if (!kode || !jumlah || !targetGudang) return;
    const branch = branches.find(b => b.id === targetGudang);
    await createTokoRequest({
      fromName: "Toko Utama", // Cabang toko yang sedang login
      toBranchId: targetGudang,
      toBranchName: branch?.name || "Gudang",
      items: [{ code: kode, qty: Number(jumlah) || 0 }],
      note: catatan,
    });
    setKode("");
    setJumlah("");
    setCatatan("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitTerima = async () => {
    if (!selectedFile) return alert("Pilih foto bukti terlebih dahulu!");
    await tokoSelesaiTerima(confirmId, selectedFile);
    setShowConfirm(false);
    setConfirmId(null);
    setSelectedFile(null);
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
              <p className="form-sub">Pilih gudang dan isi detail barang yang Anda butuhkan.</p>

              <div className="form-grid">
                <div className="input-group">
                  <label>Pilih Gudang</label>
                  <select
                    className="input-field"
                    value={targetGudang}
                    onChange={(e) => setTargetGudang(e.target.value)}
                  >
                    {branches.length === 0 && <option value="">Memuat gudang...</option>}
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Kode Barang</label>
                  <input
                    className="input-field"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="Contoh: BRG-002"
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '15px' }}>
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
                <div className="input-group">
                  <label>Catatan (Opsional)</label>
                  <input
                    className="input-field"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Untuk stok promo weekend"
                  />
                </div>
              </div>

              <button className="btn-submit" style={{ marginTop: '20px' }} onClick={sendRequest}>
                Kirim Request ke Gudang
              </button>
            </section>

            {/* LIST CARD */}
            <section className="request-list-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div className="form-title">Daftar Riwayat Request</div>
              </div>

              <table className="request-table">
                <thead>
                  <tr>
                    <th>ID Request</th>
                    <th>Tujuan</th>
                    <th>Produk & Catatan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tokoReq.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Belum ada data request.</td></tr>
                  ) : (
                    tokoReq.map((r, idx) => {
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
                          <td>{r.toName || "Gudang"}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{itemText}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{r.note || "-"}</div>
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
                                    <button className="btn-action-small" onClick={() => navigate(`/toko/pengiriman/${r.id}`)}>Lihat Pengiriman</button>
                                  )}
                                  {canFinish && (
                                    <button className="btn-action-small primary" onClick={() => { setConfirmId(r.id); setShowConfirm(true); }}>Terima Barang</button>
                                  )}
                                </>
                              )}
                              {done && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ color: "#52c41a", fontSize: "11px", fontWeight: 600 }}>Diterima</span>
                                  {r.proofImage && (
                                    <span
                                      style={{ fontSize: '10px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                      onClick={() => openProof(r.proofImage)}
                                    >
                                      Lihat Bukti
                                    </span>
                                  )}
                                </div>
                              )}
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
              <h3 className="widget-title">Alur Request Barang</h3>
              <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.8" }}>
                <li><b>1. Request:</b> Toko memilih gudang dan input barang.</li>
                <li><b>2. Approval:</b> Gudang menyetujui (Status: Memproses).</li>
                <li><b>3. Persiapan:</b> Gudang menyiapkan barang (Status: Siap Dikirim).</li>
                <li><b>4. Pengiriman:</b> Driver mengambil tugas (Status: Mengirim).</li>
                <li><b>5. Pelacakan:</b> Pantau posisi driver di Maps secara realtime.</li>
                <li><b>6. Selesai:</b> Toko klik Terima Barang & upload bukti foto.</li>
              </ul>
            </div>
          </aside>
        </div>
      </motion.div>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirm && (
          <div className="mgAdmin__modalOverlay" onClick={() => setShowConfirm(false)}>
            <motion.div
              className="mgAdmin__modal"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ maxWidth: '440px' }}
            >
              <div className="mgAdmin__modalHead">
                <h3><span>📸</span> Konfirmasi Penerimaan</h3>
                <button className="mgAdmin__modalClose" onClick={() => setShowConfirm(false)}>✕</button>
              </div>
              <div className="mgAdmin__modalBody">
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
                  Silakan upload foto bukti bahwa barang telah diterima dalam kondisi baik untuk menyelesaikan pesanan.
                </p>
                <div
                  className="upload-area"
                  style={{ border: '2px dashed #cbd5e1', borderRadius: '20px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s' }}
                  onClick={() => document.getElementById('proof-upload').click()}
                >
                  {selectedFile ? (
                    <img src={selectedFile} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
                  ) : (
                    <>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📤</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>Klik untuk Pilih Foto</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Ambil foto barang yang Anda terima</div>
                    </>
                  )}
                  <input type="file" id="proof-upload" hidden accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
              <div className="mgAdmin__modalFooter">
                <button className="mgAdmin__btnAction mgAdmin__btnAction--cancel" onClick={() => setShowConfirm(false)}>Batal</button>
                <button className="mgAdmin__btnAction mgAdmin__btnAction--save" onClick={submitTerima}>Kirim & Selesai</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROOF VIEW MODAL */}
      <AnimatePresence>
        {showProof && (
          <div className="mgAdmin__modalOverlay" onClick={() => setShowProof(false)}>
            <motion.div
              className="mgAdmin__modal"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="mgAdmin__modalHead">
                <h3><span>📸</span> Bukti Foto Penerimaan</h3>
                <button className="mgAdmin__modalClose" onClick={() => setShowProof(false)}>✕</button>
              </div>
              <div className="mgAdmin__modalBody" style={{ textAlign: 'center', background: '#f8fafc' }}>
                <img src={proofImg} alt="Bukti" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '4px solid white' }} />
              </div>
              <div className="mgAdmin__modalFooter">
                <button className="mgAdmin__btnAction mgAdmin__btnAction--save" style={{ width: '100%' }} onClick={() => setShowProof(false)}>Tutup Halaman</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
