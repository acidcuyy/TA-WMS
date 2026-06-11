import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import "./RequestsGudang.css";
import {
  gudangDecideRequest,
  gudangKirimBarang,
  subscribeRequests,
  subscribeAdminRestockToGudang,
  gudangAcceptAdminRestock,
  gudangUploadProofAndFinish
} from "../../../services/wmsApi";

const getStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("menunggu") || s.includes("pending")) return "pending";
  if (s.includes("memproses") || s.includes("accepted") || s.includes("diproses")) return "accepted";
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
  const [adminRestock, setAdminRestock] = useState([]);

  // Modals
  const [proofOpen, setProofOpen] = useState(false);
  const [proofImg, setProofImg] = useState(null);
  const [uploadModal, setUploadModal] = useState({ open: false, data: null });
  const [uploadPhotos, setUploadPhotos] = useState({ checkBarang: [], resiDriver: [], pemasukanBarang: [] });
  const [uploadData, setUploadData] = useState({ qtyGood: '', qtyBad: '', notes: '' });
  const [confirmModal, setConfirmModal] = useState({ open: false, requestId: null });
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubAdminReq = subscribeAdminRestockToGudang((rows) => setAdminRestock(rows || []));
    return () => { unsubReq?.(); unsubAdminReq?.(); };
  }, []);
  
  const openProof = (img) => {
    setProofImg(img);
    setProofOpen(true);
  };
  
  const displayedRequests = useMemo(() => {
    const tokoReq = allReq.filter((r) => (r.fromRole || "").toLowerCase() === "toko");
    
    // Convert admin restock to uniform structure for display
    const mappedAdminRestock = adminRestock.map(r => ({
      ...r,
      isFromAdmin: true,
      fromName: "Admin",
      toName: r.cabangGudangNama,
      fromRole: "admin"
    }));

    if (activeTab === "Dari Toko") return tokoReq;
    if (activeTab === "Restock Admin") return mappedAdminRestock;
    return [...tokoReq, ...mappedAdminRestock];
  }, [allReq, adminRestock, activeTab]);

  const stats = [
    { label: "Request Toko", value: allReq.filter(r => r.fromRole?.toLowerCase() === "toko").length, sub: "Total", icon: "📥", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Restock Admin", value: adminRestock.length, sub: "Total", icon: "📤", color: "#722ed1", bg: "#f9f0ff" },
    { label: "Pending", value: displayedRequests.filter(r => ["menunggu", "pending"].includes(r.status?.toLowerCase())).length, sub: "Perlu Tindakan", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Selesai", value: displayedRequests.filter(r => ["selesai", "done"].includes(r.status?.toLowerCase())).length, sub: "Bulan Ini", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
  ];

  const handleDecideToko = async (id, dec) => await gudangDecideRequest(id, dec);
  const handleKirimToko = async (id) => await gudangKirimBarang(id);

  // Admin Restock Actions
  const handleAcceptAdmin = (id) => {
    gudangAcceptAdminRestock(id);
  };

  const openUploadModal = (req) => {
    setUploadModal({ open: true, data: req });
    setUploadPhotos({ checkBarang: [], resiDriver: [], pemasukanBarang: [] });
    setUploadData({ qtyGood: req.jumlah || '', qtyBad: '', notes: '' });
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Small size to prevent localstorage quota issues
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (category, e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      compressImage(file, (dataUrl) => {
        setUploadPhotos(prev => ({
          ...prev,
          [category]: [...prev[category], dataUrl]
        }));
      });
    });
  };

  const removePhoto = (category, index) => {
    setUploadPhotos(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleFinishRequestClick = () => {
    if (!uploadModal.data) return;
    setConfirmModal({ open: true, requestId: uploadModal.data.id });
  };

  const confirmFinishRequest = () => {
    if (confirmModal.requestId) {
      gudangUploadProofAndFinish(confirmModal.requestId, uploadPhotos, uploadData);
      setUploadModal({ open: false, data: null });
    }
    setConfirmModal({ open: false, requestId: null });
  };

  return (
    <div className="gdash">
      <div className="rqGudang">
        {/* HEADER */}
        <header className="rqGudang__head">
          <div>
            <h1 className="rqGudang__title">Request Masuk</h1>
            <p className="rqGudang__subtitle">Kelola permintaan barang dari toko dan request admin.</p>
          </div>
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
            <div 
              key={r.id} 
              className="rqGudang__card clickable-card" 
              style={r.prioritas === 'Urgent' ? { border: '2px solid #ff4d4f' } : {}}
              onClick={() => setDetailModal({ open: true, data: r })}
            >
              <span className={`rqGudang__cardBadge ${getStatusClass(r.status)}`}>● {r.status || "Pending"}</span>
              <div className="rqGudang__imgWrap">
                <span style={{ fontSize: '40px' }}>{r.isFromAdmin ? "👨‍💼" : "🏪"}</span>
              </div>
              <h4 className="rqGudang__cardTitle">{r.id}</h4>
              <p className="rqGudang__cardSub">{r.isFromAdmin ? "Dari Admin" : (r.fromName || "Cabang")}</p>

              {r.isFromAdmin ? (
                // Layout Admin Restock
                <>
                  <div className="rqGudang__cardMeta" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Barang: <b className="truncate-text">{r.namaBarang}</b></div>
                    <div>Supplier: <b>{r.supplier}</b></div>
                    {r.prioritas === 'Urgent' && <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>⚠️ URGENT</div>}
                  </div>
                  <div className="rqGudang__cardRow">
                    <span>Total Qty</span>
                    <b className="rqGudang__cardValue">
                      {r.status === 'Selesai' && r.confirmationData 
                        ? `${r.confirmationData.qtyGood} ${r.satuan} (Diterima)`
                        : `${r.jumlah} ${r.satuan}`
                      }
                    </b>
                  </div>
                  
                  <div className="rqGudang__cardActions">
                    {r.status === "Pending" ? (
                      <button className="rqGudang__btn rqGudang__btn--primary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); handleAcceptAdmin(r.id); }}>Terima Request</button>
                    ) : r.status === "Diproses" ? (
                      <button className="rqGudang__btn rqGudang__btn--action" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); openUploadModal(r); }}>📸 Upload Bukti</button>
                    ) : r.status === "Selesai" ? (
                       <div style={{ color: "#52c41a", fontSize: "13px", fontWeight: 700, textAlign: 'center', width: '100%', padding: '8px', background: '#f6ffed', borderRadius: '8px' }}>✅ Selesai Diterima</div>
                    ) : null}
                  </div>
                </>
              ) : (
                // Layout Toko
                <>
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
                        <button className="rqGudang__btn rqGudang__btn--primary" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); handleDecideToko(r.id, "Accepted"); }}>Approve</button>
                        <button className="rqGudang__btn rqGudang__btn--ghost" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); handleDecideToko(r.id, "Declined"); }}>Decline</button>
                      </div>
                    ) : r.status === "Memproses" ? (
                      <button className="rqGudang__btn rqGudang__btn--primary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); handleKirimToko(r.id); }}>Siapkan & Kirim</button>
                    ) : r.status === "Siap Dikirim" ? (
                      <div style={{ fontSize: '13px', color: '#fa8c16', textAlign: 'center', width: '100%', padding: '8px', background: '#fff7e6', borderRadius: '8px', fontWeight: 600 }}>⏳ Menunggu Driver</div>
                    ) : r.status === "Mengirim" ? (
                      <button className="rqGudang__btn rqGudang__btn--ghost" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); navigate(`/gudang/pengiriman/${r.id}`); }}>📍 Pantau Lokasi</button>
                    ) : r.status === "Selesai" ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                        <div style={{ color: "#52c41a", fontSize: "13px", fontWeight: 700, textAlign: 'center', width: '100%', padding: '8px', background: '#f6ffed', borderRadius: '8px' }}>✅ Selesai Diterima</div>
                        {r.proofImage && (
                          <button 
                            className="rqGudang__btn rqGudang__btn--text" 
                            onClick={(e) => { e.stopPropagation(); openProof(r.proofImage); }}
                          >
                            Lihat Bukti Foto
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#ff4d4f', textAlign: 'center', width: '100%', padding: '8px', background: '#fff1f0', borderRadius: '8px', fontWeight: 600 }}>Ditolak</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        
        {/* REQUEST DETAIL MODAL */}
        {detailModal.open && detailModal.data && (
          <div className="rqGudang__modalOverlay" onClick={() => setDetailModal({ open: false, data: null })}>
             <motion.div 
               className="rqGudang__modal detailModal" 
               onClick={e => e.stopPropagation()} 
               initial={{ scale: 0.95, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               style={{ maxWidth: '600px', width: '90%' }}
             >
                <div className="rqGudang__modalHead">
                  <div>
                    <h3>Detail Request</h3>
                    <p>Request ID: {detailModal.data.id}</p>
                  </div>
                  <button onClick={() => setDetailModal({ open: false, data: null })}>✕</button>
                </div>
                <div className="rqGudang__modalBody" style={{ padding: '24px' }}>
                  <div className="detailCard">
                    <div className="detailRow">
                      <span className="detailLabel">Status</span>
                      <span className={`rqGudang__pill ${getStatusClass(detailModal.data.status)}`}>{detailModal.data.status}</span>
                    </div>
                    <div className="detailRow">
                      <span className="detailLabel">Tanggal</span>
                      <span className="detailValue">{detailModal.data.createdAt || '-'}</span>
                    </div>
                    <div className="detailRow">
                      <span className="detailLabel">Dari</span>
                      <span className="detailValue" style={{fontWeight: 700}}>{detailModal.data.fromName || "Admin"}</span>
                    </div>
                    <div className="detailRow">
                      <span className="detailLabel">Ke</span>
                      <span className="detailValue" style={{fontWeight: 700}}>{detailModal.data.toName || "Gudang"}</span>
                    </div>
                  </div>

                  {detailModal.data.isFromAdmin ? (
                    <div className="detailSection">
                      <h4>Informasi Barang</h4>
                      <div className="detailRow"><span className="detailLabel">Kode Barang</span><span className="detailValue">{detailModal.data.kodeBarang}</span></div>
                      <div className="detailRow"><span className="detailLabel">Nama Barang</span><span className="detailValue">{detailModal.data.namaBarang}</span></div>
                      <div className="detailRow"><span className="detailLabel">Jenis</span><span className="detailValue">{detailModal.data.jenisBarang}</span></div>
                      <div className="detailRow"><span className="detailLabel">Total Diminta</span><span className="detailValue" style={{color: 'var(--primary)', fontWeight: 800}}>{detailModal.data.jumlah} {detailModal.data.satuan}</span></div>
                      <div className="detailRow"><span className="detailLabel">Supplier</span><span className="detailValue">{detailModal.data.supplier}</span></div>
                      <div className="detailRow"><span className="detailLabel">Prioritas</span><span className="detailValue" style={detailModal.data.prioritas === 'Urgent' ? {color: '#ff4d4f', fontWeight: 'bold'} : {}}>{detailModal.data.prioritas}</span></div>
                      
                      {detailModal.data.status === 'Selesai' && detailModal.data.confirmationData && (
                        <>
                          <div className="detailRow"><span className="detailLabel">Diterima Baik</span><span className="detailValue" style={{color: '#52c41a', fontWeight: 700}}>{detailModal.data.confirmationData.qtyGood} {detailModal.data.satuan}</span></div>
                          {Number(detailModal.data.confirmationData.qtyBad) > 0 && (
                            <div className="detailRow"><span className="detailLabel">Rusak / Kurang</span><span className="detailValue" style={{color: '#ff4d4f', fontWeight: 700}}>{detailModal.data.confirmationData.qtyBad} {detailModal.data.satuan}</span></div>
                          )}
                        </>
                      )}

                      {detailModal.data.catatan && (
                        <div className="detailNote">
                          <strong>Catatan Admin:</strong>
                          <p>{detailModal.data.catatan}</p>
                        </div>
                      )}

                      {detailModal.data.status === 'Selesai' && detailModal.data.confirmationData?.notes && (
                        <div className="detailNote" style={{ marginTop: '12px', background: '#fff1f0', borderColor: '#ffccc7' }}>
                          <strong style={{ color: '#cf1322' }}>Catatan Kerusakan (Gudang):</strong>
                          <p style={{ color: '#a8071a' }}>{detailModal.data.confirmationData.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="detailSection">
                      <h4>Daftar Barang</h4>
                      <table className="detailTable">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(detailModal.data.items || []).map((it, idx) => (
                            <tr key={idx}>
                              <td>{it.sku || it.itemCode}</td>
                              <td style={{fontWeight: 700}}>{it.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {detailModal.data.note && (
                         <div className="detailNote">
                           <strong>Catatan Toko:</strong>
                           <p>{detailModal.data.note}</p>
                         </div>
                      )}

                      {detailModal.data.status === 'Selesai' && detailModal.data.confirmationData && (
                        <>
                          <div className="detailRow" style={{ marginTop: '16px' }}><span className="detailLabel">Diterima Baik</span><span className="detailValue" style={{color: '#52c41a', fontWeight: 700}}>{detailModal.data.confirmationData.qtyGood} pcs</span></div>
                          {Number(detailModal.data.confirmationData.qtyBad) > 0 && (
                            <div className="detailRow"><span className="detailLabel">Rusak / Kurang</span><span className="detailValue" style={{color: '#ff4d4f', fontWeight: 700}}>{detailModal.data.confirmationData.qtyBad} pcs</span></div>
                          )}
                          {detailModal.data.confirmationData.notes && (
                            <div className="detailNote" style={{ marginTop: '12px', background: '#fff1f0', borderColor: '#ffccc7' }}>
                              <strong style={{ color: '#cf1322' }}>Catatan Kerusakan (Toko):</strong>
                              <p style={{ color: '#a8071a' }}>{detailModal.data.confirmationData.notes}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="rqGudang__modalFooter" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="rqGudang__btn rqGudang__btn--primary" onClick={() => setDetailModal({ open: false, data: null })}>Tutup</button>
                </div>
             </motion.div>
          </div>
        )}

        {/* BUKTI FOTO TOKO MODAL */}
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
              <div className="rqGudang__modalBody" style={{ textAlign: 'center', padding: '24px' }}>
                <img src={proofImg} alt="Bukti" style={{ width: '100%', borderRadius: '12px' }} />
              </div>
              <div className="rqGudang__modalFooter">
                <button className="rqGudang__btn rqGudang__btn--primary" style={{ width: '100%' }} onClick={() => setProofOpen(false)}>Tutup</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ADMIN RESTOCK UPLOAD BUKTI MODAL */}
        {uploadModal.open && uploadModal.data && (
          <div className="rqGudang__modalOverlay" onClick={() => setUploadModal({ open: false, data: null })}>
            <motion.div 
              className="rqGudang__modal uploadProofModal" 
              onClick={e => e.stopPropagation()} 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: '700px', width: '90%' }}
            >
              <div className="rqGudang__modalHead">
                <div>
                  <h3>Upload Bukti Foto</h3>
                  <p>Request ID: {uploadModal.data.id} - {uploadModal.data.namaBarang}</p>
                </div>
                <button onClick={() => setUploadModal({ open: false, data: null })}>✕</button>
              </div>
              
              <div className="rqGudang__modalBody" style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                
                {/* 1. Check Barang */}
                <div className="uploadSection">
                  <div className="uploadSection__header">
                    <h4>a. Bukti Foto "Check Barang"</h4>
                    <label className="uploadBtn">
                      + Tambah Foto
                      <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload("checkBarang", e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div className="photoGrid">
                    {uploadPhotos.checkBarang.length === 0 && <span className="emptyText">Belum ada foto.</span>}
                    {uploadPhotos.checkBarang.map((img, idx) => (
                      <div key={idx} className="photoWrap">
                        <img src={img} alt="Check Barang" />
                        <button className="delBtn" onClick={() => removePhoto("checkBarang", idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Resi & Driver */}
                <div className="uploadSection">
                  <div className="uploadSection__header">
                    <h4>b. Bukti Foto "Resi & Driver"</h4>
                    <label className="uploadBtn">
                      + Tambah Foto
                      <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload("resiDriver", e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div className="photoGrid">
                    {uploadPhotos.resiDriver.length === 0 && <span className="emptyText">Belum ada foto.</span>}
                    {uploadPhotos.resiDriver.map((img, idx) => (
                      <div key={idx} className="photoWrap">
                        <img src={img} alt="Resi Driver" />
                        <button className="delBtn" onClick={() => removePhoto("resiDriver", idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Pemasukan Barang */}
                <div className="uploadSection">
                  <div className="uploadSection__header">
                    <h4>c. Bukti Foto "Pemasukan Barang"</h4>
                    <label className="uploadBtn">
                      + Tambah Foto
                      <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload("pemasukanBarang", e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div className="photoGrid">
                    {uploadPhotos.pemasukanBarang.length === 0 && <span className="emptyText">Belum ada foto.</span>}
                    {uploadPhotos.pemasukanBarang.map((img, idx) => (
                      <div key={idx} className="photoWrap">
                        <img src={img} alt="Pemasukan Barang" />
                        <button className="delBtn" onClick={() => removePhoto("pemasukanBarang", idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Konfirmasi Jumlah & Kondisi Barang */}
                <div className="uploadSection" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                  <div className="uploadSection__header" style={{ marginBottom: '16px' }}>
                    <h4>d. Konfirmasi Kondisi Barang</h4>
                  </div>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Diterima Baik (Sehat)</label>
                        <input 
                          type="number" 
                          min="0"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d9d9d9' }}
                          value={uploadData.qtyGood}
                          onChange={(e) => setUploadData({...uploadData, qtyGood: e.target.value})}
                          placeholder={`Req: ${uploadModal.data.jumlah}`}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Diterima Rusak / Kurang</label>
                        <input 
                          type="number" 
                          min="0"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d9d9d9' }}
                          value={uploadData.qtyBad}
                          onChange={(e) => setUploadData({...uploadData, qtyBad: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    {Number(uploadData.qtyBad) > 0 && (
                      <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#cf1322' }}>Catatan Kerusakan (Wajib diisi jika ada barang rusak)</label>
                        <textarea 
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ffccc7', minHeight: '80px', outlineColor: '#ff4d4f' }}
                          value={uploadData.notes}
                          onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
                          placeholder="Jelaskan kondisi barang yang rusak atau kurang..."
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="rqGudang__modalFooter" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="rqGudang__btn rqGudang__btn--ghost" onClick={() => setUploadModal({ open: false, data: null })}>Batal</button>
                <button 
                  className="rqGudang__btn rqGudang__btn--primary" 
                  onClick={handleFinishRequestClick}
                  disabled={Number(uploadData.qtyBad) > 0 && !uploadData.notes.trim()}
                  style={Number(uploadData.qtyBad) > 0 && !uploadData.notes.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Selesaikan Request
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CONFIRMATION MODAL */}
        {confirmModal.open && (
           <div className="rqGudang__modalOverlay" onClick={() => setConfirmModal({ open: false, requestId: null })} style={{ zIndex: 1100 }}>
             <motion.div 
               className="rqGudang__modal confirmModal" 
               onClick={e => e.stopPropagation()} 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               exit={{ scale: 0.9, opacity: 0 }}
               style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }}
             >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
                <h3 style={{ marginBottom: '8px' }}>Konfirmasi Selesai</h3>
                <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
                  Apakah Anda yakin akan menyelesaikan request ini? Pastikan semua bukti foto telah diunggah dengan benar.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="rqGudang__btn rqGudang__btn--ghost" style={{ flex: 1 }} onClick={() => setConfirmModal({ open: false, requestId: null })}>
                    Tidak
                  </button>
                  <button className="rqGudang__btn rqGudang__btn--primary" style={{ flex: 1 }} onClick={confirmFinishRequest}>
                    Ya, Selesaikan
                  </button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
