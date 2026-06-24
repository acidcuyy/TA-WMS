import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../../toko/requestToko/RequestToko.css";
import {
  createRestockToAdmin,
  subscribeRestockToAdmin,
  gudangFinishRestockWithProof,
} from "../../../services/wmsApi";

const getBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (!s || s.includes("menunggu") || s.includes("pending")) return "badge--pending";
  if (s.includes("accepted")) return "badge--accepted";
  if (s.includes("mengirim") || s.includes("ship") || s.includes("diproses")) return "badge--process";
  if (s.includes("siap")) return "badge--ready";
  if (s.includes("selesai") || s.includes("done")) return "badge--done";
  if (s.includes("declined") || s.includes("ditolak")) return "badge--declined";
  return "";
};

export default function BuatRequestGudang() {
  const navigate = useNavigate();
  const [allReq, setAllReq] = useState([]);
  const [kode, setKode] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [kategori, setKategori] = useState("Elektronik");
  const [kategoriLain, setKategoriLain] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [satuan, setSatuan] = useState("pcs");
  const [supplier, setSupplier] = useState("");
  const [prioritas, setPrioritas] = useState("Normal");
  const [catatan, setCatatan] = useState("");

  // Form lock
  const [formLocked, setFormLocked] = useState(false);

  // Confirmation Modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmTotal, setConfirmTotal] = useState(0);
  const [uploadData, setUploadData] = useState({ qtyGood: '', qtyBad: '', notes: '' });

  // Proof Modal
  const [showProof, setShowProof] = useState(false);
  const [proofData, setProofData] = useState(null);

  const openProof = (r) => { setProofData(r); setShowProof(true); };

  const easing = [0.22, 1, 0.36, 1];

  useEffect(() => {
    const unsubReq = subscribeRestockToAdmin((rows) => setAllReq(rows || []));
    return () => unsubReq();
  }, []);

  const gudangReq = useMemo(() => {
    // Only fetch requests made by THIS specific Gudang to Admin
    const currentBranchId = sessionStorage.getItem("reastock_branch_id") || "BRC-001";
    return allReq.filter((r) => 
      (r.fromRole || "").toLowerCase() === "gudang" && 
      (r.fromBranchId === currentBranchId || (!r.fromBranchId && currentBranchId === "BRC-001"))
    );
  }, [allReq]);

  const stats = useMemo(() => {
    const total = gudangReq.length;
    const pending = gudangReq.filter(r => (r.status || "").toLowerCase().includes("menunggu")).length;
    const process = gudangReq.filter(r => (r.status || "").toLowerCase().includes("diproses")).length;
    const done = gudangReq.filter(r => (r.status || "").toLowerCase().includes("selesai")).length;
    return { total, pending, process, done };
  }, [gudangReq]);

  const sendRequest = async () => {
    if (!kode || !namaBarang || !jumlah || !supplier) {
      alert("Mohon lengkapi data utama (Kode, Nama, Jumlah, Supplier).");
      return;
    }
    const finalKategori = kategori === "Lainnya" ? kategoriLain : kategori;
    if (kategori === "Lainnya" && !finalKategori.trim()) {
      alert("Mohon isi jenis barang.");
      return;
    }

    await createRestockToAdmin({
      fromName: sessionStorage.getItem("reastock_branch_name") || "Gudang Pusat", // Cabang gudang yang sedang login
      items: [{ code: kode, name: namaBarang, category: finalKategori, qty: Number(jumlah) || 0 }],
      priority: prioritas,
      supplier: supplier,
      satuan: satuan,
      note: catatan,
    });
    setKode("");
    setNamaBarang("");
    setKategori("Elektronik");
    setKategoriLain("");
    setJumlah("");
    setSatuan("pcs");
    setSupplier("");
    setPrioritas("Normal");
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
    await gudangFinishRestockWithProof(confirmId, selectedFile, uploadData);
    setShowConfirm(false);
    setConfirmId(null);
    setSelectedFile(null);
  };

  const openConfirmModal = (r) => {
    const total = (r.items || []).reduce((s, i) => s + Number(i.qty), 0);
    setConfirmId(r.id);
    setConfirmTotal(total);
    setUploadData({ qtyGood: total, qtyBad: '', notes: '' });
    setShowConfirm(true);
  };

  const summaryCards = [
    { label: "Total Request", value: stats.total, unit: "Permintaan", icon: "📝", iconClass: "summary-card__icon--purple" },
    { label: "Menunggu ACC", value: stats.pending, unit: "Pending", icon: "⏳", iconClass: "summary-card__icon--orange" },
    { label: "Sedang Diproses", value: stats.process, unit: "Admin", icon: "🏭", iconClass: "summary-card__icon--blue" },
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
            <h1>Request Stok (ke Admin)</h1>
            <p>Kirim permintaan stok barang ke Admin / Supplier dan pantau status pemenuhannya.</p>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="request-toko__summary" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
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
            <section className="request-form-card" style={{ position: 'relative' }}>
              <div className="form-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Buat Request Baru ke Admin</span>
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
              </div>
              <p className="form-sub">Isi detail barang yang Anda butuhkan dari supplier.</p>
              <style>{`
                .request-form-card .input-group label {
                  text-align: left !important;
                }
              `}</style>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="input-group">
                  <label>Tujuan</label>
                  <input
                    className="input-field"
                    value="Admin / Supplier Pusat"
                    disabled
                  />
                </div>
                <div className="input-group">
                  <label>Kode Barang</label>
                  <input
                    className="input-field"
                    value={kode}
                    onChange={(e) => setKode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                    placeholder="Contoh: BRG-002"
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '15px', gridTemplateColumns: '2fr 1fr' }}>
                <div className="input-group">
                  <label>Nama Barang</label>
                  <input
                    className="input-field"
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value.replace(/[^a-zA-Z0-9\s.,&-]/g, ""))}
                    placeholder="Contoh: Susu UHT 1L"
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  />
                </div>
                <div className="input-group">
                  <label>Jenis Barang</label>
                  <select
                    className="input-field"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Peralatan">Peralatan</option>
                    <option value="Material Bangunan">Material Bangunan</option>
                    <option value="Lainnya">Pilihan Lain (Ketik sendiri)</option>
                  </select>
                </div>
              </div>

              {kategori === "Lainnya" && (
                <div className="form-grid" style={{ marginTop: '15px', gridTemplateColumns: '1fr' }}>
                  <div className="input-group">
                    <label>Sebutkan Jenis Barang</label>
                    <input
                      className="input-field"
                      value={kategoriLain}
                      onChange={(e) => setKategoriLain(e.target.value.replace(/[^a-zA-Z0-9\s.,&-]/g, ""))}
                      placeholder="Ketik jenis barang..."
                      disabled={formLocked}
                      style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                    />
                  </div>
                </div>
              )}

              <div className="form-grid" style={{ marginTop: '15px', gridTemplateColumns: '1fr 2fr' }}>
                <div className="input-group">
                  <label>Jumlah & Satuan</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      className="input-field"
                      style={{ flex: 2, cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                      type="number"
                      value={jumlah}
                      onChange={(e) => setJumlah(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="0"
                      disabled={formLocked}
                    />
                    <select
                      className="input-field"
                      style={{ flex: 1, cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                      value={satuan}
                      onChange={(e) => setSatuan(e.target.value)}
                      disabled={formLocked}
                    >
                      <option value="pcs">Pcs</option>
                      <option value="box">Box</option>
                      <option value="roll">Roll</option>
                      <option value="kg">Kg</option>
                      <option value="sak">Sak</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Pembelian dari Supplier</label>
                  <input
                    className="input-field"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value.replace(/[^a-zA-Z0-9\s.,&-]/g, ""))}
                    placeholder="Nama PT / Supplier"
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '15px', gridTemplateColumns: '1fr 2fr' }}>
                <div className="input-group">
                  <label>Prioritas</label>
                  <select
                    className="input-field"
                    value={prioritas}
                    onChange={(e) => setPrioritas(e.target.value)}
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent (Segera)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Catatan Tambahan</label>
                  <input
                    className="input-field"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))}
                    placeholder="Contoh: Butuh segera untuk stok akhir bulan"
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  />
                </div>
              </div>

              <button
                className="btn-submit"
                style={{ marginTop: '20px', opacity: formLocked ? 0.5 : 1, cursor: formLocked ? 'not-allowed' : 'pointer' }}
                onClick={formLocked ? undefined : sendRequest}
                disabled={formLocked}
              >
                {formLocked ? '🔒 Form Terkunci — Buka kunci untuk kirim' : 'Kirim Request ke Admin'}
              </button>
            </section>

            {/* LIST CARD */}
            <section className="request-list-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div className="form-title">Riwayat Pengajuan Gudang</div>
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
                  {gudangReq.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Belum ada data request.</td></tr>
                  ) : (
                    gudangReq.map((r, idx) => {
                      const item = r.items?.[0];
                      const itemName = item?.name || "Item Request";
                      const itemCode = item?.code || "";
                      const itemQty = item?.qty || 0;
                      const itemText = `${itemName} ${itemCode ? `(${itemCode})` : ""} - ${itemQty} Pcs`;
                      const priorityTag = r.priority ? `[Prioritas: ${r.priority}]` : "";

                      return (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05 }}
                        >
                          <td style={{ fontWeight: 600 }}>{r.id}</td>
                          <td>Admin / Pusat</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{itemText}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{priorityTag} {r.note ? `- ${r.note}` : ""}</div>
                          </td>
                          <td>
                            <span className={`badge ${getBadgeClass(r.status)}`}>
                              {r.status || "Menunggu"}
                            </span>
                          </td>
                          <td>
                            <div className="action-group">
                              {r.status === "Diproses" && (
                                <button className="btn-action-small primary" onClick={() => openConfirmModal(r)}>Terima Barang</button>
                              )}
                              {r.status === "Selesai" && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ color: "#52c41a", fontSize: "11px", fontWeight: 600 }}>Diterima</span>
                                  {r.proofImage && (
                                    <span
                                      style={{ fontSize: '10px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                      onClick={() => openProof(r)}
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
              <h3 className="widget-title">Alur Request Gudang</h3>
              <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.8" }}>
                <li><b>1. Request:</b> Gudang membuat permintaan restok ke Admin Pusat/Supplier.</li>
                <li><b>2. Approval:</b> Admin Pusat akan mengecek ketersediaan dan menyetujui request.</li>
                <li><b>3. Pemrosesan:</b> Barang dikirim dari Supplier (Status: Diproses).</li>
                <li><b>4. Selesai:</b> Admin menandai request selesai saat stok tiba di Gudang.</li>
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
                <h3><span>📸</span> Konfirmasi Penerimaan Supplier</h3>
                <button className="mgAdmin__modalClose" onClick={() => setShowConfirm(false)}>✕</button>
              </div>
              <div className="mgAdmin__modalBody">
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
                  Upload foto bukti surat jalan / barang dari Supplier untuk menyelesaikan Request ini.
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
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Ambil foto barang / surat jalan supplier</div>
                    </>
                  )}
                  <input type="file" id="proof-upload" hidden accept="image/*" onChange={handleFileChange} />
                </div>

                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Diterima Baik</label>
                      <input 
                        type="number" 
                        min="0"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        value={uploadData.qtyGood}
                        onChange={(e) => setUploadData({...uploadData, qtyGood: e.target.value.replace(/[^0-9]/g, "")})}
                        placeholder={`Req: ${confirmTotal}`}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Diterima Rusak</label>
                      <input 
                        type="number" 
                        min="0"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        value={uploadData.qtyBad}
                        onChange={(e) => setUploadData({...uploadData, qtyBad: e.target.value.replace(/[^0-9]/g, "")})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {Number(uploadData.qtyBad) > 0 && (
                    <div style={{ marginTop: '12px', animation: 'fadeIn 0.3s ease-in-out' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>Catatan Kerusakan</label>
                      <textarea 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', minHeight: '80px', outlineColor: '#ef4444' }}
                        value={uploadData.notes}
                        onChange={(e) => setUploadData({...uploadData, notes: e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, "")})}
                        placeholder="Jelaskan barang yang rusak..."
                      />
                    </div>
                  )}
                </div>

              </div>
              <div className="mgAdmin__modalFooter">
                <button className="mgAdmin__btnAction mgAdmin__btnAction--cancel" onClick={() => setShowConfirm(false)}>Batal</button>
                <button 
                  className="mgAdmin__btnAction mgAdmin__btnAction--save" 
                  onClick={submitTerima}
                  disabled={Number(uploadData.qtyBad) > 0 && !uploadData.notes.trim()}
                  style={Number(uploadData.qtyBad) > 0 && !uploadData.notes.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Selesaikan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROOF VIEW MODAL */}
      <AnimatePresence>
        {showProof && proofData && (
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
              <div className="mgAdmin__modalBody" style={{ textAlign: 'left', background: '#f8fafc', padding: '24px' }}>
                {proofData.confirmationData && (
                  <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', background: '#f6ffed', border: '1px solid #b7eb8f', padding: '12px 16px', borderRadius: '8px' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: '#52c41a', fontWeight: 'bold', marginBottom: '4px' }}>Diterima Baik</span>
                      <strong style={{ fontSize: '16px' }}>{proofData.confirmationData.qtyGood} pcs</strong>
                    </div>
                    {Number(proofData.confirmationData.qtyBad) > 0 && (
                      <div style={{ flex: 1, minWidth: '200px', background: '#fff2f0', border: '1px solid #ffccc7', padding: '12px 16px', borderRadius: '8px' }}>
                        <span style={{ display: 'block', fontSize: '12px', color: '#ff4d4f', fontWeight: 'bold', marginBottom: '4px' }}>Barang Rusak / Kurang</span>
                        <strong style={{ fontSize: '16px', color: '#cf1322' }}>{proofData.confirmationData.qtyBad} pcs</strong>
                      </div>
                    )}
                  </div>
                )}
                {proofData.confirmationData?.notes && (
                  <div style={{ marginBottom: '24px', background: '#fff1f0', border: '1px solid #ffccc7', padding: '16px', borderRadius: '8px' }}>
                    <strong style={{ color: '#cf1322', display: 'block', marginBottom: '8px' }}>Catatan Kerusakan:</strong>
                    <p style={{ color: '#a8071a', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{proofData.confirmationData.notes}</p>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <img src={proofData.proofImage} alt="Bukti" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '4px solid white' }} />
                </div>
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
