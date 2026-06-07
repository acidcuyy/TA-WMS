import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./RiwayatToko.css";
import { uploadTokoReport } from "../../../services/wmsApi";

export default function RiwayatToko() {
  const [activeTab, setActiveTab] = useState("Semua (32)");
  const easing = [0.22, 1, 0.36, 1];

  const summaryCards = [
    { label: "Total Laporan", value: "32", unit: "laporan", icon: "📄", iconClass: "summary-card__icon--purple" },
    { label: "Penjualan Bulan Ini", value: "Rp 58.250.000", unit: "156 transaksi", icon: "📈", iconClass: "summary-card__icon--green" },
    { label: "Pengeluaran", value: "Rp 42.350.000", unit: "96 transaksi", icon: "📤", iconClass: "summary-card__icon--orange" },
    { label: "Retur Penjualan", value: "18", unit: "transaksi", icon: "↩", iconClass: "summary-card__icon--red" },
    { label: "Penyesuaian Stok", value: "64", unit: "transaksi", icon: "⚖", iconClass: "summary-card__icon--blue" },
  ];

  const [reports, setReports] = useState([]);

  // Upload Modal State
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ type: "Laporan Harian" });
  const [file, setFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [toast, setToast] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setToast("Hanya file PDF yang diperbolehkan!");
        return;
      }
      // Limit file size to ~500KB to prevent localStorage QuotaExceededError
      if (selected.size > 500 * 1024) {
        setToast("Ukuran file terlalu besar! (Maks 500KB untuk versi demo ini)");
        return;
      }
      setFile(selected);
      setToast("");

      // Read as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleUploadSubmit = () => {
    if (!fileDataUrl) {
      setToast("Mohon pilih file PDF terlebih dahulu.");
      return;
    }

    uploadTokoReport({
      tokoId: "BRC-003",
      tokoName: "Toko Utama", // Assuming logged in as Toko Utama
      type: form.type,
      format: "PDF",
      fileData: fileDataUrl,
      author: "Admin Toko"
    });

    // Add dummy row to local view just for UI feedback
    setReports(prev => [
      { id: `RPT-${Math.floor(Math.random()*900)+100}`, type: form.type, author: "Admin Toko", format: "PDF", formatColor: "#ef4444", status: "Selesai" },
      ...prev
    ]);

    setOpenModal(false);
    setFile(null);
    setFileDataUrl(null);
    setForm({ type: "Laporan Harian" });
  };


  return (
    <div className="riwayat-toko">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* HEADER */}
        <header className="riwayat-toko__header">
          <div className="riwayat-toko__title-section">
            <h1>Laporan</h1>
            <p>Ringkasan laporan operasional toko, penjualan, stok, retur, dan aktivitas transaksi.</p>
          </div>
          <button className="btn-buat" onClick={() => setOpenModal(true)}>
            <span style={{ fontSize: "18px" }}>+</span> Buat Laporan
          </button>
        </header>

        {/* SUMMARY */}
        <section className="riwayat-toko__summary">
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
              <h2 className="summary-card__value">{card.value}</h2>
              <div className="summary-card__subtext">{card.unit}</div>
            </motion.div>
          ))}
        </section>

        {/* FILTERS */}
        <section className="riwayat-filters">
          <select className="filter-select"><option>Semua Jenis Laporan</option></select>
          <input type="text" className="filter-date" placeholder="01 Mei 2025 - 24 Mei 2025" />
          <select className="filter-select"><option>Semua Status</option></select>
          <div className="filter-search">
            <span>🔍</span>
            <input placeholder="Cari nama laporan, kode, atau periode..." />
          </div>
          <button className="btn-reset">Reset</button>
        </section>

        {/* PERFORMANCE CHART */}
        <section className="performance-chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Ringkasan Performa</h3>
            <div className="chart-actions-group">
              <div className="chart-legend">
                <div className="legend-item"><span className="legend-dot" style={{ background: "#f97316" }}></span> Penjualan</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: "#3b82f6" }}></span> Pengeluaran</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: "#ef4444" }}></span> Retur</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: "#22c55e" }}></span> Penyesuaian</div>
              </div>
              <select className="filter-select" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "10px" }}>
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
          </div>
          
          <div className="chart-wrapper-main">
            {/* Y Labels */}
            <div className="chart-y-axis">
              <span>Rp 10M</span>
              <span>Rp 7.5M</span>
              <span>Rp 5M</span>
              <span>Rp 2.5M</span>
              <span>0</span>
            </div>

            <div className="chart-svg-container">
              <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                <defs>
                  <linearGradient id="gradSale" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 50, 100, 150, 200].map(y => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                
                {/* Penjualan (Orange) - Area & Line */}
                <motion.path 
                  d="M0,150 C100,120 150,140 200,130 C250,120 350,100 400,110 C450,120 550,80 600,90 C650,100 750,75 800,85 L800,200 L0,200 Z" 
                  fill="url(#gradSale)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
                />
                <motion.path 
                  d="M0,150 C100,120 150,140 200,130 C250,120 350,100 400,110 C450,120 550,80 600,90 C650,100 750,75 800,85" 
                  fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Pengeluaran (Blue) - Area & Line */}
                <motion.path 
                  d="M0,175 C100,165 150,170 200,160 C250,150 350,145 400,150 C450,155 550,135 600,145 C650,155 750,135 800,140 L800,200 L0,200 Z" 
                  fill="url(#gradSpend)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}
                />
                <motion.path 
                  d="M0,175 C100,165 150,170 200,160 C250,150 350,145 400,150 C450,155 550,135 600,145 C650,155 750,135 800,140" 
                  fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
                />

                {/* Retur (Red) - Line Only */}
                <motion.path 
                  d="M0,190 C133,185 266,192 400,188 C533,184 666,190 800,182" 
                  fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="1,6"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 1.5 }}
                />

                {/* Penyesuaian (Green) - Line Only */}
                <motion.path 
                  d="M0,182 C133,178 266,180 400,172 C533,165 666,175 800,168" 
                  fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeDasharray="5,5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 1.5 }}
                />

                {/* Data points for Sales */}
                {[0, 200, 400, 600, 800].map((x, i) => {
                  const ys = [150, 130, 110, 90, 85];
                  return (
                    <motion.circle 
                      key={i} cx={x} cy={ys[i]} r="4.5" fill="white" stroke="#f97316" strokeWidth="2" 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + i * 0.1 }}
                    />
                  );
                })}
              </svg>
            </div>

            {/* X Labels */}
            <div className="chart-x-axis">
              <span>18 Mei</span><span>19 Mei</span><span>20 Mei</span><span>21 Mei</span><span>22 Mei</span><span>23 Mei</span><span>24 Mei</span>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="riwayat-toko__main">
          {/* LEFT CONTENT */}
          <section className="riwayat-content-box">
            <div className="riwayat-tabs">
              {["Semua (32)", "Draft (4)", "Selesai (24)", "Dijadwalkan (4)"].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <table className="riwayat-table">
              <thead>
                <tr>
                  <th>No. Laporan</th>
                  <th>Jenis Laporan</th>
                  <th>Dibuat Oleh</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, idx) => (
                  <motion.tr 
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.04 }}
                  >
                    <td style={{ fontWeight: 600 }}>{r.id}</td>
                    <td>{r.type}</td>
                    <td>{r.author}</td>
                    <td>
                      <div className="format-badge" style={{ color: r.formatColor }}>
                        {r.format === "PDF" ? "📄" : "📊"} {r.format}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status--${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}>👁️</button>
                        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}>⋮</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-area">
              <span>Menampilkan 1 - 7 dari 32 data</span>
              <div className="pagination-controls">
                <select className="filter-select" style={{ minWidth: "100px" }}>
                  <option>10 / halaman</option>
                </select>
                <button className="btn-page">‹</button>
                <button className="btn-page active">1</button>
                <button className="btn-page">2</button>
                <button className="btn-page">3</button>
                <button className="btn-page">4</button>
                <button className="btn-page">›</button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="riwayat-sidebar">
            <div className="sidebar-widget">
              <h3 className="widget-title">Jenis Laporan</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { icon: "💰", label: "Penjualan", val: "12" },
                  { icon: "📦", label: "Stok", val: "6" },
                  { icon: "📥", label: "Penerimaan", val: "4" },
                  { icon: "📤", label: "Pengeluaran", val: "3" },
                  { icon: "⚖", label: "Retur & Penyesuaian", val: "7" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{item.icon}</span>
                      <span style={{ color: "#64748b" }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.val} ❯</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Distribusi Laporan</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="94 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="47 251" strokeDashoffset="-94" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="47 251" strokeDashoffset="-141" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="31 251" strokeDashoffset="-188" />
                  <text x="50" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">32</text>
                  <text x="50" y="62" textAnchor="middle" fontSize="8" fill="#94a3b8">Laporan</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#f97316", label: "Penjualan", val: "12 (37,5%)" },
                  { color: "#3b82f6", label: "Stok", val: "6 (18,8%)" },
                  { color: "#22c55e", label: "Transaksi", val: "6 (18,8%)" },
                  { color: "#ef4444", label: "Retur", val: "4 (12,5%)" },
                  { color: "#94a3b8", label: "Audit", val: "4 (12,5%)" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color }}></span>
                      <span style={{ color: "#64748b" }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Aktivitas Terbaru</h3>
                <a href="#" style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 600 }}>Lihat Semua</a>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: "#f5f3ff" }}>📄</div>
                  <div className="activity-content">
                    <span className="activity-name">Laporan Penjualan 20-24 Mei 2025 dibuat</span>
                    <span className="activity-sub">oleh Admin Toko • 10:30 WIB</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: "#f0fdf4" }}>📊</div>
                  <div className="activity-content">
                    <span className="activity-name">Export Laporan Stok berhasil</span>
                    <span className="activity-sub">oleh Sistem • 09:45 WIB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ margin: 0 }}>Jadwal Otomatis</h3>
                <a href="#" style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 600 }}>Lihat Semua</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px" }}>
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>Laporan Penjualan Harian</span>
                    <span style={{ color: "#94a3b8" }}>25 Mei 2025, 18:00</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px" }}>
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>Laporan Stok Mingguan</span>
                    <span style={{ color: "#94a3b8" }}>26 Mei 2025, 08:00</span>
                  </div>
                </div>
              </div>
              <button style={{ width: "100%", marginTop: "16px", padding: "8px", borderRadius: "8px", border: "1px solid var(--primary)", background: "transparent", color: "var(--primary)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                ⚙ Atur Jadwal
              </button>
            </div>
          </aside>
        </div>
      </motion.div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {openModal && (
          <div className="rt-modal-overlay" onClick={() => setOpenModal(false)}>
            <motion.div 
              className="rt-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rt-modal-header">
                <div>
                  <h3>Upload Laporan Harian</h3>
                  <p>Laporan yang diupload akan dikirim ke halaman Manajemen Toko Pusat.</p>
                </div>
                <button className="rt-modal-close" onClick={() => setOpenModal(false)}>✕</button>
              </div>

              <div className="rt-modal-body">
                {toast && (
                  <div style={{ background: "#fff1f0", color: "#ff4d4f", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
                    {toast}
                  </div>
                )}
                <div className="rt-form-group">
                  <label>Jenis Laporan</label>
                  <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                    <option value="Laporan Harian">Laporan Harian</option>
                    <option value="Laporan Penjualan">Laporan Penjualan</option>
                    <option value="Laporan Stok">Laporan Stok</option>
                    <option value="Laporan Audit">Laporan Audit</option>
                  </select>
                </div>



                <div className="rt-form-group">
                  <label>File Laporan (PDF)</label>
                  <label className="rt-file-upload">
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
                    {file ? (
                      <div>
                        <strong>{file.name}</strong>
                        <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Klik untuk mengganti file</div>
                      </div>
                    ) : (
                      <div style={{ color: "var(--muted)", fontSize: "13px" }}>Klik untuk memilih file PDF laporan Anda</div>
                    )}
                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              <div className="rt-modal-footer">
                <button className="rt-btn-ghost" onClick={() => setOpenModal(false)}>Batal</button>
                <button className="rt-btn-primary" onClick={handleUploadSubmit}>Upload & Kirim</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
