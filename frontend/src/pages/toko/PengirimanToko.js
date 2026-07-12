import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { completeShipmentByToko, subscribeShipment, subscribeRequests } from "../../services/wmsApi";
import TrackingMap from "../../components/common/TrackingMap";
import "./PengirimanToko.css";

/* ── Helpers ── */
function formatETA(ms) {
  if (ms <= 0) return "Sudah Tiba";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} detik`;
  return `${min} mnt ${sec.toString().padStart(2, "0")} dtk`;
}

function formatTime(isoOrMs) {
  if (!isoOrMs) return "--:--";
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

async function requestNotifPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const p = await Notification.requestPermission();
  return p === "granted";
}

function sendBrowserNotif(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

export default function PengirimanToko() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  useEffect(() => {
    const unsub = subscribeRequests((rows) => {
      setReq((rows || []).find((r) => r.id === id) || null);
    });
    return () => unsub();
  }, [id]);
  const [tick, setTick] = useState(0);
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    if (!id) {
      setShipment(null);
      return;
    }
    const unsub = subscribeShipment(id, (data) => {
      setShipment(data);
    });
    return () => unsub();
  }, [id]);

  const [showArrivalBanner, setShowArrivalBanner] = useState(false);

  // Upload proof states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({ qtyGood: '', qtyBad: '', notes: '', initialized: false });

  // Load qtyGood initially
  useEffect(() => {
    if (req && req.items && !uploadData.initialized) {
      const total = req.items.reduce((s, i) => s + Number(i.qty), 0);
      setUploadData(prev => ({ ...prev, qtyGood: total, initialized: true }));
    }
  }, [req, uploadData.initialized]);

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (dataUrl) => setSelectedFile(dataUrl));
    }
  };
  const [confirming, setConfirming] = useState(false);
  const arrivedNotifSent = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    requestNotifPermission();
    return () => clearInterval(t);
  }, []);


  const calc = (sh) => {
    if (!sh) return { progress: 0, etaMs: 0, driver: { lat: 0, lng: 0 } };
    const elapsed = Date.now() - sh.startedAt;
    const progress = Math.max(0, Math.min(1, elapsed / sh.durationMs));
    const etaMs = Math.max(0, sh.durationMs - elapsed);
    const driver = {
      lat: sh.start.lat + (sh.end.lat - sh.start.lat) * progress,
      lng: sh.start.lng + (sh.end.lng - sh.start.lng) * progress,
    };
    return { progress, etaMs, driver };
  };

  if (!req || !shipment) {
    return (
      <div className="p-toko-loading">
        <div className="spinner" />
        <p>Memuat data pelacakan...</p>
      </div>
    );
  }

  const { progress, etaMs, driver } = calc(shipment);
  const etaMin = Math.ceil(etaMs / 60000);
  const isArrived = progress >= 1;
  const isKonfirm = req.status === "Diterima Toko" || req.status === "Selesai";

  /* Arrival notification */
  if (isArrived && !arrivedNotifSent.current) {
    arrivedNotifSent.current = true;
    sendBrowserNotif("📦 Barang Tiba!", `Driver sudah tiba di lokasi Anda. Silakan konfirmasi penerimaan untuk request ${id}.`);
    setShowArrivalBanner(true);
    setTimeout(() => setShowArrivalBanner(false), 8000);
  }

  const handleKonfirmasi = () => {
    if (!selectedFile) return alert("Pilih foto bukti penerimaan terlebih dahulu!");
    if (Number(uploadData.qtyBad) > 0 && !uploadData.notes.trim()) {
      return alert("Silakan isi catatan kerusakan barang.");
    }
    setConfirming(true);
    completeShipmentByToko(id, selectedFile, uploadData);
    setTimeout(() => navigate("/toko/request"), 600);
  };

  /* Timeline entry time labels */
  const timeKeluar = formatTime(shipment.startedAt);
  const timeArrived = isArrived ? formatTime(Date.now()) : null;

  return (
    <div className="p-toko">
      {/* ── Arrival Banner ── */}
      <AnimatePresence>
        {showArrivalBanner && (
          <motion.div
            className="pt-arrival-banner"
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
          >
            🎉 Driver telah tiba! Silakan konfirmasi penerimaan barang.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="p-toko__header">
        <div className="p-toko__title-group">
          <button className="btn-back" onClick={() => navigate("/toko/request")}>←</button>
          <div>
            <h1>Lacak Pengiriman</h1>
            <p>ID Request: <b>#{id}</b></p>
          </div>
        </div>
        <div className={`p-toko__status ${isKonfirm ? "done" : isArrived ? "arrived" : "shipping"}`}>
          {isKonfirm ? "✅ Diterima" : isArrived ? "📦 Telah Sampai" : "🚚 Dalam Perjalanan"}
        </div>
      </header>

      {/* ── Grid ── */}
      <div className="p-toko__grid">
        {/* Map */}
        <div className="p-toko__map-side">
          <div className="p-toko__map-card">
            <TrackingMap
              start={shipment.start}
              end={shipment.end}
              startAddress={shipment.startAddress}
              endAddress={shipment.endAddress}
              progress={progress}
              gpsPosition={null}
              height="100%"
              showHistory={true}
              followDriver={!isArrived}
            />
            <div className="map-info-overlay">
              <div className="info-badge">
                <span className="dot" />
                Driver Live
              </div>
            </div>

            {/* ETA Overlay on map */}
            {!isArrived && (
              <div className="map-eta-overlay">
                <span className="map-eta-label">ETA</span>
                <span className="map-eta-val">{formatETA(etaMs)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info side */}
        <aside className="p-toko__info-side">

          {/* Driver Card */}
          <div className="pt-card">
            <h3 className="pt-card__title">Informasi Driver</h3>
            <div className="driver-profile">
              <div className="driver-avatar">👤</div>
              <div className="driver-text">
                <b>{shipment.driverName || req.driverName || "Budi Santoso"}</b>
                <span>DRV-001 • Truck Hino</span>
              </div>
              <button className="btn-contact" title="Hubungi Driver">📞</button>
            </div>
            {/* GPS Coordinate */}
            <div className="driver-coords">
              <span>📍 Koordinat:</span>
              <code>{driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}</code>
            </div>
          </div>

          {/* ETA Card */}
          <motion.div
            className={`pt-card pt-eta-card ${isArrived ? "eta-arrived" : ""}`}
            animate={{ scale: isArrived ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="pt-eta-top">
              <div>
                <span className="pt-eta-label">Estimasi Tiba</span>
                <div className="pt-eta-val">{isArrived ? "🎯 Sudah Tiba" : formatETA(etaMs)}</div>
              </div>
              <div className="pt-eta-ring">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  <circle
                    cx="28" cy="28" r="22"
                    fill="none"
                    stroke={isArrived ? "#52c41a" : "#f86c14"}
                    strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <span className="pt-ring-pct">{Math.round(progress * 100)}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="pt-progress-bg">
              <div
                className="pt-progress-fill"
                style={{ width: `${progress * 100}%`, background: isArrived ? "#52c41a" : "#f86c14" }}
              />
            </div>
            <div className="pt-progress-labels">
              <span>Gudang</span>
              <span>{(progress * 100).toFixed(0)}%</span>
              <span>Toko Anda</span>
            </div>
          </motion.div>

          {/* Status timeline */}
          <div className="pt-card">
            <h3 className="pt-card__title">Alur Pengiriman</h3>
            <div className="delivery-steps">
              <div className="step-item done">
                <div className="step-dot" />
                <div className="step-content">
                  <b>Barang Keluar Gudang</b>
                  <span>Pukul {timeKeluar} WIB</span>
                </div>
              </div>
              <div className={`step-item ${progress > 0.5 ? "done" : "active"}`}>
                <div className="step-dot" />
                <div className="step-content">
                  <b>Dalam Perjalanan</b>
                  <span>Menuju lokasi Anda</span>
                </div>
              </div>
              <div className={`step-item ${isArrived ? "done" : ""}`}>
                <div className="step-dot" />
                <div className="step-content">
                  <b>Sampai di Tujuan</b>
                  <span>{isArrived ? `Tiba pukul ${timeArrived} WIB` : `Estimasi: ${etaMin} menit lagi`}</span>
                </div>
              </div>
              <div className={`step-item ${isKonfirm ? "done" : ""}`}>
                <div className="step-dot" />
                <div className="step-content">
                  <b>Dikonfirmasi Toko</b>
                  <span>{isKonfirm ? "Barang sudah diterima" : "Menunggu konfirmasi Anda"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-card pt-action-card">
            {isKonfirm ? (
              <div className="pt-confirmed-state">
                <div className="confirmed-icon">✅</div>
                <b>Barang Telah Dikonfirmasi</b>
                <span>Terima kasih telah mengkonfirmasi penerimaan barang.</span>
              </div>
            ) : (
              <>
                <div className="pt-upload-container">
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', lineHeight: '1.4' }}>
                      {isArrived 
                        ? "Silakan upload foto bukti barang telah diterima, lalu verifikasi kondisi barang."
                        : "Fitur penerimaan dipercepat (Testing): Anda dapat langsung menerima barang meskipun simulasi driver belum tiba."}
                    </p>
                    
                    {/* Upload Box */}
                    <div
                      className="upload-area"
                      style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', marginBottom: '16px', transition: 'all 0.2s' }}
                      onClick={() => document.getElementById('proof-upload').click()}
                    >
                      {selectedFile ? (
                        <img src={selectedFile} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                      ) : (
                        <>
                          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Pilih Foto Bukti</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Ambil foto barang saat diterima</div>
                        </>
                      )}
                      <input type="file" id="proof-upload" hidden accept="image/*" onChange={handleFileChange} />
                    </div>

                    {/* Qty checks */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Diterima Baik</label>
                        <input type="text" min="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} value={uploadData.qtyGood} onChange={e => setUploadData({...uploadData, qtyGood: e.target.value.replace(/[^0-9]/g, "")})} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Rusak/Kurang</label>
                        <input type="text" min="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} value={uploadData.qtyBad} onChange={e => setUploadData({...uploadData, qtyBad: e.target.value.replace(/[^0-9]/g, "")})} placeholder="0" />
                      </div>
                    </div>
                    {Number(uploadData.qtyBad) > 0 && (
                      <div style={{ marginBottom: '16px', animation: 'fadeIn 0.3s ease-in-out' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ef4444', marginBottom: '6px' }}>Catatan Kerusakan</label>
                        <textarea style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', minHeight: '60px', outlineColor: '#ef4444', fontSize: '13px' }} value={uploadData.notes} onChange={e => setUploadData({...uploadData, notes: e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, "")})} placeholder="Jelaskan barang yang rusak..." />
                      </div>
                    )}
                  </div>
                
                <button
                  className={`btn-confirm ${true ? "ready" : "waiting"}`}
                  disabled={confirming || (Number(uploadData.qtyBad) > 0 && !uploadData.notes.trim())}
                  onClick={handleKonfirmasi}
                  style={(Number(uploadData.qtyBad) > 0 && !uploadData.notes.trim()) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {confirming
                    ? "⏱ Memproses..."
                    : isArrived
                    ? "Konfirmasi Barang Diterima ✓"
                    : `Terima Barang Lebih Awal ✓`}
                </button>
              </>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}
