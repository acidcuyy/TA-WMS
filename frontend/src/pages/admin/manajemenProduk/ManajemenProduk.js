import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeWarehouseStock, subscribeBranches, editWarehouseStock, deleteWarehouseStock } from "../../../services/wmsApi";
import "../PageAdmin.css";
import "./ManajemenProdukAdmin.css";

export default function ManajemenProduk() {
  const navigate = useNavigate();
  const [allStock, setAllStock] = useState([]);
  const [branches, setBranches] = useState([]);

  // State pemilihan cabang
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [viewedBranchId, setViewedBranchId] = useState(null); // null = belum lihat stok

  // Search bar
  const [search, setSearch] = useState("");

  // Modal State
  const [editModal, setEditModal] = useState(null);
  const [editQty, setEditQty] = useState(0);

  useEffect(() => {
    const unsubStock = subscribeWarehouseStock((data) => setAllStock(data || []));
    const unsubBranches = subscribeBranches((data) => setBranches(data || []));
    return () => {
      unsubStock();
      unsubBranches();
    };
  }, []);

  // Cabang yang dipilih objeknya
  const viewedBranch = useMemo(
    () => branches.find((b) => b.id === viewedBranchId) || null,
    [branches, viewedBranchId]
  );

  // Stok yang sudah difilter berdasarkan cabang yang dilihat + search
  const filteredStocks = useMemo(() => {
    if (!viewedBranchId) return [];
    return allStock
      .filter((s) => s.branchId === viewedBranchId)
      .map((stock) => {
        const branch = branches.find((b) => b.id === stock.branchId) || { name: "Unknown", type: "unknown" };
        let stockStatus = "Aman";
        if (stock.qty === 0) stockStatus = "Habis";
        else if (stock.qty <= (stock.minQty || 20)) stockStatus = "Stok rendah";

        const mockPrice = stock.type === "Elektronik" ? 450000 : stock.type === "Minuman" ? 8000 : 25000;

        let mockImage = "";
        const cat = (stock.type || stock.category || "Umum").toLowerCase();
        if (cat === "elektronik") mockImage = "https://images.unsplash.com/photo-1558494949-ef0109583a85?w=200&h=200&fit=crop";
        else if (cat === "minuman") mockImage = "https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop";
        else if (cat === "pakaian") mockImage = "https://images.unsplash.com/photo-1586864387917-f538a5a94781?w=200&h=200&fit=crop";
        else mockImage = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop";

        return {
          ...stock,
          branchName: branch.name,
          branchType: (branch.type || "").toLowerCase(),
          stockStatus,
          price: stock.price || mockPrice,
          image: stock.image || mockImage,
        };
      })
      .filter((s) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return s.name?.toLowerCase().includes(q) || s.sku?.toLowerCase().includes(q);
      });
  }, [allStock, branches, viewedBranchId, search]);

  // Statistik berdasarkan stok cabang yang dilihat (sebelum filter search)
  const branchStockRaw = useMemo(() => {
    if (!viewedBranchId) return [];
    return allStock.filter((s) => s.branchId === viewedBranchId);
  }, [allStock, viewedBranchId]);

  const stats = useMemo(() => {
    const totalProdukUnik = new Set(branchStockRaw.map((s) => s.sku)).size;
    const totalItemFisik = branchStockRaw.reduce((sum, s) => sum + s.qty, 0);
    const stokHabis = branchStockRaw.filter((s) => s.qty === 0).length;
    const stokRendah = branchStockRaw.filter((s) => s.qty > 0 && s.qty <= (s.minQty || 20)).length;
    return [
      { label: "Macam Produk", value: totalProdukUnik, hint: "SKU unik yang ditampilkan", icon: "📦", color: "#e4915a", bg: "#fff8f3" },
      { label: "Total Item Fisik", value: totalItemFisik, hint: "Jumlah Pcs keseluruhan", icon: "📊", color: "#4a90e2", bg: "#f0f7ff" },
      { label: "Stok Menipis", value: stokRendah, hint: "Butuh perhatian/restock", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Stok Habis (Kosong)", value: stokHabis, hint: "Tidak tersedia di cabang", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
    ];
  }, [branchStockRaw]);

  const handleLihatStok = () => {
    if (!selectedBranchId) return;
    setViewedBranchId(selectedBranchId);
    setSearch("");
  };

  const handleGantiCabang = () => {
    setViewedBranchId(null);
    setSearch("");
  };

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mpAdmin__head">
        <div>
          <h1 className="mpAdmin__title">Inventaris & Stok Global</h1>
          <p className="mpAdmin__subtitle">
            Pilih cabang untuk memantau stok produk yang tersebar di setiap Gudang dan Toko.
          </p>
        </div>
        <div className="mpAdmin__headRight">
          <span className="mtAdmin__badge mtAdmin__badge--live">
            <span className="mtAdmin__dot" />
            Live Inventory
          </span>
        </div>
      </header>

      {/* === TAMPILAN SEBELUM CABANG DIPILIH === */}
      <AnimatePresence mode="wait">
        {!viewedBranchId ? (
          <motion.div
            key="branch-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mpAdmin__branchSelectorWrap"
          >
            <div className="mpAdmin__branchSelectorCard">
              {/* Ilustrasi */}
              <div className="mpAdmin__branchIllustration">
                <div className="mpAdmin__branchIllustIcon">🏢</div>
              </div>

              <h2 className="mpAdmin__branchSelectorTitle">Pilih Cabang</h2>
              <p className="mpAdmin__branchSelectorDesc">
                Pilih cabang yang ingin Anda periksa stoknya, lalu klik <b>Lihat Stok</b>.
              </p>

              {branches.length === 0 ? (
                <p className="mpAdmin__branchEmpty">Belum ada cabang terdaftar di perusahaan ini.</p>
              ) : (
                <>
                  {/* Grid pilihan cabang */}
                  <div className="mpAdmin__branchGrid">
                    {branches.map((b) => {
                      const isSelected = selectedBranchId === b.id;
                      const isGudang = (b.type || "").toLowerCase() === "gudang";
                      return (
                        <button
                          key={b.id}
                          className={`mpAdmin__branchOption ${isSelected ? "mpAdmin__branchOption--active" : ""}`}
                          onClick={() => setSelectedBranchId(b.id)}
                        >
                          <span className="mpAdmin__branchOptionIcon">
                            {isGudang ? "🏬" : "🏪"}
                          </span>
                          <span className="mpAdmin__branchOptionName">{b.name}</span>
                          <span
                            className="mpAdmin__branchOptionType"
                            style={{
                              background: isGudang ? "#e6f7ff" : "#fff7e6",
                              color: isGudang ? "#1890ff" : "#fa8c16",
                            }}
                          >
                            {(b.type || "").toUpperCase()}
                          </span>
                          {isSelected && (
                            <span className="mpAdmin__branchOptionCheck">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="mpAdmin__lihatStokBtn"
                    disabled={!selectedBranchId}
                    onClick={handleLihatStok}
                  >
                    <span>🔍</span>
                    Lihat Stok
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          /* === TAMPILAN SETELAH CABANG DIPILIH === */
          <motion.div
            key="stock-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            {/* Breadcrumb / Info cabang aktif */}
            <div className="mpAdmin__activeBranchBar">
              <div className="mpAdmin__activeBranchInfo">
                <span className="mpAdmin__activeBranchIcon">
                  {(viewedBranch?.type || "").toLowerCase() === "gudang" ? "🏬" : "🏪"}
                </span>
                <div>
                  <span className="mpAdmin__activeBranchLabel">Melihat stok:</span>
                  <span className="mpAdmin__activeBranchName">{viewedBranch?.name || viewedBranchId}</span>
                  <span
                    className="mpAdmin__activeBranchType"
                    style={{
                      background: (viewedBranch?.type || "").toLowerCase() === "gudang" ? "#e6f7ff" : "#fff7e6",
                      color: (viewedBranch?.type || "").toLowerCase() === "gudang" ? "#1890ff" : "#fa8c16",
                    }}
                  >
                    {(viewedBranch?.type || "").toUpperCase()}
                  </span>
                </div>
              </div>
              <button className="mpAdmin__gantiCabangBtn" onClick={handleGantiCabang}>
                ← Ganti Cabang
              </button>
            </div>

            {/* STATS */}
            <div className="mpAdmin__stats">
              {stats.map((s, i) => (
                <Card key={i} className="mpAdmin__statCard">
                  <div className="mpAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div className="mpAdmin__statContent">
                    <p className="mpAdmin__statLabel">{s.label}</p>
                    <h3 className="mpAdmin__statValue">{s.value}</h3>
                    <p className="mpAdmin__statHint">{s.hint}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* SEARCH BAR */}
            <div className="mpAdmin__filterBar">
              <div className="mpAdmin__searchWrap" style={{ flex: 1, maxWidth: "100%" }}>
                <span className="mpAdmin__searchIcon">🔍</span>
                <input
                  placeholder={`Cari nama barang atau SKU di ${viewedBranch?.name || "cabang ini"}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {search && (
                <button
                  className="mpAdmin__clearSearchBtn"
                  onClick={() => setSearch("")}
                  title="Hapus pencarian"
                >
                  ✕ Hapus
                </button>
              )}
            </div>

            {/* INFO HASIL PENCARIAN */}
            {search && (
              <div className="mpAdmin__searchResult">
                Ditemukan <b>{filteredStocks.length}</b> barang yang cocok dengan &ldquo;<i>{search}</i>&rdquo;
              </div>
            )}

            {/* MAIN GRID */}
            <div className="mpAdmin__grid">
              {filteredStocks.length === 0 ? (
                <div className="mpAdmin__emptyState">
                  {search ? (
                    <>
                      <div className="mpAdmin__emptyIcon">🔍</div>
                      <p>Tidak ada barang yang cocok dengan pencarian <b>&ldquo;{search}&rdquo;</b>.</p>
                      <button className="mpAdmin__clearSearchBtn" onClick={() => setSearch("")}>
                        Hapus Pencarian
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mpAdmin__emptyIcon">📭</div>
                      <p>Cabang <b>{viewedBranch?.name}</b> belum memiliki data stok.</p>
                    </>
                  )}
                </div>
              ) : (
                filteredStocks.map((p, i) => {
                  const isAman = p.stockStatus === "Aman";
                  const isHabis = p.stockStatus === "Habis";
                  const badgeClass = isAman ? "aman" : isHabis ? "habis" : "rendah";

                  return (
                    <motion.div
                      key={`${p.sku}-${p.branchId}-${i}`}
                      className="mpAdmin__productCard"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                    >
                      <span className={`mpAdmin__badge ${badgeClass}`}>
                        ● {p.stockStatus}
                      </span>
                      <div className="mpAdmin__imgWrap">
                        {p.image ? <img src={p.image} alt={p.name} /> : "📦"}
                      </div>
                      <h4 className="mpAdmin__prodName">{p.name}</h4>
                      <p className="mpAdmin__prodSKU">{p.sku}</p>
                      <div className="mpAdmin__prodMeta">
                        <div><span>Kategori:</span> <b>{p.type || "General"}</b></div>
                        <div><span>Lokasi:</span> <b>{p.branchName}</b></div>
                      </div>
                      <div className="mpAdmin__stockRow">
                        <span>Sisa Stok (Fisik)</span>
                        <b className={`mpAdmin__stockValue ${badgeClass}`}>{p.qty} Unit</b>
                      </div>
                      <div className="mpAdmin__prodActions">
                        <button
                          className="btn-icon"
                          title="Edit Stok Manual"
                          onClick={() => { setEditModal(p); setEditQty(p.qty); }}
                        >✏️</button>
                        <button
                          className="btn-icon btn-icon--danger"
                          title="Hapus Produk"
                          onClick={() => {
                            if (window.confirm(`Hapus produk ${p.name}?`)) {
                              deleteWarehouseStock(p.sku, p.branchId);
                            }
                          }}
                        >🗑️</button>
                        <button
                          className="btn-icon"
                          title="Detail Pergerakan Stok"
                          onClick={() => navigate("/admin/laporan")}
                        >📊</button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL EDIT STOK */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setEditModal(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#fff", padding: "24px", borderRadius: "16px", width: "400px", maxWidth: "90%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, color: "#1e293b" }}>Edit Stok Manual</h3>
              <p style={{ color: "#64748b", fontSize: "13px" }}>Ubah jumlah fisik untuk produk <b>{editModal.name}</b></p>

              <div style={{ marginTop: "20px", marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "8px", color: "#1e293b" }}>Sisa Stok (Fisik) Terbaru</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value.replace(/[^0-9]/g, "")))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  onClick={() => setEditModal(null)}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", color: "#64748b", fontWeight: "600" }}
                >Batal</button>
                <button
                  onClick={() => {
                    editWarehouseStock(editModal.sku, editModal.branchId, editQty);
                    setEditModal(null);
                  }}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "none", background: "var(--primary)", color: "#fff", cursor: "pointer", fontWeight: "bold" }}
                >Simpan Perubahan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
