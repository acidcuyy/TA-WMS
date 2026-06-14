import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./RequestToko.css";
import {
  createTokoRequest,
  subscribeRequests,
  tokoSelesaiTerima,
  subscribeBranches,
  subscribeWarehouseStock,
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
  const [namaBarang, setNamaBarang] = useState("");
  const [kategori, setKategori] = useState("Elektronik");
  const [kategoriLain, setKategoriLain] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [satuan, setSatuan] = useState("pcs");
  const [prioritas, setPrioritas] = useState("Normal");
  const [tanggalKebutuhan, setTanggalKebutuhan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [targetGudang, setTargetGudang] = useState("");
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [requestItems, setRequestItems] = useState([]);

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
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubBranch = subscribeBranches((rows) => {
      const gudangs = rows.filter(b => b.type === 'gudang');
      setBranches(gudangs);
      if (gudangs.length > 0 && !targetGudang) setTargetGudang(gudangs[0].id);
    });
    const unsubStock = subscribeWarehouseStock((data) => setWarehouseStock(data || []));
    return () => {
      unsubReq();
      unsubBranch();
      unsubStock();
    };
  }, [targetGudang]);

  const availableItems = useMemo(() => {
    if (!targetGudang) return [];
    return warehouseStock.filter(x => 
      x.branchId === targetGudang && 
      (x.sku || "").toLowerCase().includes(kode.toLowerCase())
    );
  }, [warehouseStock, targetGudang, kode]);

  const tokoReq = useMemo(() => {
    const currentBranchId = sessionStorage.getItem("reastock_branch_id") || "BRC-003";
    return allReq.filter((r) => 
      (r.fromRole || "").toLowerCase() === "toko" && 
      (r.fromBranchId === currentBranchId || (!r.fromBranchId && currentBranchId === "BRC-003"))
    );
  }, [allReq]);

  const stats = useMemo(() => {
    const total = tokoReq.length;
    const pending = tokoReq.filter(r => (r.status || "").toLowerCase().includes("menunggu")).length;
    const process = tokoReq.filter(r => (r.status || "").toLowerCase().includes("memproses")).length;
    const shipping = tokoReq.filter(r => (r.status || "").toLowerCase().includes("mengirim")).length;
    const done = tokoReq.filter(r => (r.status || "").toLowerCase().includes("selesai")).length;
    return { total, pending, process, shipping, done };
  }, [tokoReq]);

  const tambahBarang = () => {
    if (!kode || !namaBarang || !jumlah) {
      alert("Mohon lengkapi kode, nama barang, dan jumlah.");
      return;
    }
    const finalKategori = kategori === "Lainnya" ? kategoriLain : kategori;
    if (kategori === "Lainnya" && !finalKategori.trim()) {
      alert("Mohon isi jenis barang.");
      return;
    }
    
    setRequestItems([...requestItems, {
      code: kode,
      name: namaBarang,
      category: finalKategori,
      qty: Number(jumlah) || 0,
      unit: satuan
    }]);

    setKode("");
    setNamaBarang("");
    setKategori("Elektronik");
    setKategoriLain("");
    setJumlah("");
    setSatuan("pcs");
  };

  const hapusBarang = (idx) => {
    const newItems = [...requestItems];
    newItems.splice(idx, 1);
    setRequestItems(newItems);
  };

  const sendRequest = async () => {
    if (requestItems.length === 0) {
      alert("Daftar barang masih kosong. Tambahkan minimal 1 barang ke daftar.");
      return;
    }
    if (!targetGudang) return;
    const branch = branches.find(b => b.id === targetGudang);

    await createTokoRequest({
      fromName: sessionStorage.getItem("reastock_branch_name") || "Toko", // Cabang toko yang sedang login
      toBranchId: targetGudang,
      toBranchName: branch?.name || "Gudang",
      items: requestItems,
      priority: prioritas,
      dueDate: tanggalKebutuhan,
      note: catatan,
    });
    
    setRequestItems([]);
    setPrioritas("Normal");
    setTanggalKebutuhan("");
    setCatatan("");
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Small size to prevent localstorage quota issues
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (dataUrl) => {
        setSelectedFile(dataUrl);
      });
    }
  };

  const submitTerima = async () => {
    if (!selectedFile) return alert("Pilih foto bukti terlebih dahulu!");
    await tokoSelesaiTerima(confirmId, selectedFile, uploadData);
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
            <section className="request-form-card" style={{ position: 'relative' }}>
              <div className="form-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Buat Request Baru</span>
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
              <p className="form-sub">Pilih gudang dan isi detail barang yang Anda butuhkan.</p>

              <style>{`
                .request-form-card .input-group label {
                  text-align: left !important;
                }
              `}</style>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="input-group">
                  <label>Pilih Gudang</label>
                  <select
                    className="input-field"
                    value={targetGudang}
                    onChange={(e) => setTargetGudang(e.target.value)}
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  >
                    {branches.length === 0 && <option value="">Memuat gudang...</option>}
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ position: 'relative' }}>
                  <label>Kode Barang</label>
                  <input
                    className="input-field"
                    value={kode}
                    onChange={(e) => {
                      setKode(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Ketik untuk mencari..."
                    disabled={formLocked}
                    style={{ cursor: formLocked ? 'not-allowed' : undefined, opacity: formLocked ? 0.6 : 1 }}
                  />
                  {showDropdown && availableItems.length > 0 && !formLocked && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, 
                      background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10,
                      maxHeight: '150px', overflowY: 'auto', marginTop: '4px'
                    }}>
                      {availableItems.map(item => (
                        <div 
                          key={item.sku}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}
                          onClick={() => {
                            setKode(item.sku);
                            setNamaBarang(item.name || "");
                            const cat = item.category || item.type;
                            if (cat && ["Elektronik", "Plumbing", "Peralatan", "Material Bangunan"].includes(cat)) {
                              setKategori(cat);
                            } else if (cat) {
                              setKategori("Lainnya");
                              setKategoriLain(cat);
                            }
                            if (item.unit) setSatuan(item.unit);
                            setShowDropdown(false);
                          }}
                        >
                          <strong>{item.sku}</strong> - {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '15px', gridTemplateColumns: '2fr 1fr' }}>
                <div className="input-group">
                  <label>Nama Barang</label>
                  <input
                    className="input-field"
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
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
                      onChange={(e) => setKategoriLain(e.target.value)}
                      placeholder="Ketik jenis barang..."
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
                      style={{ flex: 2 }}
                      type="number"
                      value={jumlah}
                      onChange={(e) => setJumlah(e.target.value)}
                      placeholder="0"
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
              </div>

              <button
                className="btn-submit"
                type="button"
                style={{ marginTop: '20px', backgroundColor: '#3b82f6', opacity: formLocked ? 0.5 : 1, cursor: formLocked ? 'not-allowed' : 'pointer' }}
                onClick={formLocked ? undefined : tambahBarang}
                disabled={formLocked}
              >
                ➕ Tambah Barang ke Daftar
              </button>

              {requestItems.length > 0 && (
                <div style={{ marginTop: '25px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>Daftar Barang yang Diminta ({requestItems.length} item):</h4>
                  <table className="request-table" style={{ fontSize: '13px', background: 'white' }}>
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Nama Barang</th>
                        <th>Kategori</th>
                        <th>Jumlah</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestItems.map((it, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{it.code}</td>
                          <td>{it.name}</td>
                          <td>{it.category}</td>
                          <td>{it.qty} {it.unit}</td>
                          <td>
                            <button className="btn-icon btn-icon--danger" style={{ padding: '4px' }} title="Hapus" onClick={() => hapusBarang(idx)} disabled={formLocked}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="form-grid" style={{ marginTop: '25px', gridTemplateColumns: '1fr 1fr' }}>
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
                  <label>Tgl Dibutuhkan</label>
                  <input
                    className="input-field"
                    type="date"
                    value={tanggalKebutuhan}
                    onChange={(e) => setTanggalKebutuhan(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: '15px', gridTemplateColumns: '1fr' }}>
                <div className="input-group">
                  <label>Catatan Tambahan</label>
                  <input
                    className="input-field"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Butuh segera untuk stok akhir bulan"
                  />
                </div>
              </div>

              <button
                className="btn-submit"
                style={{ marginTop: '25px', opacity: (formLocked || requestItems.length === 0) ? 0.5 : 1, cursor: (formLocked || requestItems.length === 0) ? 'not-allowed' : 'pointer' }}
                onClick={(formLocked || requestItems.length === 0) ? undefined : sendRequest}
                disabled={formLocked || requestItems.length === 0}
              >
                {formLocked ? '🔒 Form Terkunci — Buka kunci untuk kirim' : '🚀 Kirim Request ke Gudang'}
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
                      const itemName = item?.name || "Item Request";
                      const itemCode = item?.code || "";
                      const itemQty = r.confirmationData ? Number(r.confirmationData.qtyGood) : (item?.qty || 0);
                      const qtySuffix = r.confirmationData ? "Pcs (Diterima)" : "Pcs";
                      const itemText = `${itemName} ${itemCode ? `(${itemCode})` : ""} - ${itemQty} ${qtySuffix}`;
                      const priorityTag = r.priority ? `[Prioritas: ${r.priority}]` : "";
                      const status = (r.status || "").toLowerCase();
                      const canSeeTrack = status.includes("mengirim") && !r.isExternalDriver;
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
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{priorityTag} {r.note ? `- ${r.note}` : ""}</div>
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
                                  {r.status === "Mengirim" && (
                                    <button className="btn-action-small primary" onClick={() => openConfirmModal(r)}>Terima Barang</button>
                                  )}
                                </>
                              )}
                              {done && (
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
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Ambil foto barang saat diterima</div>
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
                        onChange={(e) => setUploadData({...uploadData, qtyGood: e.target.value})}
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
                        onChange={(e) => setUploadData({...uploadData, qtyBad: e.target.value})}
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
                        onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
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
