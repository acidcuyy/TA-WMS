import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DateRangePicker from "../../../components/common/DateRangePicker";
import "../PageAdmin.css";
import "./ManajemenStokAdmin.css";
import { subscribeAdminRestockToGudang, createAdminRestockToGudang, subscribeBranches, subscribeWarehouseStock } from "../../../services/wmsApi";

export default function ManajemenStok() {
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [allStock, setAllStock] = useState([]);

  useEffect(() => {
    const unsubReq = subscribeAdminRestockToGudang((data) => setRequests(data || []));
    const unsubBranch = subscribeBranches((data) => setBranches(data || []));
    const unsubStock = subscribeWarehouseStock((data) => setAllStock(data || []));
    return () => { unsubReq(); unsubBranch(); unsubStock(); };
  }, []);

  const summary = useMemo(() => {
    let stokGudang = 0;
    let stokToko = 0;
    
    allStock.forEach(item => {
      const branch = branches.find(b => b.id === item.branchId);
      if (branch?.type === "toko") {
        stokToko += Number(item.qty) || 0;
      } else {
        stokGudang += Number(item.qty) || 0;
      }
    });

    return {
      totalPerusahaan: stokGudang + stokToko,
      stokGudang,
      stokToko,
    };
  }, [allStock, branches]);

  const gudangBranches = useMemo(() => branches.filter(b => b.type === "gudang"), [branches]);

  const uniqueItems = useMemo(() => {
    const map = new Map();
    allStock.forEach(item => {
      if (!map.has(item.sku)) {
        map.set(item.sku, { 
          kodeBarang: item.sku, 
          namaBarang: item.name, 
          kategori: item.category || "Elektronik", 
          satuan: item.unit || "pcs" 
        });
      }
    });
    return Array.from(map.values());
  }, [allStock]);

  const [openForm, setOpenForm] = useState(false);
  const [sentBanner, setSentBanner] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    jenisPenambahan: "lama",
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
      jenisPenambahan: "lama",
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
  }, [openForm, gudangBranches, form.cabangGudang]);

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
        <div className="stokAdm__headerTitle">
          <h1 className="stokAdm__title">Restock Gudang</h1>
          <p className="stokAdm__subtitle">Monitoring stok perusahaan dan permintaan penambahan stok gudang.</p>
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e6f7ff', color: '#1890ff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1890ff', boxShadow: '0 0 0 0 rgba(24, 144, 255, 0.7)', animation: 'pulseLive 2s infinite' }} />
                Live Monitoring
              </div>
            </div>
            <DateRangePicker />
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

        <aside className="stokAdm__panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="stokAdm__panelHead">
            <div>
              <h2>Aksi</h2>
              <p>Kelola permintaan stok gudang</p>
            </div>
          </div>

          <div className="stokAdm__actionButtons" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button 
              className="stokAdm__primaryBtn" 
              style={{ width: '100%', padding: '24px 16px', fontSize: '18px', fontWeight: 'bold' }}
              onClick={() => setOpenForm(true)}
            >
              + Tambah Stok Gudang
            </button>
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
            <DateRangePicker />
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
                  <td className="stokAdm__qty">
                    {r.status === 'Selesai'
                      ? <>
                          {r.confirmationData && r.confirmationData.qtyGood !== '' ? r.confirmationData.qtyGood : r.jumlah} {r.satuan} 
                          <span style={{fontSize: '11px', color: '#888', display: 'block'}}>(Req: {r.jumlah})</span>
                        </>
                      : <>{r.jumlah} {r.satuan}</>
                    }
                  </td>
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
                  <div className="stokAdm__field" style={{ gridColumn: "1 / -1" }}>
                    <span>Jenis Penambahan</span>
                    <select 
                      value={form.jenisPenambahan} 
                      onChange={(e) => setForm({...form, jenisPenambahan: e.target.value, kodeBarang: "", namaBarang: "", kategori: "Elektronik", satuan: "pcs"})}
                    >
                      <option value="lama">Barang Lama (Sudah Terdata)</option>
                      <option value="baru">Barang Baru</option>
                    </select>
                  </div>

                  {form.jenisPenambahan === "lama" ? (
                    <div className="stokAdm__field" style={{ gridColumn: "1 / -1" }}>
                      <span>Pilih Barang Terdata</span>
                      <select 
                        value={form.kodeBarang} 
                        onChange={(e) => {
                          const item = uniqueItems.find(i => i.kodeBarang === e.target.value);
                          if (item) {
                            setForm({
                              ...form,
                              kodeBarang: item.kodeBarang,
                              namaBarang: item.namaBarang,
                              kategori: item.kategori,
                              satuan: item.satuan,
                            });
                          } else {
                            setForm({...form, kodeBarang: ""});
                          }
                        }}
                      >
                        <option value="">-- Pilih Barang --</option>
                        {uniqueItems.map(item => (
                          <option key={item.kodeBarang} value={item.kodeBarang}>
                            {item.kodeBarang} - {item.namaBarang} ({item.kategori})
                          </option>
                        ))}
                        {uniqueItems.length === 0 && <option value="" disabled>Tidak ada barang terdata, silakan pilih Barang Baru</option>}
                      </select>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                  
                  <div className="stokAdm__field" style={{ gridColumn: form.kategori === "Lainnya" && form.jenisPenambahan === "baru" ? "1 / -1" : "auto" }}>
                    <span>Jumlah & Satuan</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="number" placeholder="50" style={{ flex: 2 }} value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} />
                      <select style={{ flex: 1 }} value={form.satuan} onChange={(e) => setForm({...form, satuan: e.target.value})} disabled={form.jenisPenambahan === "lama"}>
                        {form.jenisPenambahan === "lama" && !["pcs", "box", "roll", "kg", "sak"].includes(form.satuan?.toLowerCase()) && (
                          <option value={form.satuan}>{form.satuan}</option>
                        )}
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
                      style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-2)', resize: 'vertical', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '14px' }}
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
                {proofModal.data.confirmationData && (
                  <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', background: '#f6ffed', border: '1px solid #b7eb8f', padding: '12px 16px', borderRadius: '8px' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: '#52c41a', fontWeight: 'bold', marginBottom: '4px' }}>Diterima Baik</span>
                      <strong style={{ fontSize: '16px' }}>{proofModal.data.confirmationData.qtyGood} {proofModal.data.satuan}</strong>
                    </div>
                    {Number(proofModal.data.confirmationData.qtyBad) > 0 && (
                      <div style={{ flex: 1, minWidth: '200px', background: '#fff2f0', border: '1px solid #ffccc7', padding: '12px 16px', borderRadius: '8px' }}>
                        <span style={{ display: 'block', fontSize: '12px', color: '#ff4d4f', fontWeight: 'bold', marginBottom: '4px' }}>Barang Rusak / Kurang</span>
                        <strong style={{ fontSize: '16px', color: '#cf1322' }}>{proofModal.data.confirmationData.qtyBad} {proofModal.data.satuan}</strong>
                      </div>
                    )}
                  </div>
                )}
                {proofModal.data.confirmationData?.notes && (
                  <div style={{ marginBottom: '24px', background: '#fff1f0', border: '1px solid #ffccc7', padding: '16px', borderRadius: '8px' }}>
                    <strong style={{ color: '#cf1322', display: 'block', marginBottom: '8px' }}>Catatan Kerusakan dari Gudang:</strong>
                    <p style={{ color: '#a8071a', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{proofModal.data.confirmationData.notes}</p>
                  </div>
                )}
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