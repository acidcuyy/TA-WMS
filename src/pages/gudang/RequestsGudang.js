import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/common/Card";
import "./RequestsGudang.css";
import {
  createRestockToAdmin,
  gudangDecideRequest,
  gudangFinishRestockWithProof,
  gudangKirimBarang,
  startShipment,
  subscribeRequests,
  subscribeRestockToAdmin,
} from "../../services/wmsApi";

const getStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("menunggu") || s.includes("pending")) return "pending";
  if (s.includes("accepted") || s.includes("approved") || s.includes("proses")) return "accepted";
  if (s.includes("ditolak") || s.includes("declined")) return "declined";
  return "";
};

export default function RequestsGudang() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Semua Request");
  
  const [allReq, setAllReq] = useState([]);
  const [restockToAdmin, setRestockToAdmin] = useState([]);

  // Modals
  const [proofOpen, setProofOpen] = useState(false);
  const [proofReqId, setProofReqId] = useState(null);
  const [proofBase64, setProofBase64] = useState(null);
  const [restockOpen, setRestockOpen] = useState(false);
  const [restockNote, setRestockNote] = useState("");
  const [restockItems, setRestockItems] = useState([{ code: "", qty: "" }]);

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubRestock = subscribeRestockToAdmin((rows) => setRestockToAdmin(rows || []));
    return () => { unsubReq?.(); unsubRestock?.(); };
  }, []);

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
  const handleKirim = async (id) => { await gudangKirimBarang(id); await startShipment(id); };

  return (
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

      {/* FILTER BAR (Matched to Image) */}
      <div className="rqGudang__filterBar">
         <select className="rqGudang__select"><option>Semua Toko</option></select>
         <select className="rqGudang__select"><option>Semua Kategori</option></select>
         <select className="rqGudang__select"><option>Status Request</option></select>
         <div className="rqGudang__searchWrap">
            <span className="rqGudang__searchIcon">🔍</span>
            <input className="rqGudang__searchInput" placeholder="Cari ID Request, kode item, atau catatan..." />
         </div>
         <button className="rqGudang__reset">Reset</button>
      </div>

      {/* TABS */}
      <div className="rqGudang__tabs">
        {["Semua Request", "Dari Toko", "Restock Admin"].map(tab => (
          <div key={tab} className={`rqGudang__tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</div>
        ))}
      </div>

      {/* PRODUCT-LIST STYLE GRID (Matched to Image) */}
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
            <p className="rqGudang__cardSub">{r.fromName || (r.fromRole === 'toko' ? "Toko Cabang" : "Gudang Utama")}</p>
            
            <div className="rqGudang__cardMeta">
               <div>Items: <b>{(r.items || []).length} SKU</b></div>
               <div>Decision: <b className={getStatusClass(r.decision)}>{r.decision || "Pending"}</b></div>
            </div>

            <div className="rqGudang__cardRow">
               <span>Total Qty</span>
               <b className="rqGudang__cardValue">{(r.items || []).reduce((s,i) => s + Number(i.qty||0), 0)} Pcs</b>
            </div>

            <div className="rqGudang__cardActions">
               {["menunggu", "pending"].includes(r.status?.toLowerCase()) && r.fromRole?.toLowerCase() === 'toko' ? (
                 <>
                   <button className="rqGudang__pageBtn" onClick={() => handleDecide(r.id, "Accepted")}>✅</button>
                   <button className="rqGudang__pageBtn" onClick={() => handleDecide(r.id, "Declined")}>❌</button>
                 </>
               ) : (r.decision === "Accepted" || r.status === "Diproses") && r.fromRole?.toLowerCase() === 'toko' && r.status !== 'Mengirim' && r.status !== 'Selesai' ? (
                 <button className="pageAdmin__btnSmall" onClick={() => handleKirim(r.id)}>Kirim Barang</button>
               ) : r.status === 'Mengirim' ? (
                 <button className="pageAdmin__btnSmall isGhost" onClick={() => navigate(`/gudang/pengiriman/${r.id}`)}>Pantau</button>
               ) : (r.decision === "Accepted" || r.status === "Approved") && r.fromRole?.toLowerCase() === 'gudang' && r.status !== 'Selesai' ? (
                 <button className="pageAdmin__btnSmall" onClick={() => { setProofReqId(r.id); setProofOpen(true); }}>Selesai</button>
               ) : (
                 <button className="btn-icon">👁️</button>
               )}
               <button className="btn-icon">⋮</button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER / PAGINATION (Matched to Image) */}
      <footer className="rqGudang__footer">
         <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - {displayedRequests.length} dari {displayedRequests.length} data</span>
         <div className="rqGudang__pageControls">
            <select className="rqGudang__select" style={{ padding: '4px 8px', fontSize: '11px' }}><option>10 / halaman</option></select>
            <div style={{ display: 'flex', gap: '4px' }}>
               <button className="rqGudang__pageBtn" disabled>⟨</button>
               <button className="rqGudang__pageBtn active">1</button>
               <button className="rqGudang__pageBtn">2</button>
               <button className="rqGudang__pageBtn">3</button>
               <span style={{ padding: '0 4px' }}>...</span>
               <button className="rqGudang__pageBtn">325</button>
               <button className="rqGudang__pageBtn">⟩</button>
            </div>
         </div>
      </footer>

      {/* Modals here... (Same logic as before) */}
      <AnimatePresence>
        {restockOpen && (
           <div className="rqGudang__modalOverlay" onClick={() => setRestockOpen(false)}>
              <motion.div className="rqGudang__modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                 <div className="rqGudang__modalHead"><h3>Buat Request Restock</h3><button onClick={() => setRestockOpen(false)}>✕</button></div>
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
                    <button className="pageAdmin__btnSmall" onClick={() => setRestockOpen(false)}>Kirim</button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
