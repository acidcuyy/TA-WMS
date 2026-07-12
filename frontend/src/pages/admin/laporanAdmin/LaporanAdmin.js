import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeRequests, subscribeRestockToAdmin, subscribeAdminRestockToGudang, getWarehouseStock } from "../../../services/wmsApi";
import "./LaporanAdmin.css";

export default function LaporanAdmin() {
  const [requests, setRequests] = useState([]);
  const [restocks, setRestocks] = useState([]);
  const [adminRestocks, setAdminRestocks] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  
  const stockList = getWarehouseStock();
  const getItemName = (sku) => {
    const s = stockList.find(x => x.sku === sku);
    return s ? s.name : "Unknown Item";
  };

  useEffect(() => {
    const unsubReq = subscribeRequests((data) => setRequests(data || []));
    const unsubRes = subscribeRestockToAdmin((data) => setRestocks(data || []));
    const unsubAdminRes = subscribeAdminRestockToGudang((data) => setAdminRestocks(data || []));
    return () => {
      unsubReq();
      unsubRes();
      unsubAdminRes();
    };
  }, []);

  // Map completed requests to reports format
  const allReports = [...requests, ...restocks, ...adminRestocks]
    .filter(r => r.status === "Selesai")
    .map(r => {
      // Determine source based on fromName or fromId
      const isAdmin = r.id.startsWith("ARST");
      const isGudang = r.fromName && r.fromName.toLowerCase().includes("gudang");
      return {
        id: r.id,
        source: isAdmin ? "Admin" : isGudang ? "Gudang" : "Toko",
        sourceName: isAdmin ? "Admin Pusat" : (r.fromName || "Unknown"),
        type: r.type || "Penyelesaian Request",
        date: (r.updatedAt || r.completedAt || r.createdAt || "").split("T")[0] || "-", // simplified date
        author: "Sistem (Otomatis)",
        format: "Data Sistem",
        original: r
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  const filtered = allReports.filter(r => {
    if (filter !== "Semua" && r.source !== filter) return false;
    
    // Asumsikan r.date formatnya YYYY-MM-DD
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;

    return true;
  });

  const handlePrintSingle = (r) => {
    setSelectedReport([r]); // ALWAYS ARRAY NOW
  };

  const executePrint = () => {
    window.print();
  };

  const handlePrintBatch = () => {
    if (filtered.length === 0) {
      alert("Tidak ada laporan untuk dicetak pada rentang tanggal ini.");
      return;
    }
    setSelectedReport(filtered); // PASS ARRAY
  };

  return (
    <div className="laporan-admin">
      <header className="laporan-admin__header">
        <h1 className="laporan-admin__title">Arsip Laporan</h1>
        <p className="laporan-admin__subtitle">Pusat arsip dokumen laporan terotomatisasi dari seluruh request (Toko dan Gudang) yang telah diselesaikan.</p>
      </header>

      <div className="la-filters">
        {["Semua", "Admin", "Gudang", "Toko"].map(f => (
          <button 
            key={f} 
            className={`la-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "Semua" ? "Semua Laporan" : `Laporan ${f}`}
          </button>
        ))}

        <div className="la-date-filters">
          <input 
            type="date" 
            className="la-date-input" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
          />
          <span style={{ color: "var(--muted)", fontSize: "14px" }}>sampai</span>
          <input 
            type="date" 
            className="la-date-input" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
          />
          <button className="la-btn-print-batch" onClick={handlePrintBatch}>
            🖨 Cetak Semua Terpilih
          </button>
        </div>
      </div>

      <div className="la-card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            <span style={{ fontSize: "40px" }}>📭</span>
            <p>Belum ada request yang diselesaikan dari {filter === "Semua" ? "Toko maupun Gudang" : filter} pada periode ini.</p>
          </div>
        ) : (
          <table className="la-table">
            <thead>
              <tr>
                <th>ID Laporan</th>
                <th>Sumber</th>
                <th>Nama Cabang/Gudang</th>
                <th>Jenis Laporan</th>
                <th>Tanggal</th>
                <th>Author</th>
                <th>Format</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, i) => (
                  <motion.tr 
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td style={{ fontWeight: 600 }}>{r.id}</td>
                    <td>
                      <span className={`la-source-badge la-source--${r.source.toLowerCase()}`}>
                        {r.source}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.sourceName}</td>
                    <td>{r.type}</td>
                    <td>{r.date}</td>
                    <td>{r.author}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                        {r.format === "PDF" ? "📄" : "📊"} {r.format}
                      </div>
                    </td>
                    <td>
                      <button className="la-btn-preview" onClick={() => handlePrintSingle(r)}>
                        🖨 Cetak PDF
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {selectedReport && selectedReport.length > 0 && (
          <div className="la-preview-overlay" onClick={() => setSelectedReport(null)}>
            <motion.div 
              className="la-preview-modal"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="la-preview-header">
                <h2>Preview Dokumen ({selectedReport.length} Laporan)</h2>
                <button className="la-preview-close" onClick={() => setSelectedReport(null)}>✕</button>
              </div>

              <div className="la-preview-body">
                {selectedReport.map((rep, rIdx) => (
                  <div className="la-document-page" key={rIdx} style={{ pageBreakAfter: "always", marginBottom: rIdx < selectedReport.length - 1 ? "24px" : "0" }}>
                    <div className="la-doc-header">
                      <h1>REASTOCK WMS</h1>
                      <p>Bukti Penyelesaian Request Barang</p>
                    </div>

                    <div className="la-doc-meta">
                      <div className="la-doc-meta-col">
                        <span><strong>ID Request:</strong> {rep.id}</span>
                        <span><strong>Tanggal Penyelesaian:</strong> {rep.date}</span>
                      </div>
                      <div className="la-doc-meta-col" style={{ textAlign: "right" }}>
                        <span><strong>Asal / Pemohon:</strong> {rep.sourceName}</span>
                        <span><strong>Tujuan / Gudang:</strong> {rep.original?.targetName || "Gudang Pusat"}</span>
                      </div>
                    </div>

                    <table className="la-doc-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Kode Barang (SKU)</th>
                          <th>Nama Barang</th>
                          <th style={{ textAlign: "right" }}>Kuantitas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rep.original?.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{item.sku || item.itemCode || item.code || "-"}</td>
                            <td>{item.name || item.namaBarang || getItemName(item.sku || item.itemCode || item.code)}</td>
                            <td style={{ textAlign: "right" }}>{item.qty || item.jumlah || 0} Unit</td>
                          </tr>
                        ))}
                        {(!rep.original?.items || rep.original?.items.length === 0) && rep.original?.kodeBarang && (
                          <tr>
                            <td>1</td>
                            <td>{rep.original.kodeBarang}</td>
                            <td>{rep.original.namaBarang}</td>
                            <td style={{ textAlign: "right" }}>{rep.original.jumlah} {rep.original.satuan}</td>
                          </tr>
                        )}
                        {(!rep.original?.items || rep.original?.items.length === 0) && !rep.original?.kodeBarang && (
                          <tr>
                            <td colSpan="4" style={{ textAlign: "center", color: "#666" }}>
                              Tidak ada rincian barang.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* CONFIRMATION DATA */}
                    {(rep.original?.confirmationData || rep.original?.qtyGood != null) && (
                      <div style={{ marginTop: "20px", padding: "12px", border: "1px dashed #d9d9d9", background: "#fafafa" }}>
                        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Catatan & Konfirmasi Penerimaan</h4>
                        <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
                          <div><strong>Diterima Baik:</strong> {rep.original?.confirmationData?.qtyGood ?? rep.original?.qtyGood ?? "-"}</div>
                          <div style={{ color: "red" }}><strong>Rusak / Kurang:</strong> {rep.original?.confirmationData?.qtyBad ?? rep.original?.qtyBad ?? "0"}</div>
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "13px" }}>
                          <strong>Catatan:</strong> {rep.original?.confirmationData?.notes || rep.original?.confirmationNotes || "-"}
                        </div>
                      </div>
                    )}

                    {/* PROOF PHOTOS */}
                    <div style={{ marginTop: "20px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Bukti Foto</h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        {rep.original?.proofImage && (
                          <div style={{ width: "200px" }}>
                            <img src={rep.original.proofImage} alt="Bukti" style={{ width: "100%", border: "1px solid #ddd" }} />
                          </div>
                        )}
                        {["proofCheckBarang", "proofResiDriver", "proofPemasukanBarang"].map(key => {
                          if (!rep.original?.[key]) return null;
                          let imgs = [];
                          try { imgs = JSON.parse(rep.original[key] || "[]"); } catch(e){}
                          if (imgs.length === 0) return null;
                          return (
                            <div key={key} style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                              {imgs.map((src, i) => (
                                <div key={i} style={{ width: "150px" }}>
                                  <img src={src} alt={key} style={{ width: "100%", border: "1px solid #ddd" }} />
                                  <div style={{ fontSize: "10px", textAlign: "center", color: "#888", padding: "4px" }}>{key}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="la-doc-footer">
                      <div className="la-doc-sign">
                        <p>Dikeluarkan Oleh,</p>
                        <div className="la-doc-sign-line">Sistem (Otomatis)</div>
                      </div>
                      <div className="la-doc-sign">
                        <p>Diketahui Oleh,</p>
                        <div className="la-doc-sign-line">Admin {rep.sourceName}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="la-preview-actions">
                <button 
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => setSelectedReport(null)}
                >
                  Tutup
                </button>
                <button className="la-btn-print" onClick={executePrint}>
                  🖨 Unduh / Cetak PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
