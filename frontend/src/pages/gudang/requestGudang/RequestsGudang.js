// ntar gue garap -JorloJor
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import "./RequestsGudang.css";
import {
  gudangDecideRequest,
  gudangKirimBarang,
  subscribeRequests,
  subscribeRestockToAdmin,
} from "../../../services/wmsApi";

const getStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("menunggu") || s.includes("pending")) return "pending";
  if (s.includes("memproses") || s.includes("accepted")) return "accepted";
  if (s.includes("mengirim") || s.includes("shipping")) return "shipping";
  if (s.includes("siap")) return "ready";
  if (s.includes("selesai") || s.includes("done")) return "done";
  if (s.includes("declined") || s.includes("ditolak")) return "declined";
  return "";
};

export default function RequestsGudang() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Semua Request");

  const [allReq, setAllReq] = useState([]);
  const [restockToAdmin, setRestockToAdmin] = useState([]);

  // Modals
  const [restockOpen, setRestockOpen] = useState(false);
  const [restockItems, setRestockItems] = useState([{ code: "", qty: "" }]);
  const [proofOpen, setProofOpen] = useState(false);
  const [proofImg, setProofImg] = useState(null);

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubRestock = subscribeRestockToAdmin((rows) => setRestockToAdmin(rows || []));
    return () => { unsubReq?.(); unsubRestock?.(); };
  }, []);

  const openProof = (img) => {
    setProofImg(img);
    setProofOpen(true);
  };

  // ... rest of the component logic ...

  // Update the button in the grid:
  // {r.proofImage && <button className="btn-action-small" style={{ fontSize: '10px' }} onClick={() => openProof(r.proofImage)}>Lihat Bukti Foto</button>}

  const displayedRequests = useMemo(() => {
    const tokoReq = allReq.filter((r) => (r.fromRole || "").toLowerCase() === "toko");
    if (activeTab === "Dari Toko") return tokoReq;
    if (activeTab === "Restock Admin") return restockToAdmin;
    return [...tokoReq, ...restockToAdmin];
  }, [allReq, restockToAdmin, activeTab]);

  const stats = [
    { label: "Request Toko", value: allReq.filter(r => r.fromRole?.toLowerCase() === "toko").length, sub: "Total", icon: "📥", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Restock Admin", value: restockToAdmin.length, sub: "Total", icon: "📤", color: "#722ed1", bg: "#f9f0ff" },
    { label: "Pending", value: displayedRequests.filter(r => ["menunggu", "pending"].includes(r.status?.toLowerCase())).length, sub: "Perlu Tindakan", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Selesai", value: displayedRequests.filter(r => ["selesai", "done"].includes(r.status?.toLowerCase())).length, sub: "Bulan Ini", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
  ];

  const handleDecide = async (id, dec) => await gudangDecideRequest(id, dec);
  const handleKirim = async (id) => await gudangKirimBarang(id);

  return (
    <div className="gdash">
      <div className="rqGudang">
        {/* HEADER */}
        <header className="rqGudang__head">
          <div>
            <h1 className="rqGudang__title">Request Masuk</h1>
            <p className="rqGudang__subtitle">Kelola permintaan barang dari toko dan restok gudang ke admin.</p>
          </div>
          <button className="logout-btn" style={{ width: 'auto', padding: '12px 24px', background: '#f86c14', color: 'white' }} onClick={() => setRestockOpen(true)}>
            + Buat Restock
          </button>
        </header>

        {/* STATS */}
        <div className="rqGudang__stats">
          {stats.map((s, i) => (
            <Card key={i} className="rqGudang__statCard">
              <div className="rqGudang__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="rqGudang__statMain">
                <p className="rqGudang__statLabel">{s.label}</p>
                <h3 className="rqGudang__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.sub}</span></h3>
              </div>
            </Card>
          ))}
        </div>

        {/* TABS */}
        <div className="rqGudang__tabs">
          {["Semua Request", "Dari Toko", "Restock Admin"].map(tab => (
            <div key={tab} className={`rqGudang__tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</div>
          ))}
        </div>

        {/* PRODUCT-LIST STYLE GRID */}
        <div className="rqGudang__grid">
          {displayedRequests.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#888' }}>Tidak ada request ditemukan.</div>
          ) : displayedRequests.map((r) => (
            <div key={r.id} className="rqGudang__card">
              <span className={`rqGudang__cardBadge ${getStatusClass(r.status)}`}>● {r.status || "Pending"}</span>
              <div className="rqGudang__imgWrap">
                <span style={{ fontSize: '40px' }}>{r.fromRole?.toLowerCase() === 'toko' ? "🏪" : "🏢"}</span>
              </div>
              <h4 className="rqGudang__cardTitle">{r.id}</h4>
              <p className="rqGudang__cardSub">{r.fromName || "Cabang"}</p>

              <div className="rqGudang__cardMeta">
                <div>Items: <b>{(r.items || []).length} SKU</b></div>
                <div>Target: <b>{r.toName || "Gudang Pusat"}</b></div>
              </div>

              <div className="rqGudang__cardRow">
                <span>Total Qty</span>
                <b className="rqGudang__cardValue">{(r.items || []).reduce((s, i) => s + Number(i.qty || 0), 0)} Pcs</b>
              </div>

              <div className="rqGudang__cardActions">
                {["menunggu", "pending"].includes(r.status?.toLowerCase()) ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button className="pageAdmin__btnSmall" style={{ flex: 1 }} onClick={() => handleDecide(r.id, "Accepted")}>Approve</button>
                    <button className="pageAdmin__btnSmall isGhost" style={{ flex: 1 }} onClick={() => handleDecide(r.id, "Declined")}>Decline</button>
                  </div>
                ) : r.status === "Memproses" ? (
                  <button className="pageAdmin__btnSmall" style={{ width: '100%' }} onClick={() => handleKirim(r.id)}>Siapkan & Kirim</button>
                ) : r.status === "Siap Dikirim" ? (
                  <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', width: '100%' }}>⏳ Menunggu Driver...</div>
                ) : r.status === "Mengirim" ? (
                  <button className="pageAdmin__btnSmall isGhost" style={{ width: '100%' }} onClick={() => navigate(`/gudang/pengiriman/${r.id}`)}>📍 Pantau Lokasi</button>
                ) : r.status === "Selesai" ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', alignItems: 'center' }}>
                    <span style={{ color: "#52c41a", fontSize: "12px", fontWeight: 600 }}>✅ Selesai Diterima</span>
                    {r.proofImage && (
                      <button
                        className="btn-action-small"
                        style={{ fontSize: '10px', color: 'var(--primary)', textDecoration: 'underline' }}
                        onClick={() => openProof(r.proofImage)}
                      >
                        Lihat Bukti Foto
                      </button>
                    )}
                  </div>
                ) : (
                  <button className="btn-icon" style={{ width: '100%' }}>Tutup</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals here... */}
      <AnimatePresence>
        {restockOpen && (
          <div className="rqGudang__modalOverlay" onClick={() => setRestockOpen(false)}>
            <motion.div className="rqGudang__modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="rqGudang__modalHead"><h3>Buat Request Restock ke Admin</h3><button onClick={() => setRestockOpen(false)}>✕</button></div>
              <div className="rqGudang__modalBody">
                {restockItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input className="rqGudang__searchInput" style={{ paddingLeft: '12px' }} placeholder="Kode SKU" value={item.code} onChange={e => setRestockItems(prev => prev.map((it, i) => i === idx ? { ...it, code: e.target.value } : it))} />
                    <input className="rqGudang__searchInput" style={{ paddingLeft: '12px', width: '80px' }} placeholder="Qty" type="number" value={item.qty} onChange={e => setRestockItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: e.target.value } : it))} />
                  </div>
                ))}
                <button className="rqGudang__reset" onClick={() => setRestockItems([...restockItems, { code: "", qty: "" }])}>+ Tambah Baris</button>
              </div>
              <div className="rqGudang__modalFooter">
                <button className="pageAdmin__btnSmall isGhost" onClick={() => setRestockOpen(false)}>Batal</button>
                <button className="pageAdmin__btnSmall" onClick={() => setRestockOpen(false)}>Kirim ke Admin</button>
              </div>
            </motion.div>
          </div>
        )}

        {proofOpen && (
          <div className="rqGudang__modalOverlay" onClick={() => setProofOpen(false)}>
            <motion.div
              className="rqGudang__modal"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="rqGudang__modalHead"><h3>Bukti Penerimaan</h3><button onClick={() => setProofOpen(false)}>✕</button></div>
              <div className="rqGudang__modalBody" style={{ textAlign: 'center' }}>
                <img src={proofImg} alt="Bukti" style={{ width: '100%', borderRadius: '12px' }} />
              </div>
              <div className="rqGudang__modalFooter">
                <button className="pageAdmin__btnSmall primary" style={{ width: '100%' }} onClick={() => setProofOpen(false)}>Tutup</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
