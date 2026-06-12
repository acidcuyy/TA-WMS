import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DetailModal from "../../../components/common/DetailModal";
import {
  subscribeBranches,
  subscribeWarehouseStock,
  addWarehouseStock,
  deleteWarehouseStock,
  editWarehouseStock,
} from "../../../services/wmsApi";
import "./StokToko.css";
import LockedSelect from "../../../components/common/LockedSelect";

const easing = [0.22, 1, 0.36, 1];

const CATEGORY_OPTIONS = ["Plumbing","Elektrikal","Bahan Bangunan","Hardware","Umum","Makanan","Minuman","Lainnya"];
const UNIT_OPTIONS = ["pcs","unit","box","lusin","kg","liter","meter","rol","zak","karung"];

function getStatusLabel(qty, minQty) {
  if (qty === 0) return "Habis";
  if (qty <= (minQty || 5)) return "Menipis";
  return "Aman";
}

const catIcons  = { Plumbing:"🚿", Elektrikal:"🔌", "Bahan Bangunan":"🧱", Hardware:"🔩", Umum:"📦", Makanan:"🍱", Minuman:"🧃", Lainnya:"📦", General:"📦" };
const catColors = { Plumbing:"#f0fdf4", Elektrikal:"#eff6ff", "Bahan Bangunan":"#fff7ed", Hardware:"#fef2f2", Umum:"#f5f3ff", Makanan:"#fef9ec", Minuman:"#ecfeff", Lainnya:"#f5f3ff", General:"#f5f3ff" };

/* ─── Modal Tambah Barang Toko ─── */
function TambahBarangModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ sku:"", name:"", category:"Umum", unit:"pcs", qty:1, minQty:5, price:0 });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setError("");
    if (!form.name.trim()) { setError("Nama barang harus diisi."); return; }
    if (Number(form.qty) <= 0) { setError("Jumlah stok harus lebih dari 0."); return; }
    setSaving(true);
    addWarehouseStock({
      ...form,
      sku: form.sku.trim() || `SKU-${Date.now()}`,
      qty: Number(form.qty),
      minQty: Number(form.minQty),
      price: Number(form.price),
      branchId: sessionStorage.getItem("reastock_branch_id") || "BRC-003"
    });
    setSaving(false);
    setForm({ sku:"", name:"", category:"Umum", unit:"pcs", qty:1, minQty:5, price:0 });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="tambah-barang-modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity:0, scale:0.93, y:30 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.93, y:30 }}
        transition={{ duration:0.3, ease:easing }}
      >
        <div className="modal__header">
          <div>
            <h2 className="modal__title">➕ Tambah Barang</h2>
            <p className="modal__sub">Tambahkan barang ke stok inventaris toko Anda</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <div className="modal-form-grid">
            <div className="modal-field">
              <label>Nama Barang *</label>
              <input placeholder="Nama produk" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Kode SKU</label>
              <input placeholder="Otomatis jika kosong" value={form.sku} onChange={e => set("sku", e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Kategori</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Satuan</label>
              <select value={form.unit} onChange={e => set("unit", e.target.value)}>
                {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Jumlah Stok *</label>
              <input type="number" min={1} value={form.qty} onChange={e => set("qty", e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Min. Stok (Peringatan)</label>
              <input type="number" min={0} value={form.minQty} onChange={e => set("minQty", e.target.value)} />
            </div>
            <div className="modal-field modal-field--full">
              <label>Harga Satuan (opsional)</label>
              <input type="number" min={0} placeholder="0" value={form.price} onChange={e => set("price", e.target.value)} />
            </div>
          </div>
          {error && <div className="modal-error">⚠️ {error}</div>}
        </div>

        <div className="modal__footer">
          <button className="btn-modal-cancel" onClick={onClose}>Batal</button>
          <button className="btn-modal-add" onClick={handleSubmit} disabled={saving}>
            {saving ? "Menyimpan..." : "Tambah Barang"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function StokToko() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState("stok-toko");   // "stok-toko" | "stok-gudang"
  const [activeTab, setActiveTab] = useState("Semua Produk");
  const [detailModal, setDetailModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua Kategori");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [allStock, setAllStock] = useState([]);

  useEffect(() => {
    const unsubBranches = subscribeBranches(setBranches);
    const unsubStock    = subscribeWarehouseStock(setAllStock);
    return () => { unsubBranches(); unsubStock(); };
  }, []);

  // Gudang branches
  const gudangBranches = useMemo(() => branches.filter(b => b.type === "gudang"), [branches]);
  useEffect(() => {
    if (gudangBranches.length > 0 && !selectedBranchId) setSelectedBranchId(gudangBranches[0].id);
  }, [gudangBranches, selectedBranchId]);
  const selectedBranch = useMemo(() => gudangBranches.find(b => b.id === selectedBranchId) || null, [gudangBranches, selectedBranchId]);

  /* ─── STOK TOKO SENDIRI ─── */
  const tokoInventoryWithStatus = useMemo(() =>
    allStock.filter(x => x.branchId === (sessionStorage.getItem("reastock_branch_id") || "BRC-003")).map(s => {
      let mockImage = "";
      const cat = (s.category || s.type || "Umum").toLowerCase();
      if (cat === "elektronik") mockImage = "https://images.unsplash.com/photo-1558494949-ef0109583a85?w=200&h=200&fit=crop";
      else if (cat === "minuman") mockImage = "https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop";
      else if (cat === "pakaian") mockImage = "https://images.unsplash.com/photo-1586864387917-f538a5a94781?w=200&h=200&fit=crop";
      else mockImage = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop";

      return { ...s, image: s.image || mockImage, status: getStatusLabel(s.qty, s.minQty) };
    }),
    [allStock]
  );

  const tokoCategories = useMemo(() => [...new Set(tokoInventoryWithStatus.map(s => s.category || "Umum"))], [tokoInventoryWithStatus]);

  const filteredToko = useMemo(() => {
    let r = tokoInventoryWithStatus;
    if (filterCategory !== "Semua Kategori") r = r.filter(s => (s.category || "Umum") === filterCategory);
    if (filterStatus !== "Semua Status") r = r.filter(s => s.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(s => (s.name || "").toLowerCase().includes(q) || (s.sku || "").toLowerCase().includes(q));
    }
    if (activeTab === "Menipis") r = r.filter(s => s.status === "Menipis");
    else if (activeTab === "Habis") r = r.filter(s => s.status === "Habis");
    return r;
  }, [tokoInventoryWithStatus, filterCategory, filterStatus, searchQuery, activeTab]);

  const tokoSummary = useMemo(() => {
    const totalQty   = tokoInventoryWithStatus.reduce((s, x) => s + (x.qty || 0), 0);
    const aman       = tokoInventoryWithStatus.filter(x => x.status === "Aman");
    const menipis    = tokoInventoryWithStatus.filter(x => x.status === "Menipis");
    const habis      = tokoInventoryWithStatus.filter(x => x.status === "Habis");
    const amanQty    = aman.reduce((s, x) => s + (x.qty || 0), 0);
    const meningQty  = menipis.reduce((s, x) => s + (x.qty || 0), 0);
    const habisQty   = habis.reduce((s, x) => s + (x.qty || 0), 0);
    const pAman      = totalQty ? Math.round((amanQty / totalQty) * 100) : 0;
    const pMenipis   = totalQty ? Math.round((meningQty / totalQty) * 100) : 0;
    const pHabis     = totalQty ? Math.round((habisQty / totalQty) * 100) : 0;
    return { total: tokoInventoryWithStatus.length, totalQty, aman, menipis, habis, amanQty, meningQty, habisQty, pAman, pMenipis, pHabis };
  }, [tokoInventoryWithStatus]);

  const summaryCards = [
    { label:"Total Produk",    value: tokoSummary.total.toString(),              unit:"Produk", icon:"📦", iconClass:"summary-card__icon--purple" },
    { label:"Total Stok",      value: tokoSummary.totalQty.toLocaleString("id-ID"), unit:"Item", icon:"🌐", iconClass:"summary-card__icon--blue", subtext:"Berdasarkan hitungan fisik" },
    { label:"Stok Tersedia",   value: tokoSummary.amanQty.toLocaleString("id-ID"),  unit:"Item", icon:"✅", iconClass:"summary-card__icon--green", subtext:<><span style={{color:"#22c55e"}}>{tokoSummary.pAman}%</span> dari total stok</> },
    { label:"Stok Menipis",    value: tokoSummary.menipis.length.toString(),     unit:"Item", icon:"⚠️", iconClass:"summary-card__icon--orange", subtext:<><span style={{color:"#f97316"}}>{tokoSummary.pMenipis}%</span> dari total stok</> },
    { label:"Stok Habis",      value: tokoSummary.habis.length.toString(),       unit:"Item", icon:"🚫", iconClass:"summary-card__icon--red", subtext:<><span style={{color:"#ef4444"}}>{tokoSummary.pHabis}%</span> dari total stok</> },
  ];

  /* ─── STOK GUDANG (reference section) ─── */
  const branchStock = useMemo(() => {
    if (!selectedBranchId) return [];
    return allStock.filter(s => s.branchId === selectedBranchId).map(s => {
      let mockImage = "";
      const cat = (s.type || s.category || "Umum").toLowerCase();
      if (cat === "elektronik") mockImage = "https://images.unsplash.com/photo-1558494949-ef0109583a85?w=200&h=200&fit=crop";
      else if (cat === "minuman") mockImage = "https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop";
      else if (cat === "pakaian") mockImage = "https://images.unsplash.com/photo-1586864387917-f538a5a94781?w=200&h=200&fit=crop";
      else mockImage = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop";
      
      return { ...s, image: s.image || mockImage, status: getStatusLabel(s.qty, s.minQty) };
    });
  }, [allStock, selectedBranchId]);

  const handleReset = () => {
    setSearchQuery(""); setFilterCategory("Semua Kategori"); setFilterStatus("Semua Status"); setActiveTab("Semua Produk");
  };

  // Donut chart values (toko stock)
  const circ = 2 * Math.PI * 40;
  const amanDash = (tokoSummary.pAman / 100) * circ;
  const menipisDash = (tokoSummary.pMenipis / 100) * circ;
  const habisDash = (tokoSummary.pHabis / 100) * circ;

  // Category breakdown toko
  const tokoCatBreakdown = useMemo(() => {
    const map = {};
    tokoInventoryWithStatus.forEach(s => { const c = s.category || "Umum"; if (!map[c]) map[c] = 0; map[c] += s.qty || 0; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 4);
  }, [tokoInventoryWithStatus]);

  return (
    <div className="stok-produk">
      <TambahBarangModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:easing }}>

        {/* HEADER */}
        <header className="stok-produk__header">
          <div className="stok-produk__header-top">
            <div className="stok-produk__title-section">
              <h1>Stok &amp; Produk</h1>
              <p>Kelola inventaris barang toko dan pantau stok gudang secara real-time.</p>
            </div>
            <div className="header-actions">
              <button className="btn-tambah-barang" onClick={() => setShowAddModal(true)}>
                <span>➕</span> Tambah Barang
              </button>
              <button className="btn-request-stok" onClick={() => navigate("/toko/request")}>
                <span>📝</span> Request Stok
              </button>
            </div>
          </div>

          {/* MAIN TABS */}
          <div className="main-section-tabs">
            <button
              className={`section-tab ${mainTab === "stok-toko" ? "active" : ""}`}
              onClick={() => setMainTab("stok-toko")}
            >
              🏪 Stok Toko Saya
              <span className="section-tab__badge">{tokoInventoryWithStatus.length}</span>
            </button>
            <button
              className={`section-tab ${mainTab === "stok-gudang" ? "active" : ""}`}
              onClick={() => setMainTab("stok-gudang")}
            >
              🏭 Lihat Stok Gudang
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════
              SECTION: STOK TOKO SENDIRI
          ═══════════════════════════════════════ */}
          {mainTab === "stok-toko" && (
            <motion.div key="stok-toko" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.35 }}>

              {/* SUMMARY */}
              <section className="stok-produk__summary">
                {summaryCards.map((card, idx) => (
                  <motion.div key={idx} className="summary-card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+idx*0.05 }}>
                    <div className="summary-card__head">
                      <div className={`summary-card__icon ${card.iconClass}`}>{card.icon}</div>
                      <span className="summary-card__label">{card.label}</span>
                    </div>
                    <h2 className="summary-card__value">{card.value} <span style={{ fontSize:"12px", color:"#94a3b8" }}>{card.unit}</span></h2>
                    {card.subtext && <div className="summary-card__subtext">{card.subtext}</div>}
                  </motion.div>
                ))}
              </section>

              {/* HINT jika dari request */}
              {tokoInventoryWithStatus.some(i => i.source === "request") && (
                <div className="request-sync-banner">
                  <span>✅</span>
                  <span>Beberapa barang ditambahkan otomatis dari request yang diselesaikan.</span>
                </div>
              )}

              {/* MAIN GRID */}
              <div className="stok-produk__main">
                <section className="stok-content-box">
                  <div className="stok-filters">
                    <LockedSelect value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                      <option>Semua Kategori</option>
                      {tokoCategories.map(c => <option key={c}>{c}</option>)}
                    </LockedSelect>
                    <LockedSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option>Semua Status</option>
                      <option>Aman</option><option>Menipis</option><option>Habis</option>
                    </LockedSelect>
                    <div className="filter-search">
                      <span>🔍</span>
                      <input placeholder="Cari nama atau SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="btn-reset" onClick={handleReset}>Reset</button>
                  </div>

                  <div className="stok-tabs">
                    {["Semua Produk","Menipis","Habis"].map(tab => (
                      <button key={tab} className={`tab-item ${activeTab===tab?"active":""}`} onClick={() => setActiveTab(tab)}>
                        {tab}
                        {tab === "Menipis" && tokoSummary.menipis.length > 0 && <span className="tab-badge tab-badge--orange">{tokoSummary.menipis.length}</span>}
                        {tab === "Habis"   && tokoSummary.habis.length   > 0 && <span className="tab-badge tab-badge--red">{tokoSummary.habis.length}</span>}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {tokoInventoryWithStatus.length === 0 ? (
                      <motion.div key="empty-toko" className="empty-state" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
                        <div className="empty-state__icon">🏪</div>
                        <h3>Stok Toko Masih Kosong</h3>
                        <p>Tambah barang secara manual atau buat request ke gudang. Barang dari request yang selesai akan muncul otomatis di sini.</p>
                        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                          <button className="btn-tambah-barang" onClick={() => setShowAddModal(true)}>➕ Tambah Manual</button>
                          <button className="btn-request-stok" onClick={() => navigate("/toko/request")}>📝 Request ke Gudang</button>
                        </div>
                      </motion.div>
                    ) : filteredToko.length === 0 ? (
                      <motion.div key="empty-filter" className="empty-state" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                        <div className="empty-state__icon">🔍</div>
                        <h3>Tidak Ditemukan</h3>
                        <p>Tidak ada produk yang sesuai dengan filter.</p>
                        <button className="btn-reset" onClick={handleReset}>Reset Filter</button>
                      </motion.div>
                    ) : (
                      <motion.div key="grid" className="product-grid" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                        {filteredToko.map((p, idx) => (
                          <motion.div
                            key={p.sku}
                            className="product-card"
                            initial={{ opacity:0, scale:0.95 }}
                            animate={{ opacity:1, scale:1 }}
                            transition={{ delay:0.04*idx }}
                          >
                            <span className={`product-card__status status--${p.status.toLowerCase()}`}>{p.status}</span>
                            {p.source === "request" && <span className="product-card__source-badge">📦 Request</span>}
                            <div className="product-card__img-wrap" style={{ padding: 0, overflow: 'hidden' }}>
                              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <span className="product-card__name">{p.name}</span>
                            <span className="product-card__sku">SKU: {p.sku}</span>

                            <div className="product-card__info-row">
                              <span className="info-label">Kategori</span>
                              <span className="info-value">{p.category || "Umum"}</span>
                            </div>
                            <div className="product-card__info-row">
                              <span className="info-label">Satuan</span>
                              <span className="info-value">{p.unit || "pcs"}</span>
                            </div>
                            <div className="product-card__info-row">
                              <span className="info-label">Min. Stok</span>
                              <span className="info-value">{p.minQty || 5}</span>
                            </div>
                            <div className="product-card__info-row">
                              <span className="info-label">Stok</span>
                              <span className="info-value info-value--bold" style={{ color: p.qty === 0 ? "#ef4444" : p.qty <= (p.minQty||5) ? "#ea580c" : "#22c55e" }}>
                                {p.qty}
                              </span>
                            </div>

                            <div className="product-card__actions">
                              <button className="btn-icon" title="Detail" onClick={() => setDetailModal(p)}>👁️</button>
                              <button className="btn-icon btn-icon--danger" title="Hapus" onClick={() => deleteWarehouseStock(p.sku, sessionStorage.getItem("reastock_branch_id") || "BRC-003")}>🗑️</button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {filteredToko.length > 0 && (
                    <div className="pagination-area">
                      <span>Menampilkan {filteredToko.length} dari {tokoInventoryWithStatus.length} produk</span>
                    </div>
                  )}
                </section>

                {/* SIDEBAR STOK TOKO */}
                <aside className="stok-sidebar">
                  <div className="sidebar-widget">
                    <div className="widget-header"><h3 className="widget-title">Ringkasan Stok Toko</h3></div>
                    {tokoInventoryWithStatus.length === 0 ? (
                      <div className="sidebar-empty"><span>📊</span><p>Belum ada stok</p></div>
                    ) : (
                      <>
                        <div className="donut-mini">
                          <svg width="120" height="120" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray={`${amanDash} ${circ}`} strokeDashoffset={0} transform="rotate(-90 50 50)"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray={`${menipisDash} ${circ}`} strokeDashoffset={-amanDash} transform="rotate(-90 50 50)"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${habisDash} ${circ}`} strokeDashoffset={-(amanDash+menipisDash)} transform="rotate(-90 50 50)"/>
                            <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#94a3b8">TOTAL</text>
                            <text x="50" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">
                              {tokoSummary.totalQty > 999 ? `${(tokoSummary.totalQty/1000).toFixed(1)}k` : tokoSummary.totalQty}
                            </text>
                            <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">ITEM</text>
                          </svg>
                        </div>
                        <div className="category-list">
                          {[
                            { color:"#22c55e", label:"Stok Aman",    value: tokoSummary.amanQty,   p: `${tokoSummary.pAman}%` },
                            { color:"#f97316", label:"Stok Menipis", value: tokoSummary.meningQty, p: `${tokoSummary.pMenipis}%` },
                            { color:"#ef4444", label:"Stok Habis",   value: tokoSummary.habisQty,  p: `${tokoSummary.pHabis}%` },
                          ].map((item, i) => (
                            <div key={i} className="category-item">
                              <div className="cat-info">
                                <span style={{ width:"8px",height:"8px",borderRadius:"50%",background:item.color,display:"inline-block" }}></span>
                                {item.label}
                              </div>
                              <span className="cat-value">{item.value.toLocaleString("id-ID")} <span style={{fontSize:"10px"}}>({item.p})</span></span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {tokoCatBreakdown.length > 0 && (
                    <div className="sidebar-widget">
                      <h3 className="widget-title">Top Kategori</h3>
                      <div className="category-list">
                        {tokoCatBreakdown.map(([cat, total], i) => (
                          <div key={i} className="category-item">
                            <div className="cat-info">
                              <div className="cat-icon" style={{ background: catColors[cat]||"#f5f3ff" }}>{catIcons[cat]||"📦"}</div>
                              {cat}
                            </div>
                            <span className="cat-value" style={{ fontSize:"11px", fontWeight:600 }}>{total.toLocaleString("id-ID")} item</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(tokoSummary.menipis.length > 0 || tokoSummary.habis.length > 0) && (
                    <div className="sidebar-widget">
                      <div className="widget-header">
                        <h3 className="widget-title">Perlu Perhatian</h3>
                        <span className="widget-badge">{tokoSummary.menipis.length + tokoSummary.habis.length}</span>
                      </div>
                      <div className="mini-list">
                        {[...tokoSummary.menipis, ...tokoSummary.habis].slice(0, 5).map(p => (
                          <div key={p.sku} className="mini-item">
                            <div className="mini-img">{catIcons[p.category]||"📦"}</div>
                            <div className="mini-content">
                              <span className="mini-name">{p.name}</span>
                              <span className="mini-sub">Sisa {p.qty} {p.unit||"item"}</span>
                            </div>
                            <span className={`mini-status status--${p.status.toLowerCase()}`}>{p.status}</span>
                          </div>
                        ))}
                      </div>
                      <button className="btn-request-mini" onClick={() => navigate("/toko/request")}>
                        📝 Request ke Gudang
                      </button>
                    </div>
                  )}

                  {tokoInventoryWithStatus.length === 0 && (
                    <div className="sidebar-widget">
                      <h3 className="widget-title">Panduan</h3>
                      <div className="sidebar-guide">
                        {["Klik 'Tambah Barang' untuk input manual", "Atau buat Request ke gudang", "Barang selesai request akan muncul otomatis"].map((s,i) => (
                          <div key={i} className="guide-step">
                            <span className="guide-step__num">{i+1}</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              SECTION: STOK GUDANG (Reference)
          ═══════════════════════════════════════ */}
          {mainTab === "stok-gudang" && (
            <motion.div key="stok-gudang" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.35 }}>

              {/* WAREHOUSE SELECTOR */}
              <div className="warehouse-selector">
                <div className="warehouse-selector__label">
                  <span className="warehouse-selector__icon">🏭</span>
                  <span>Pilih Cabang Gudang</span>
                </div>
                <div className="warehouse-selector__tabs">
                  {gudangBranches.length === 0 ? (
                    <span className="warehouse-selector__empty">Belum ada cabang gudang</span>
                  ) : (
                    gudangBranches.map(branch => (
                      <button
                        key={branch.id}
                        className={`warehouse-tab ${selectedBranchId===branch.id?"active":""}`}
                        onClick={() => setSelectedBranchId(branch.id)}
                      >
                        <span className="warehouse-tab__dot"></span>
                        <span>{branch.name}</span>
                        {branch.location && <span className="warehouse-tab__loc">📍{branch.location}</span>}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {selectedBranch && (
                <motion.div className="active-branch-banner" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
                  <span className="active-branch-banner__icon">🏭</span>
                  <div>
                    <span className="active-branch-banner__name">{selectedBranch.name}</span>
                    <span className="active-branch-banner__info">
                      {selectedBranch.location} · {branchStock.length} jenis barang · {branchStock.reduce((s,x)=>s+(x.qty||0),0).toLocaleString("id-ID")} item total
                    </span>
                  </div>
                  <span className="active-branch-banner__live">● Live</span>
                </motion.div>
              )}

              {branchStock.length === 0 ? (
                <div className="empty-state" style={{ background:"var(--bg)", borderRadius:"20px", border:"1px solid var(--border)", padding:"60px" }}>
                  <div className="empty-state__icon">🏭</div>
                  <h3>Gudang Belum Memiliki Stok</h3>
                  <p>{selectedBranch ? `"${selectedBranch.name}" belum memiliki stok barang.` : "Pilih cabang gudang."}</p>
                  <button className="btn-request-stok" onClick={() => navigate("/toko/request")}>📝 Request Barang ke Gudang Ini</button>
                </div>
              ) : (
                <div className="gudang-stock-grid">
                  {branchStock.map((p, idx) => (
                    <motion.div
                      key={p.sku+p.branchId}
                      className="product-card"
                      initial={{ opacity:0, scale:0.95 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ delay:0.04*idx }}
                    >
                      <span className={`product-card__status status--${p.status.toLowerCase()}`}>{p.status}</span>
                      <div className="product-card__img-wrap" style={{ padding: 0, overflow: 'hidden' }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span className="product-card__name">{p.name}</span>
                      <span className="product-card__sku">SKU: {p.sku}</span>
                      <div className="product-card__info-row">
                        <span className="info-label">Kategori</span>
                        <span className="info-value">{p.type||"Umum"}</span>
                      </div>
                      <div className="product-card__info-row">
                        <span className="info-label">Stok</span>
                        <span className="info-value info-value--bold" style={{ color: p.qty===0?"#ef4444":p.qty<=(p.minQty||10)?"#ea580c":"#22c55e" }}>{p.qty}</span>
                      </div>
                      <div className="product-card__actions">
                        <button className="btn-request-item" onClick={() => navigate("/toko/request")}>📝 Request</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DETAIL MODAL */}
      <DetailModal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Detail Produk"
        subtitle={detailModal ? `${detailModal.sku} · ${detailModal.category || detailModal.type || "Umum"}` : ""}
        details={detailModal ? [
          { label:"Status Stok", value: detailModal.status, color: detailModal.status==="Aman"?"#22c55e":detailModal.status==="Menipis"?"#f97316":"#ef4444" },
          { label:"Satuan",      value: detailModal.unit || "pcs" },
          { label:"Min. Stok",   value: `${detailModal.minQty||5} item` },
          { label:"Sumber",      value: detailModal.source==="request" ? "Request ke Gudang" : "Input Manual" },
          ...(detailModal.price > 0 ? [{ label:"Harga Satuan", value: `Rp ${Number(detailModal.price).toLocaleString("id-ID")}` }] : []),
        ] : []}
        itemsTitle="Stok Tersedia"
        items={detailModal ? [`${detailModal.qty} ${detailModal.unit || "item"}`] : []}
      />
    </div>
  );
}