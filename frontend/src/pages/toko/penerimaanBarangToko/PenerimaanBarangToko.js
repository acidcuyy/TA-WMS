import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DetailModal from "../../../components/common/DetailModal";
import { subscribeRequests, getBranches } from "../../../services/wmsApi";
import "./PenerimaanBarangToko.css";

const easing = [0.22, 1, 0.36, 1];

/**
 * Memetakan status request ke label & style yang sesuai untuk halaman penerimaan.
 * Hanya request dengan fromRole === "toko" yang ditampilkan.
 */
function mapStatus(status) {
  const map = {
    Menunggu:      { label: "Menunggu",  cls: "menunggu" },
    Memproses:     { label: "Diproses",  cls: "diproses" },
    "Siap Dikirim":{ label: "Dikirim",   cls: "dikirim"  },
    Pickup:        { label: "Dikirim",   cls: "dikirim"  },
    Mengirim:      { label: "Dikirim",   cls: "dikirim"  },
    "Diterima Toko":{ label: "Diterima", cls: "diterima" },
    Selesai:       { label: "Selesai",   cls: "selesai"  },
    Declined:      { label: "Ditolak",   cls: "ditolak"  },
  };
  return map[status] || { label: status, cls: "menunggu" };
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function totalItems(items = []) {
  return items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
}

export default function PenerimaanBarangToko() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGudang, setFilterGudang] = useState("Semua Gudang");
  const [detailModal, setDetailModal] = useState(null);
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);

  // Subscribe to live data
  useEffect(() => {
    const unsub = subscribeRequests((data) => {
      // Hanya tampilkan request dari toko (fromRole === "toko")
      setRequests(data.filter((r) => r.fromRole === "toko"));
    });
    setBranches(getBranches());
    return () => unsub();
  }, []);

  // Daftar gudang unik dari requests
  const gudangList = useMemo(() => {
    const names = [...new Set(requests.map((r) => r.toName || r.toBranchId))];
    return names;
  }, [requests]);

  // Tab counts
  const counts = useMemo(() => ({
    Semua:     requests.length,
    Menunggu:  requests.filter(r => r.status === "Menunggu").length,
    Dikirim:   requests.filter(r => ["Siap Dikirim","Pickup","Mengirim"].includes(r.status)).length,
    Diterima:  requests.filter(r => ["Diterima Toko","Selesai"].includes(r.status)).length,
    Ditolak:   requests.filter(r => r.status === "Declined").length,
  }), [requests]);

  const tabs = ["Semua", "Menunggu", "Dikirim", "Diterima", "Ditolak"];

  // Filter logic
  const filtered = useMemo(() => {
    let result = requests;

    // Tab filter
    if (activeTab === "Menunggu") result = result.filter(r => r.status === "Menunggu" || r.status === "Memproses");
    else if (activeTab === "Dikirim") result = result.filter(r => ["Siap Dikirim","Pickup","Mengirim"].includes(r.status));
    else if (activeTab === "Diterima") result = result.filter(r => ["Diterima Toko","Selesai"].includes(r.status));
    else if (activeTab === "Ditolak") result = result.filter(r => r.status === "Declined");

    // Gudang filter
    if (filterGudang !== "Semua Gudang") {
      result = result.filter(r => (r.toName || r.toBranchId) === filterGudang);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.id?.toLowerCase().includes(q) ||
        (r.toName || "").toLowerCase().includes(q) ||
        (r.items || []).some(i => (i.name || i.sku || "").toLowerCase().includes(q))
      );
    }

    return result;
  }, [requests, activeTab, filterGudang, searchQuery]);

  // Summary stats
  const totalTrx      = requests.length;
  const totalItemCount = requests.reduce((s, r) => s + totalItems(r.items), 0);
  const diterimaCount = requests.filter(r => ["Diterima Toko","Selesai"].includes(r.status)).length;
  const menungguCount = requests.filter(r => r.status === "Menunggu" || r.status === "Memproses").length;

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = requests.filter(r => r.createdAt === today).length;

  const summaryCards = [
    { label: "Total Request",     value: totalTrx,       unit: "transaksi", icon: "📋", iconClass: "summary-card__icon--purple", subtext: "Semua request ke gudang" },
    { label: "Total Item Diminta",value: totalItemCount,  unit: "item",      icon: "📦", iconClass: "summary-card__icon--blue",   subtext: "Dari semua request" },
    { label: "Sudah Diterima",    value: diterimaCount,   unit: "transaksi", icon: "✅", iconClass: "summary-card__icon--green",  subtext: "Barang sudah masuk toko" },
    { label: "Request Hari Ini",  value: todayCount,      unit: "transaksi", icon: "📅", iconClass: "summary-card__icon--orange", subtext: "Dibuat hari ini" },
    { label: "Menunggu / Proses", value: menungguCount,   unit: "transaksi", icon: "⏳", iconClass: "summary-card__icon--red",    subtext: "Belum selesai" },
  ];

  // Aktivitas terbaru (5 request terakhir apapun statusnya)
  const recentActivity = useMemo(() =>
    [...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [requests]
  );

  const handleReset = () => {
    setSearchQuery("");
    setFilterGudang("Semua Gudang");
    setActiveTab("Semua");
  };

  return (
    <div className="penerimaan-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="penerimaan-toko__header">
          <div className="penerimaan-toko__title-section">
            <h1>Penerimaan Barang</h1>
            <p>Daftar barang masuk ke toko berdasarkan request yang dikirim ke gudang.</p>
          </div>
          <button
            className="btn-buat-request"
            onClick={() => navigate("/toko/request")}
          >
            <span>📝</span> Buat Request
          </button>
        </header>

        {/* SUMMARY */}
        <section className="penerimaan-toko__summary">
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
        <div className="penerimaan-toko__main">
          {/* LEFT CONTENT */}
          <section className="penerimaan-content-box">
            {/* FILTERS */}
            <div className="penerimaan-filters">
              <select
                className="filter-select"
                value={filterGudang}
                onChange={e => setFilterGudang(e.target.value)}
              >
                <option>Semua Gudang</option>
                {gudangList.map(g => <option key={g}>{g}</option>)}
              </select>
              <div className="filter-search">
                <span>🔍</span>
                <input
                  placeholder="Cari ID request, gudang, atau produk..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-reset" onClick={handleReset}>Reset</button>
            </div>

            {/* TABS */}
            <div className="penerimaan-tabs">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {counts[tab] > 0 && (
                    <span className={`tab-count ${tab === "Ditolak" ? "tab-count--red" : tab === "Menunggu" ? "tab-count--orange" : ""}`}>
                      {counts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TABLE */}
            <AnimatePresence mode="wait">
              {requests.length === 0 ? (
                <motion.div
                  key="empty-no-request"
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="empty-state__icon">📭</div>
                  <h3>Belum Ada Request</h3>
                  <p>Toko belum pernah mengirim request ke gudang. Buat request terlebih dahulu untuk memesan barang dari gudang.</p>
                  <button className="btn-buat-request" onClick={() => navigate("/toko/request")}>
                    <span>📝</span> Buat Request Sekarang
                  </button>
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div
                  key="empty-filter"
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="empty-state__icon">🔍</div>
                  <h3>Tidak Ada Hasil</h3>
                  <p>Tidak ada request yang cocok dengan filter yang dipilih.</p>
                  <button className="btn-reset" onClick={handleReset}>Reset Filter</button>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <table className="penerimaan-table">
                    <thead>
                      <tr>
                        <th>ID Request</th>
                        <th>Gudang Sumber</th>
                        <th>Tanggal Request</th>
                        <th>Daftar Barang</th>
                        <th>Total Item</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, idx) => {
                        const st = mapStatus(row.status);
                        const total = totalItems(row.items);
                        const itemNames = (row.items || [])
                          .slice(0, 2)
                          .map(i => i.name || i.sku)
                          .join(", ");
                        const moreCount = (row.items || []).length - 2;

                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + idx * 0.04 }}
                          >
                            <td>
                              <span className="cell-id">{row.id}</span>
                            </td>
                            <td>
                              <div className="cell-source">
                                <span className="cell-source__icon">🏭</span>
                                <span>{row.toName || row.toBranchId || "-"}</span>
                              </div>
                            </td>
                            <td className="cell-date">{formatDate(row.createdAt)}</td>
                            <td>
                              <div className="cell-items">
                                <span>{itemNames || "-"}</span>
                                {moreCount > 0 && (
                                  <span className="cell-items__more">+{moreCount} lagi</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="cell-qty">{total} item</span>
                            </td>
                            <td>
                              <span className={`status-badge status--${st.cls}`}>
                                {st.label}
                              </span>
                            </td>
                            <td>
                              <div className="action-btns">
                                <button
                                  className="btn-action"
                                  title="Lihat Detail"
                                  onClick={() => setDetailModal(row)}
                                >
                                  👁️
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="pagination-area">
                    <span>Menampilkan {filtered.length} dari {requests.length} data</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="penerimaan-sidebar">
            {/* Ringkasan */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Ringkasan Penerimaan</h3>
              {requests.length === 0 ? (
                <div className="sidebar-empty">
                  <span>📊</span>
                  <p>Belum ada data</p>
                </div>
              ) : (
                <div className="sidebar-stats">
                  {[
                    { label: "Total Request",    val: totalTrx,       unit: "transaksi" },
                    { label: "Total Item",        val: totalItemCount, unit: "item" },
                    { label: "Sudah Diterima",   val: diterimaCount,  unit: "transaksi" },
                    { label: "Menunggu/Proses",  val: menungguCount,  unit: "transaksi" },
                  ].map((s, i) => (
                    <div key={i} className="sidebar-stat-row">
                      <span className="sidebar-stat-label">{s.label}</span>
                      <span className="sidebar-stat-val">
                        {s.val.toLocaleString("id-ID")}{" "}
                        <span className="sidebar-stat-unit">{s.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Distribusi per gudang */}
            {requests.length > 0 && gudangList.length > 0 && (
              <div className="sidebar-widget">
                <h3 className="widget-title">Request per Gudang</h3>
                <div className="sidebar-gudang-list">
                  {gudangList.map((g, i) => {
                    const cnt = requests.filter(r => (r.toName || r.toBranchId) === g).length;
                    const pct = totalTrx ? Math.round((cnt / totalTrx) * 100) : 0;
                    const colors = ["#6366f1","#22c55e","#f97316","#3b82f6","#ef4444"];
                    return (
                      <div key={i} className="gudang-bar-item">
                        <div className="gudang-bar-header">
                          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <span style={{ width:8, height:8, borderRadius:"50%", background: colors[i % colors.length], display:"inline-block" }}></span>
                            <span className="gudang-bar-name">{g}</span>
                          </div>
                          <span className="gudang-bar-count">{cnt} req ({pct}%)</span>
                        </div>
                        <div className="gudang-bar-track">
                          <motion.div
                            className="gudang-bar-fill"
                            style={{ background: colors[i % colors.length] }}
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
              <div className="widget-header-row">
                <h3 className="widget-title">Aktivitas Terbaru</h3>
              </div>
              {recentActivity.length === 0 ? (
                <div className="sidebar-empty">
                  <span>📋</span>
                  <p>Belum ada aktivitas</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivity.map((r) => {
                    const st = mapStatus(r.status);
                    const iconMap = {
                      diterima: { icon: "✅", bg: "#f0fdf4" },
                      selesai:  { icon: "✅", bg: "#f0fdf4" },
                      dikirim:  { icon: "🚚", bg: "#eff6ff" },
                      ditolak:  { icon: "❌", bg: "#fef2f2" },
                      menunggu: { icon: "⏳", bg: "#fff7ed" },
                      diproses: { icon: "⚙️", bg: "#f5f3ff" },
                    };
                    const ic = iconMap[st.cls] || { icon: "📋", bg: "#f8fafc" };
                    return (
                      <div key={r.id} className="activity-item">
                        <div className="activity-icon" style={{ background: ic.bg }}>
                          {ic.icon}
                        </div>
                        <div className="activity-content">
                          <span className="activity-name">
                            Request ke {r.toName || r.toBranchId}
                          </span>
                          <span className="activity-sub">{r.id} · {r.createdAt}</span>
                        </div>
                        <span className={`mini-status status--${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
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
        title="Detail Request Barang"
        subtitle={detailModal ? `${detailModal.id} · ${detailModal.toName || detailModal.toBranchId}` : ""}
        details={detailModal ? [
          { label: "Gudang Tujuan",   value: detailModal.toName || detailModal.toBranchId || "-" },
          { label: "Tanggal Request", value: formatDate(detailModal.createdAt) },
          { label: "Catatan",         value: detailModal.note || "-" },
          {
            label: "Status",
            value: mapStatus(detailModal.status).label,
            color: {
              diterima: "#22c55e", selesai: "#22c55e",
              dikirim:  "#3b82f6",
              ditolak:  "#ef4444",
              menunggu: "#f97316", diproses: "#8b5cf6",
            }[mapStatus(detailModal.status).cls] || "#64748b"
          },
        ] : []}
        itemsTitle="Barang yang Diminta"
        items={detailModal
          ? (detailModal.items || []).map(i => `${i.name || i.sku} — ${i.qty} item`)
          : []
        }
      />
    </div>
  );
}
