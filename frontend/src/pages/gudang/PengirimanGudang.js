import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  completeShipment,
  subscribeRequests,
  subscribeShipment
} from "../../services/wmsApi";
import TrackingMap from "../../components/common/TrackingMap";
import "../toko/PengirimanToko.css";
import "./PengirimanGudang.css";

/* ── Helpers ── */
function formatETA(ms) {
  if (ms <= 0) return "Sudah Tiba";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} detik`;
  return `${min} mnt ${sec.toString().padStart(2, "0")} dtk`;
}

function formatTime(ms) {
  if (!ms) return "--:--";
  const d = typeof ms === "number" ? new Date(ms) : new Date(ms);
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
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

export default function PengirimanGudang() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tick, setTick] = useState(0);
  const [showArrivalBanner, setShowArrivalBanner] = useState(false);
  const arrivedNotifSent = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    requestNotifPermission();
    return () => clearInterval(t);
  }, []);

  const [req, setReq] = useState(null);
  useEffect(() => {
    const unsub = subscribeRequests((rows) => {
      setReq((rows || []).find((r) => r.id === id) || null);
    });
    return () => unsub();
  }, [id]);

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
  const isDiterimaToko = req.status === "Diterima Toko" || req.status === "Selesai";

  /* Arrival notification */
  if (isArrived && !arrivedNotifSent.current) {
    arrivedNotifSent.current = true;
    sendBrowserNotif(
      "📦 Driver Tiba di Toko!",
      `Driver telah tiba di ${req.fromName} untuk request ${id}. Menunggu konfirmasi toko.`
    );
    setShowArrivalBanner(true);
    setTimeout(() => setShowArrivalBanner(false), 8000);
  }

  const timeKeluar = formatTime(shipment.startedAt);
  const timeArrived = isArrived ? formatTime(Date.now()) : null;

  const backPath = req?.fromRole === "toko" ? "/gudang/requests" : "/gudang/requests";

  return (
    <div className="p-toko pg-gudang">
      {/* ── Arrival Banner ── */}
      <AnimatePresence>
        {showArrivalBanner && (
          <motion.div
            className="pt-arrival-banner"
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
          >
            🎯 Driver telah tiba di {req.fromName}! Menunggu konfirmasi Toko.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="p-toko__header">
        <div className="p-toko__title-group">
          <button className="btn-back" onClick={() => navigate(backPath)}>←</button>
          <div>
            <h1>Pantau Lokasi Pengiriman</h1>
            <p>ID Request: <b>#{id}</b></p>
          </div>
        </div>
        <div className={`p-toko__status ${isDiterimaToko ? "done" : isArrived ? "arrived" : "shipping"}`}>
          {isDiterimaToko ? "✅ Diterima Toko" : isArrived ? "📍 Tiba" : "🚚 Sedang Berjalan"}
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
                <b>{shipment.driverName || req.driverName || "Driver"}</b>
                <span>DRV-001 • Truck Hino</span>
              </div>
              <button className="btn-contact" title="Hubungi Driver">📞</button>
            </div>
            <div className="driver-coords">
              <span>📍 Koordinat:</span>
              <code>{driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}</code>
            </div>
          </div>

          {/* ETA Card */}
          <motion.div
            className={`pt-card pt-eta-card ${isArrived ? "eta-arrived" : ""}`}
            animate={{ scale: isArrived ? [1, 1.02, 1] : 1 }}
          >
            <div className="pt-eta-top">
              <div>
                <span className="pt-eta-label">Estimasi Tiba ke {req.fromName || "Toko"}</span>
                <div className="pt-eta-val">
                  {isArrived ? "🎯 Sudah Tiba" : formatETA(etaMs)}
                </div>
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

            <div className="pt-progress-bg">
              <div
                className="pt-progress-fill"
                style={{
                  width: `${progress * 100}%`,
                  background: isArrived ? "#52c41a" : "#f86c14",
                }}
              />
            </div>
            <div className="pt-progress-labels">
              <span>Gudang</span>
              <span>{(progress * 100).toFixed(0)}%</span>
              <span>{req.fromName || "Toko"}</span>
            </div>
          </motion.div>

          {/* Status Timeline */}
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
                  <span>Menuju {req.fromName || "Toko"}</span>
                </div>
              </div>
              <div className={`step-item ${isArrived ? "done" : ""}`}>
                <div className="step-dot" />
                <div className="step-content">
                  <b>Sampai di Tujuan</b>
                  <span>
                    {isArrived
                      ? `Tiba pukul ${timeArrived} WIB`
                      : `Estimasi: ${etaMin} menit lagi`}
                  </span>
                </div>
              </div>
              <div className={`step-item ${isDiterimaToko ? "done" : ""}`}>
                <div className="step-dot" />
                <div className="step-content">
                  <b>Dikonfirmasi Toko</b>
                  <span>
                    {isDiterimaToko
                      ? "Toko sudah konfirmasi penerimaan"
                      : "Menunggu konfirmasi toko"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info panel (read-only for gudang) */}
          <div className="pt-card pg-info-readonly">
            <h3 className="pt-card__title">Status Pengiriman</h3>
            {isDiterimaToko ? (
              <div className="pg-status-done">
                <span>✅</span>
                <div>
                  <b>Barang Diterima Toko</b>
                  <p>Toko telah mengkonfirmasi penerimaan barang. Pengiriman selesai.</p>
                </div>
              </div>
            ) : isArrived ? (
              <div className="pg-status-waiting">
                <span>⏳</span>
                <div>
                  <b>Menunggu Konfirmasi Toko</b>
                  <p>Driver sudah tiba. Menunggu pihak toko mengkonfirmasi penerimaan.</p>
                </div>
              </div>
            ) : (
              <div className="pg-status-ongoing">
                <span>🚚</span>
                <div>
                  <b>Sedang Dikirim</b>
                  <p>
                    Perkiraan tiba dalam <strong>{etaMin} menit</strong>. Pantau posisi driver di peta.
                  </p>
                </div>
              </div>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}
