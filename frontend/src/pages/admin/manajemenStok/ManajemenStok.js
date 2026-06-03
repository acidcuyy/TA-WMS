import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../PageAdmin.css";
import "./ManajemenStokAdmin.css";
import { subscribeAdminRestockToGudang, createAdminRestockToGudang, subscribeBranches } from "../../../services/wmsApi";

export default function ManajemenStok() {
  const summary = useMemo(() => {
    return {
      totalPerusahaan: 2104,
      stokGudang: 1860,
      stokToko: 244,
    };
  }, []);

  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const unsubReq = subscribeAdminRestockToGudang((data) => setRequests(data || []));
    const unsubBranch = subscribeBranches((data) => setBranches(data || []));
    return () => { unsubReq(); unsubBranch(); };
  }, []);

  const gudangBranches = useMemo(() => branches.filter(b => b.type === "gudang"), [branches]);

  const [openForm, setOpenForm] = useState(false);
  const [sentBanner, setSentBanner] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    cabangGudang: "",
    kodeBarang: "",
    namaBarang: "",
    kategori: "Elektronik",
    kategoriLain: "",
    jumlah: "",
    satuan: "pcs",
    supplier: "",
    prioritas: "Normal",
    catatan: "",
  });

  const [proofModal, setProofModal] = useState({ open: false, data: null });

  const resetForm = () => {
    setForm({
      cabangGudang: gudangBranches.length > 0 ? gudangBranches[0].id : "",
      kodeBarang: "",
      namaBarang: "",
      kategori: "Elektronik",
      kategoriLain: "",
      jumlah: "",
      satuan: "pcs",
      supplier: "",
      prioritas: "Normal",
      catatan: "",
    });
    setToast("");
  };

  // Set default branch when opened
  useEffect(() => {
    if (openForm && !form.cabangGudang && gudangBranches.length > 0) {
      setForm(prev => ({ ...prev, cabangGudang: gudangBranches[0].id }));
    }
  }, [openForm, gudangBranches]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.cabangGudang || !form.kodeBarang || !form.namaBarang || !form.jumlah || !form.supplier) {
      setToast("Mohon lengkapi data utama (Cabang, Kode, Nama, Jumlah, Supplier).");
      return;
    }

    const branchName = gudangBranches.find(b => b.id === form.cabangGudang)?.name || "Gudang Unknown";
    const finalKategori = form.kategori === "Lainnya" ? form.kategoriLain : form.kategori;

    if (form.kategori === "Lainnya" && !finalKategori.trim()) {
      setToast("Mohon isi jenis barang.");
      return;
    }

    createAdminRestockToGudang({
      cabangGudang: form.cabangGudang,
      cabangGudangNama: branchName,
      kodeBarang: form.kodeBarang,
      namaBarang: form.namaBarang,
      jenisBarang: finalKategori,
      jumlah: form.jumlah,
      satuan: form.satuan,
      supplier: form.supplier,
      prioritas: form.prioritas,
      catatan: form.catatan
    });

    setOpenForm(false);
    resetForm();
    setSentBanner("Request penambahan stok berhasil dikirim ke " + branchName + ".");
    setTimeout(() => setSentBanner(""), 3000);
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("pending") || s.includes("menunggu")) return "stokAdm__status--pending";
    if (s.includes("diproses")) return "stokAdm__status--processing";
    if (s.includes("selesai")) return "stokAdm__status--done";
    return "";
  };

  const openProofViewer = (req) => {
    if (req.proofPhotos) {
      setProofModal({ open: true, data: req });
    }
  };

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="stokAdm__hero">
        <div>
          <h1 className="stokAdm__title">Manajemen Stok Gudang</h1>
          <p className="stokAdm__subtitle">
            Monitoring stok perusahaan dan permintaan penambahan stok gudang.
          </p>
        </div>
        <div className="stokAdm__heroBadge">
          <span className="user-icon">👤</span> Admin / Owner <span className="chevron">⌄</span>
        </div>
      </header>

      <AnimatePresence>
        {sentBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="stokAdm__banner"
          >
            <span className="stokAdm__bannerDot" />
            {sentBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SECTION: SUMMARY & ACTIONS */}
      <div className="stokAdm__topGrid">
        <section className="stokAdm__panel">
          <div className="stokAdm__panelHead">
            <div>
              <h2>Ringkasan Stok</h2>
              <p>● Real-time (dummy)</p>
            </div>
          </div>

          <div className="stokAdm__cards">
            <div className="stokAdm__metric">
              <div className="stokAdm__metricIcon" style={{ color: "#e4915a", background: "#fff8f3" }}>📦</div>
              <p className="stokAdm__metricLabel">Total Stok Perusahaan</p>
              <h3 className="stokAdm__metricValue">{summary.totalPerusahaan.toLocaleString("id-ID")}</h3>
              <p className="stokAdm__metricSub">Gudang + Toko</p>
            </div>

            <div className="stokAdm__metric">
              <div className="stokAdm__metricIcon" style={{ color: "#4a90e2", background: "#f0f7ff" }}>🏬</div>
              <p className="stokAdm__metricLabel">Stok Tersedia di Gudang</p>
              <h3 className="stokAdm__metricValue">{summary.stokGudang.toLocaleString("id-ID")}</h3>
              <p className="stokAdm__metricSub">Siap distribusi</p>
            </div>

            <div className="stokAdm__metric">
              <div className="stokAdm__metricIcon" style={{ color: "#52c41a", background: "#f6ffed" }}>🏪</div>
              <p className="stokAdm__metricLabel">Stok Tersedia di Toko</p>
              <h3 className="stokAdm__metricValue">{summary.stokToko.toLocaleString("id-ID")}</h3>
              <p className="stokAdm__metricSub">Siap jual</p>
            </div>
          </div>
        </section>

        <aside className="stokAdm__panel">
          <div className="stokAdm__panelHead">
            <div>
              <h2>Aksi</h2>
              <p>Kelola permintaan stok gudang</p>
            </div>
          </div>

          <div className="stokAdm__actionButtons">
            <button className="stokAdm__primaryBtn" onClick={() => setOpenForm(true)}>
              + Tambah Stok Gudang
            </button>
            <button className="stokAdm__ghostBtn" disabled>
              <span className="icon">📤</span> Import (Coming Soon)
            </button>
          </div>

          <div className="stokAdm__note">
            <span className="info-icon">ℹ️</span>
            <p>Admin dapat meminta penambahan stok ke gudang. Gudang akan memproses dan mengunggah bukti penerimaan.</p>
          </div>
        </aside>
      </div>

      {/* TABLE SECTION */}
      <section className="stokAdm__panel stokAdm__tablePanel">
        <div className="stokAdm__panelHead">
          <div>
            <h2>Riwayat Request Penambahan Stok ke Gudang</h2>
            <p>Status akan berubah setelah gudang melakukan proses dan konfirmasi.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#888', fontWeight: '600' }}>Total: {requests.length}</span>
            <div className="date-filter">
              📅 Semua Waktu <span className="chevron">⌄</span>
            </div>
          </div>
        </div>

        <div className="stokAdm__tableWrap">
          <table className="stokAdm__table">
            <thead>
              <tr>
                <th>ID & Tanggal</th>
                <th>Tujuan Gudang</th>
                <th>Barang & Supplier</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    Belum ada riwayat request penambahan stok.
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="stokAdm__id">{r.id}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>{r.createdAt}</div>
                    {r.prioritas === "Urgent" && <span className="tag-urgent" style={{display: 'inline-block', marginTop: '4px', fontSize: '10px', background: '#fff1f0', color: '#ff4d4f', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>URGENT</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.cabangGudangNama}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: "4px" }}>
                      <b>{r.kodeBarang}</b> - {r.namaBarang}
                      <span className="tag-kategori">{r.jenisBarang}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Supplier: {r.supplier}</div>
                  </td>
                  <td className="stokAdm__qty">{r.jumlah} {r.satuan}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                      <span className={`stokAdm__status ${getStatusClass(r.status)}`}>
                        ● {r.status}
                      </span>
                      {r.status === "Selesai" && r.proofPhotos && (
                        <button className="btn-link" onClick={() => openProofViewer(r)} style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', padding: '0', textDecoration: 'underline'}}>
                          Lihat Bukti 📸
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <button className="btn-more">⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL FORM */}
      <AnimatePresence>
        {openForm && (
          <div className="stokAdm__overlay" onClick={() => setOpenForm(false)}>
            <motion.div 
              className="stokAdm__modal" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="stokAdm__modalHead">
                <div>
                  <h3>Form Penambahan Stok Gudang</h3>
                  <p>Lengkapi instruksi penambahan stok untuk staf gudang.</p>
                </div>
                <button className="stokAdm__closeBtn" onClick={() => setOpenForm(false)}>×</button>
              </div>
              <form onSubmit={handleSend} className="stokAdm__form">
                {toast && <div className="stokAdm__toastError" style={{background: '#fff1f0', color: '#ff4d4f', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold'}}>{toast}</div>}
                
                <div className="stokAdm__formGrid">
                  <div className="stokAdm__field" style={{ gridColumn: "1 / -1" }}>
                    <span>Pilih Cabang Gudang Tujuan</span>
                    <select value={form.cabangGudang} onChange={(e) => setForm({...form, cabangGudang: e.target.value})}>
                      {gudangBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                      {gudangBranches.length === 0 && <option value="">Tidak ada data gudang</option>}
                    </select>
                  </div>
                  
                  <div className="stokAdm__field">
                    <span>Kode Barang</span>
                    <input placeholder="contoh: BRG-021" value={form.kodeBarang} onChange={(e) => setForm({...form, kodeBarang: e.target.value})} />
                  </div>
                  <div className="stokAdm__field">
                    <span>Nama Barang</span>
                    <input placeholder="contoh: Pipa 1/2 inch" value={form.namaBarang} onChange={(e) => setForm({...form, namaBarang: e.target.value})} />
                  </div>
                  
                  <div className="stokAdm__field">
                    <span>Jenis Barang</span>
                    <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})}>
                      <option>Elektronik</option>
                      <option>Plumbing</option>
                      <option>Peralatan</option>
                      <option>Material Bangunan</option>
                      <option value="Lainnya">Pilihan Lain (Ketik sendiri)</option>
                    </select>
                  </div>
                  {form.kategori === "Lainnya" && (
                    <div className="stokAdm__field">
                      <span>Sebutkan Jenis Barang</span>
                      <input placeholder="Ketik jenis barang..." value={form.kategoriLain} onChange={(e) => setForm({...form, kategoriLain: e.target.value})} />
                    </div>
                  )}
                  
                  <div className="stokAdm__field" style={{ gridColumn: form.kategori === "Lainnya" ? "1 / -1" : "auto" }}>
                    <span>Jumlah & Satuan</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="number" placeholder="50" style={{ flex: 2 }} value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} />
                      <select style={{ flex: 1 }} value={form.satuan} onChange={(e) => setForm({...form, satuan: e.target.value})}>
                        <option value="pcs">Pcs</option>
                        <option value="box">Box</option>
                        <option value="roll">Roll</option>
                        <option value="kg">Kg</option>
                        <option value="sak">Sak</option>
                      </select>
                    </div>
                  </div>

                  <div className="stokAdm__field">
                    <span>Pembelian dari Supplier</span>
                    <input placeholder="Nama PT / Supplier" value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} />
                  </div>

                  <div className="stokAdm__field">
                    <span>Prioritas</span>
                    <select value={form.prioritas} onChange={(e) => setForm({...form, prioritas: e.target.value})}>
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent (Segera)</option>
                    </select>
                  </div>

                  <div className="stokAdm__field" style={{ gridColumn: "1 / -1" }}>
                    <span>Catatan untuk Gudang (Opsional)</span>
                    <textarea 
                      placeholder="Contoh: Tolong cek fisik barang dengan teliti..." 
                      rows={2} 
                      className="stokAdm__textarea"
                      style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-2)', resize: 'vertical', width: '100%', fontFamily: 'inherit', fontSize: '14px' }}
                      value={form.catatan} 
                      onChange={(e) => setForm({...form, catatan: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="stokAdm__formActions">
                  <button type="button" className="stokAdm__ghostBtn" onClick={resetForm}>Clear</button>
                  <button type="submit" className="stokAdm__primaryBtn">Kirim Request Restock</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROOF VIEWER MODAL */}
      <AnimatePresence>
        {proofModal.open && proofModal.data && (
          <div className="stokAdm__overlay" onClick={() => setProofModal({ open: false, data: null })}>
            <motion.div 
              className="stokAdm__modal" 
              style={{ maxWidth: "800px" }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="stokAdm__modalHead">
                <div>
                  <h3>Bukti Penambahan Stok</h3>
                  <p>Request ID: {proofModal.data.id} - {proofModal.data.namaBarang}</p>
                </div>
                <button className="stokAdm__closeBtn" onClick={() => setProofModal({ open: false, data: null })}>×</button>
              </div>
              <div className="stokAdm__proofBody" style={{ padding: '24px' }}>
                <ProofViewer photos={proofModal.data.proofPhotos} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Komponen kecil untuk menampilkan carousel foto
function ProofViewer({ photos }) {
  const [activeTab, setActiveTab] = useState("checkBarang");
  
  const tabs = [
    { id: "checkBarang", label: "Cek Barang" },
    { id: "resiDriver", label: "Resi & Driver" },
    { id: "pemasukanBarang", label: "Pemasukan ke Rak" }
  ];

  const currentPhotos = photos[activeTab] || [];

  return (
    <div className="proofViewer">
      <div className="proofViewer__tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        {tabs.map(t => (
          <button 
            key={t.id} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 600, 
              fontSize: '13px',
              cursor: 'pointer',
              background: activeTab === t.id ? 'var(--primary)' : 'var(--bg-2)',
              color: activeTab === t.id ? 'white' : 'var(--text)'
            }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label} ({photos[t.id]?.length || 0})
          </button>
        ))}
      </div>
      <div className="proofViewer__content" style={{ minHeight: '300px' }}>
        {currentPhotos.length === 0 ? (
          <div className="proofViewer__empty" style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            Tidak ada foto untuk kategori ini.
          </div>
        ) : (
          <div className="proofViewer__grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {currentPhotos.map((img, idx) => (
              <div key={idx} className="proofViewer__imgWrap" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px' }}>
                <img src={img} alt={`Bukti ${idx}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}