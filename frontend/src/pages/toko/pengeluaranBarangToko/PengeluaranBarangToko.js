import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DetailModal from "../../../components/common/DetailModal";
import {
  subscribeWarehouseStock,
  subscribeTokoOutflow,
  createTokoOutflow,
} from "../../../services/wmsApi";
import "./PengeluaranBarangToko.css";
import LockedSelect from "../../../components/common/LockedSelect";

const easing = [0.22, 1, 0.36, 1];

const JENIS_OPTIONS = ["Penjualan", "Retur Gudang", "Penyesuaian Stok", "Rusak/Expired", "Lainnya"];

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" })
    + " " + d.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
}

/* ─── Tambah Pengeluaran Modal ─── */
function TambahPengeluaranModal({ isOpen, onClose, inventory }) {
  const [jenis, setJenis] = useState("Penjualan");
  const [tujuan, setTujuan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [pin, setPin] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(x => x.sku === item.sku);
      if (exists) return prev.filter(x => x.sku !== item.sku);
      return [...prev, { ...item, outQty: 1 }];
    });
  };

  const setQty = (sku, val) => {
    setSelectedItems(prev => prev.map(x => x.sku === sku ? { ...x, outQty: Math.max(1, Number(val)) } : x));
  };

  const handleSubmit = () => {
    setError("");
    if (selectedItems.length === 0) { setError("Pilih minimal 1 barang yang akan dikeluarkan."); return; }
    if (!tujuan.trim()) { setError("Tujuan pengeluaran harus diisi."); return; }
    if (!penanggungJawab.trim()) { setError("Nama Penanggung Jawab harus diisi untuk keamanan."); return; }
    if (pin !== "123456") { setError("PIN Keamanan salah. Masukkan PIN yang valid (123456)."); return; }

    // Validasi stok cukup
    for (const si of selectedItems) {
      const inv = inventory.find(x => x.sku === si.sku);
      if (!inv || inv.qty < si.outQty) {
        setError(`Stok "${si.name}" tidak mencukupi. Tersedia: ${inv?.qty || 0}`);
        return;
      }
    }

    setSaving(true);
    createTokoOutflow({
      items: selectedItems.map(x => ({ sku: x.sku, name: x.name, qty: x.outQty, unit: x.unit })),
      tujuan,
      jenis,
      catatan,
    });
    setSaving(false);
    onClose();
    setSelectedItems([]);
    setTujuan("");
    setCatatan("");
    setJenis("Penjualan");
    setPenanggungJawab("");
    setPin("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="outflow-modal"
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.93, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 30 }}
          transition={{ duration: 0.3, ease: easing }}
        >
          <div className="outflow-modal__header">
            <div>
              <h2 className="outflow-modal__title">📤 Tambah Pengeluaran</h2>
              <p className="outflow-modal__sub">Pilih barang yang akan dikeluarkan dari stok toko</p>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="outflow-modal__body">
            {/* Info Fields */}
            <div className="modal-form-grid">
              <div className="modal-field">
                <label>Jenis Pengeluaran</label>
                <select value={jenis} onChange={e => setJenis(e.target.value)}>
                  {JENIS_OPTIONS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label>Tujuan *</label>
                <input
                  placeholder="cth: Pelanggan, Nama Toko, dll."
                  value={tujuan}
                  onChange={e => setTujuan(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>Penanggung Jawab *</label>
                <input
                  placeholder="Nama karyawan/PIC"
                  value={penanggungJawab}
                  onChange={e => setPenanggungJawab(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>PIN Keamanan *</label>
                <input
                  type="password"
                  placeholder="Masukkan 6 digit PIN (123456)"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="modal-field modal-field--full">
                <label>Catatan (opsional)</label>
                <input
                  placeholder="Catatan tambahan..."
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                />
              </div>
            </div>

            {/* Item selector */}
            <h4 className="modal-section-title">Pilih Barang</h4>
            {inventory.length === 0 ? (
              <div className="modal-empty">
                <span>📦</span>
                <p>Stok toko kosong. Tambah barang di Stok &amp; Produk terlebih dahulu.</p>
              </div>
            ) : (
              <div className="item-select-list">
                {inventory.map(item => {
                  const sel = selectedItems.find(x => x.sku === item.sku);
                  return (
                    <div
                      key={item.sku}
                      className={`item-select-row ${sel ? "selected" : ""}`}
                      onClick={() => toggleItem(item)}
                    >
                      <div className="item-select-check">{sel ? "☑" : "☐"}</div>
                      <div className="item-select-info">
                        <span className="item-select-name">{item.name}</span>
                        <span className="item-select-sku">SKU: {item.sku} · Tersedia: {item.qty} {item.unit}</span>
                      </div>
                      {sel && (
                        <div className="item-select-qty" onClick={e => e.stopPropagation()}>
                          <label>Jml</label>
                          <input
                            type="number"
                            min={1}
                            max={item.qty}
                            value={sel.outQty}
                            onChange={e => setQty(item.sku, e.target.value)}
                          />
                          <span>{item.unit}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {error && <div className="modal-error">⚠️ {error}</div>}
          </div>

          <div className="outflow-modal__footer">
            <button className="btn-modal-cancel" onClick={onClose}>Batal</button>
            <button className="btn-modal-submit" onClick={handleSubmit} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */
export default function PengeluaranBarangToko() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua Jenis");
  const [detailModal, setDetailModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [outflows, setOutflows] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const unsubOut = subscribeTokoOutflow(data => {
      const currentBranchId = sessionStorage.getItem("reastock_branch_id") || "BRC-003";
      setOutflows((data || []).filter(o => o.tokoId === currentBranchId || (!o.tokoId && currentBranchId === "BRC-003")));
    });
    const unsubInv = subscribeWarehouseStock(data => setInventory((data || []).filter(x => x.branchId === (sessionStorage.getItem("reastock_branch_id") || "BRC-003"))));
    return () => { unsubOut(); unsubInv(); };
  }, []);

  const jenisList = useMemo(() => [...new Set(outflows.map(o => o.jenis).filter(Boolean))], [outflows]);

  const filtered = useMemo(() => {
    let r = outflows;
    if (filterJenis !== "Semua Jenis") r = r.filter(o => o.jenis === filterJenis);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(o =>
        o.id?.toLowerCase().includes(q) ||
        o.tujuan?.toLowerCase().includes(q) ||
        o.jenis?.toLowerCase().includes(q) ||
        (o.items || []).some(i => (i.name || i.sku || "").toLowerCase().includes(q))
      );
    }
    return r;
  }, [outflows, filterJenis, searchQuery]);

  // Summary
  const totalTrx      = outflows.length;
  const totalItemOut  = outflows.reduce((s, o) => s + (o.totalQty || 0), 0);
  const today         = new Date().toISOString().slice(0, 10);
  const todayCount    = outflows.filter(o => o.createdAt?.slice(0, 10) === today).length;
  const jenisCount    = [...new Set(outflows.map(o => o.jenis))].length;

  const summaryCards = [
    { label: "Total Pengeluaran",  value: totalTrx,     unit: "transaksi", icon: "📤", iconClass: "summary-card__icon--purple", subtext: "Semua catatan pengeluaran" },
    { label: "Total Item Keluar",  value: totalItemOut,  unit: "item",      icon: "📦", iconClass: "summary-card__icon--blue",   subtext: "Dari semua transaksi" },
    { label: "Jenis Pengeluaran",  value: jenisCount,    unit: "jenis",     icon: "📑", iconClass: "summary-card__icon--green",  subtext: "Kategori pengeluaran" },
    { label: "Pengeluaran Hari Ini",value: todayCount,   unit: "transaksi", icon: "📅", iconClass: "summary-card__icon--orange", subtext: "Hari ini" },
    { label: "Stok Toko",          value: inventory.length, unit: "produk", icon: "🏪", iconClass: "summary-card__icon--red",   subtext: "Jenis barang di toko" },
  ];

  // Breakdown per jenis untuk sidebar
  const jenisBreakdown = useMemo(() => {
    const map = {};
    outflows.forEach(o => {
      const j = o.jenis || "Lainnya";
      if (!map[j]) map[j] = 0;
      map[j] += o.totalQty || 0;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [outflows]);

  const jenisColors = {
    "Penjualan": "#22c55e",
    "Retur Gudang": "#3b82f6",
    "Penyesuaian Stok": "#f97316",
    "Rusak/Expired": "#ef4444",
    "Lainnya": "#94a3b8",
  };

  const recentActivity = useMemo(() =>
    [...outflows].slice(0, 5),
    [outflows]
  );

  const handleReset = () => {
    setSearchQuery("");
    setFilterJenis("Semua Jenis");
    setActiveTab("Semua");
  };

  return (
    <div className="pengeluaran-toko">
      <TambahPengeluaranModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        inventory={inventory}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="pengeluaran-toko__header">
          <div className="pengeluaran-toko__title-section">
            <h1>Pengeluaran Barang</h1>
            <p>Catat dan kelola semua barang yang keluar dari toko untuk penjualan, retur, atau penyesuaian.</p>
          </div>
          <button className="btn-tambah-pengeluaran" onClick={() => setShowAddModal(true)}>
            <span>📤</span> Tambah Pengeluaran
          </button>
        </header>

        {/* SUMMARY */}
        <section className="pengeluaran-toko__summary">
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
              <h2 className="summary-card__value">
                {card.value.toLocaleString("id-ID")}{" "}
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{card.unit}</span>
              </h2>
              <div className="summary-card__subtext">{card.subtext}</div>
            </motion.div>
          ))}
        </section>

        {/* MAIN GRID */}
        <div className="pengeluaran-toko__main">
          {/* LEFT CONTENT */}
          <section className="pengeluaran-content-box">
            {/* FILTERS */}
            <div className="pengeluaran-filters">
              <LockedSelect
                value={filterJenis}
                onChange={e => setFilterJenis(e.target.value)}
              >
                <option>Semua Jenis</option>
                {jenisList.map(j => <option key={j}>{j}</option>)}
              </LockedSelect>
              <div className="filter-search">
                <span>🔍</span>
                <input
                  placeholder="Cari ID, tujuan, atau nama barang..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-reset" onClick={handleReset}>Reset</button>
            </div>

            {/* TABLE */}
            <AnimatePresence mode="wait">
              {outflows.length === 0 ? (
                <motion.div
                  key="empty"
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="empty-state__icon">📤</div>
                  <h3>Belum Ada Pengeluaran</h3>
                  <p>Belum ada catatan barang keluar dari toko. Klik tombol "Tambah Pengeluaran" untuk mencatat pengeluaran barang.</p>
                  <button className="btn-tambah-pengeluaran" onClick={() => setShowAddModal(true)}>
                    <span>📤</span> Tambah Pengeluaran
                  </button>
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div
                  key="no-result"
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="empty-state__icon">🔍</div>
                  <h3>Tidak Ditemukan</h3>
                  <p>Tidak ada pengeluaran yang cocok dengan filter.</p>
                  <button className="btn-reset" onClick={handleReset}>Reset Filter</button>
                </motion.div>
              ) : (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <table className="pengeluaran-table">
                    <thead>
                      <tr>
                        <th>ID Pengeluaran</th>
                        <th>Jenis</th>
                        <th>Tujuan</th>
                        <th>Barang</th>
                        <th>Total Item</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, idx) => {
                        const itemNames = (row.items || []).slice(0, 2).map(i => i.name || i.sku).join(", ");
                        const moreCount = (row.items || []).length - 2;
                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.04 * idx }}
                          >
                            <td><span className="cell-id">{row.id}</span></td>
                            <td>
                              <span
                                className="cell-jenis"
                                style={{ background: jenisColors[row.jenis] + "20", color: jenisColors[row.jenis] || "#64748b" }}
                              >
                                {row.jenis || "-"}
                              </span>
                            </td>
                            <td className="cell-tujuan">{row.tujuan || "-"}</td>
                            <td>
                              <div className="cell-items-out">
                                <span>{itemNames || "-"}</span>
                                {moreCount > 0 && <span className="cell-items__more">+{moreCount} lagi</span>}
                              </div>
                            </td>
                            <td><span className="cell-qty">{(row.totalQty || 0).toLocaleString("id-ID")} item</span></td>
                            <td className="cell-date">{formatDate(row.createdAt)}</td>
                            <td>
                              <span className="status-badge status--selesai">Selesai</span>
                            </td>
                            <td>
                              <button className="btn-action" title="Detail" onClick={() => setDetailModal(row)}>👁️</button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="pagination-area">
                    <span>Menampilkan {filtered.length} dari {outflows.length} data</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="pengeluaran-sidebar">
            {/* Ringkasan */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Ringkasan Pengeluaran</h3>
              {outflows.length === 0 ? (
                <div className="sidebar-empty"><span>📊</span><p>Belum ada data</p></div>
              ) : (
                <div className="sidebar-stats">
                  {[
                    { label: "Total Transaksi", val: totalTrx,     unit: "transaksi" },
                    { label: "Total Item Keluar",val: totalItemOut, unit: "item" },
                    { label: "Hari Ini",         val: todayCount,   unit: "transaksi" },
                    { label: "Rata-rata",        val: totalTrx > 0 ? Math.round(totalItemOut / totalTrx) : 0, unit: "item/transaksi" },
                  ].map((s, i) => (
                    <div key={i} className="sidebar-stat-row">
                      <span className="sidebar-stat-label">{s.label}</span>
                      <span className="sidebar-stat-val">
                        {s.val.toLocaleString("id-ID")} <span className="sidebar-stat-unit">{s.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Breakdown per jenis */}
            {jenisBreakdown.length > 0 && (
              <div className="sidebar-widget">
                <h3 className="widget-title">Pengeluaran per Jenis</h3>
                <div className="sidebar-gudang-list">
                  {jenisBreakdown.map(([jns, total], i) => {
                    const pct = totalItemOut > 0 ? Math.round((total / totalItemOut) * 100) : 0;
                    const color = jenisColors[jns] || "#94a3b8";
                    return (
                      <div key={i} className="gudang-bar-item">
                        <div className="gudang-bar-header">
                          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <span style={{ width:8, height:8, borderRadius:"50%", background:color, display:"inline-block" }}></span>
                            <span className="gudang-bar-name">{jns}</span>
                          </div>
                          <span className="gudang-bar-count">{total} item ({pct}%)</span>
                        </div>
                        <div className="gudang-bar-track">
                          <motion.div
                            className="gudang-bar-fill"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aktivitas terbaru */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Aktivitas Terbaru</h3>
              {recentActivity.length === 0 ? (
                <div className="sidebar-empty"><span>📋</span><p>Belum ada aktivitas</p></div>
              ) : (
                <div className="activity-list">
                  {recentActivity.map(o => (
                    <div key={o.id} className="activity-item">
                      <div className="activity-icon" style={{ background: (jenisColors[o.jenis] || "#64748b") + "15" }}>
                        {o.jenis === "Penjualan" ? "🛒" : o.jenis === "Retur Gudang" ? "↩️" : o.jenis === "Penyesuaian Stok" ? "⚖️" : "📤"}
                      </div>
                      <div className="activity-content">
                        <span className="activity-name">{o.jenis} ke {o.tujuan || "-"}</span>
                        <span className="activity-sub">{o.id} · {o.totalQty} item</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </motion.div>

      {/* DETAIL MODAL */}
      <DetailModal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Detail Pengeluaran Barang"
        subtitle={detailModal ? `${detailModal.id} · ${detailModal.jenis}` : ""}
        details={detailModal ? [
          { label: "Jenis",   value: detailModal.jenis || "-" },
          { label: "Tujuan",  value: detailModal.tujuan || "-" },
          { label: "Tanggal", value: formatDate(detailModal.createdAt) },
          { label: "Catatan", value: detailModal.catatan || "-" },
          { label: "Status",  value: "Selesai", color: "#22c55e" },
        ] : []}
        itemsTitle="Barang Dikeluarkan"
        items={detailModal
          ? (detailModal.items || []).map(i => `${i.name || i.sku} — ${i.qty} ${i.unit || "item"}`)
          : []}
      />
    </div>
  );
}
