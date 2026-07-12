import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  subscribeRequests,
  subscribeShipment,
  driverSelesaikanPengiriman,
  updateDriverLocation,
} from "../../../services/wmsApi";
import TrackingMap from "../../../components/common/TrackingMap";
import "./DriverTracking.css";

/* ── Helpers ── */
function formatETA(ms) {
  if (ms <= 0) return "Sudah Tiba";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} detik`;
  return `${min} mnt ${sec.toString().padStart(2, "0")} dtk`;
}

function formatSpeed(progress, durationMs) {
  if (!durationMs || progress <= 0 || progress >= 1) return 0;
  // Simulasi kecepatan ~30-60 km/h
  const base = 38 + Math.sin(progress * Math.PI * 4) * 12;
  return Math.round(base);
}

/* ── Notification helper ── */
async function requestNotifPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

function sendBrowserNotif(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

/* ── Main Component ── */
export default function DriverTracking() {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState({});
  const [tick, setTick] = useState(0);
  const [completing, setCompleting] = useState(false);

  /* GPS state */
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const watchIdRef = useRef(null);

  /* Arrival notif sent once */
  const arrivedNotifSent = useRef(false);
  const [showArrivalBanner, setShowArrivalBanner] = useState(false);

  useEffect(() => {
    const branchId = sessionStorage.getItem("reastock_branch_id");
    const unsubReq = subscribeRequests((rows) => {
      const myReqs = (rows || []).filter(
        (r) => r.toBranchId === branchId || r.fromBranchId === branchId
      );
      setRequests(myReqs);
    });
    setProfile({
      name: sessionStorage.getItem("reastock_user_name") || "Driver",
      role: "Driver Ekspedisi",
      branchId: branchId,
    });
    const t = setInterval(() => setTick((x) => x + 1), 1000);

    // Request notification permission on mount
    requestNotifPermission();

    return () => {
      unsubReq();
      clearInterval(t);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  /* GPS Toggle */
  const toggleGPS = useCallback(async () => {
    if (gpsActive) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsActive(false);
      setGpsPosition(null);
      setGpsError(null);
    } else {
      if (!navigator.geolocation) {
        setGpsError("Browser tidak mendukung Geolocation.");
        return;
      }
      setGpsError(null);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsActive(true);
          setGpsError(null);
        },
        (err) => {
          setGpsError(`GPS error: ${err.message}`);
          setGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
      );
    }
  }, [gpsActive]);

  /* Active request */
  const activeRequest = useMemo(
    () =>
      requests.find(
        (r) =>
          (r.status === "Mengirim" || r.status === "Diterima Toko") &&
          r.driverName === profile.name
      ),
    [requests, profile.name]
  );

  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    if (!activeRequest) {
      setShipment(null);
      return;
    }
    const unsub = subscribeShipment(activeRequest.id, (data) => {
      setShipment(data);
    });
    return () => unsub();
  }, [activeRequest]);

  /* GPS Sync to Database */
  useEffect(() => {
    if (activeRequest && gpsActive && gpsPosition) {
      updateDriverLocation(activeRequest.id, gpsPosition.lat, gpsPosition.lng);
    }
  }, [activeRequest, gpsActive, gpsPosition]);

  /* Progress calculation */
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

  const { progress, etaMs, driver } = calc(shipment);
  const etaMin = Math.ceil(etaMs / 60000);
  const isArrived = progress >= 1;
  const isDiterimaToko = activeRequest?.status === "Diterima Toko";
  const speed = shipment ? formatSpeed(progress, shipment.durationMs) : 0;

  /* Arrival notification — sent once */
  useEffect(() => {
    if (isArrived && !arrivedNotifSent.current) {
      arrivedNotifSent.current = true;
      sendBrowserNotif("🎯 Anda Telah Tiba!", "Silakan tunggu konfirmasi dari pihak Toko.");
      setShowArrivalBanner(true);
      setTimeout(() => setShowArrivalBanner(false), 6000);
    }
  }, [isArrived]);

  /* Handler selesai */
  const handleSelesaikan = async () => {
    if (!activeRequest || completing) return;
    setCompleting(true);
    await driverSelesaikanPengiriman(activeRequest.id);
    setCompleting(false);
    window.location.href = "/driver/history";
  };

  /* ── Map bar text ── */
  const mapBarText = isDiterimaToko
    ? "✅ Barang telah diterima oleh Toko"
    : isArrived
    ? "📍 Tiba di lokasi tujuan — menunggu konfirmasi Toko"
    : "🚚 Sedang dalam perjalanan...";

  /* ── EMPTY STATE ── */
  if (!activeRequest || !shipment) {
    return (
      <div className="dtracking dtracking--empty">
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-icon">🚛</div>
          <h2>Tidak Ada Pengiriman Aktif</h2>
          <p>
            Anda sedang tidak memiliki tugas pengiriman yang berjalan.
            <br />
            Silakan cek Dashboard untuk mengambil tugas baru.
          </p>
          <button
            className="btn-goto-dash"
            onClick={() => (window.location.href = "/driver")}
          >
            Ke Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dtracking">
      {/* ── Arrival Banner ── */}
      <AnimatePresence>
        {showArrivalBanner && (
          <motion.div
            className="arrival-banner"
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
          >
            🎯 Anda telah tiba di lokasi tujuan! Tunggu konfirmasi Toko.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Left: Map ── */}
      <div className="dtracking__map-container">
        {/* Map top bar */}
        <div className="map-overlay">
          <div className={`map-search-bar ${isDiterimaToko ? "bar-done" : ""}`}>
            {mapBarText}
          </div>

          {/* GPS Status badge */}
          <div className={`gps-badge ${gpsActive ? "gps-on" : "gps-off"}`}>
            <span className="gps-dot" />
            {gpsActive ? "GPS Aktif" : "Simulasi"}
          </div>
        </div>

        {/* Speed HUD */}
        {!isArrived && !isDiterimaToko && (
          <div className="speed-hud">
            <span className="speed-value">{gpsActive ? "--" : speed}</span>
            <span className="speed-unit">km/h</span>
          </div>
        )}

        <TrackingMap
          start={shipment.start}
          end={shipment.end}
          startAddress={shipment.startAddress}
          endAddress={shipment.endAddress}
          progress={progress}
          gpsPosition={null}
          showHistory={true}
          followDriver={!isDiterimaToko}
        />
      </div>

      {/* ── Right: Info Panel ── */}
      <div className="dtracking__info">
        {/* Header */}
        <div className="delivery-header">
          <div className="delivery-id">
            <span>ID Pengiriman</span>
            <b>{activeRequest.id}</b>
          </div>
          <span
            className={`status-pill ${
              isDiterimaToko ? "done" : isArrived ? "arrived" : "shipping"
            }`}
          >
            {isDiterimaToko ? "Diterima Toko" : isArrived ? "Tiba" : "Mengirim"}
          </span>
        </div>

        {/* ETA Card */}
        <div className={`eta-card ${isArrived ? "eta-arrived" : ""}`}>
          <div className="eta-icon">{isArrived ? "🎯" : "⏱️"}</div>
          <div className="eta-info">
            <span className="eta-label">Estimasi Tiba</span>
            <b className="eta-value">{formatETA(etaMs)}</b>
          </div>
          <div className="eta-progress-ring">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke={isDiterimaToko ? "#52c41a" : "var(--primary)"}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span className="ring-pct">{Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              style={{
                background: isDiterimaToko ? "#52c41a" : "var(--primary)",
              }}
            />
          </div>
          <div className="progress-labels">
            <span>{(progress * 100).toFixed(0)}% Perjalanan</span>
            <span>
              {isArrived || isDiterimaToko ? "Sampai ✓" : `Sisa ${etaMin} menit`}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="tracking-details">
          <div className="track-item">
            <span className="track-label">Tujuan</span>
            <b className="track-val">{activeRequest.fromName || "Toko"}</b>
          </div>
          <div className="track-item">
            <span className="track-label">Dari</span>
            <b className="track-val">{activeRequest.toName || "Gudang"}</b>
          </div>
          <div className="track-item">
            <span className="track-label">Koordinat GPS</span>
            <b className="track-val coords">
              {(gpsActive && gpsPosition ? gpsPosition.lat : driver.lat).toFixed(5)},{" "}
              {(gpsActive && gpsPosition ? gpsPosition.lng : driver.lng).toFixed(5)}
            </b>
          </div>
          <div className="track-item">
            <span className="track-label">Kecepatan</span>
            <b className="track-val">{gpsActive ? "—" : `${speed} km/h`}</b>
          </div>
        </div>

        {/* GPS Control */}
        <div className="gps-control">
          <div className="gps-control-header">
            <span>🛰️ GPS Geolocation</span>
            <button
              className={`btn-gps ${gpsActive ? "btn-gps--on" : "btn-gps--off"}`}
              onClick={toggleGPS}
            >
              {gpsActive ? "Matikan GPS" : "Aktifkan GPS"}
            </button>
          </div>
          {gpsError && <p className="gps-error">{gpsError}</p>}
          {gpsActive && gpsPosition && (
            <p className="gps-live">
              📡 Live: {gpsPosition.lat.toFixed(5)}, {gpsPosition.lng.toFixed(5)}
            </p>
          )}
          {!gpsActive && (
            <p className="gps-hint">
              Aktifkan GPS untuk menggunakan lokasi nyata perangkat Anda.
            </p>
          )}
        </div>

        {/* Timeline steps */}
        <div className="delivery-timeline">
          <div className="tl-step done">
            <div className="tl-dot">✅</div>
            <div className="tl-text">
              <b>Barang Diambil</b>
              <span>Bukti telah diunggah</span>
            </div>
          </div>
          <div className="tl-line" />
          <div className={`tl-step ${isArrived || isDiterimaToko ? "done" : "active"}`}>
            <div className="tl-dot">{isArrived || isDiterimaToko ? "✅" : "🚚"}</div>
            <div className="tl-text">
              <b>Dalam Pengiriman</b>
              <span>
                {isArrived || isDiterimaToko
                  ? "Sudah tiba di tujuan"
                  : "Sedang menuju toko"}
              </span>
            </div>
          </div>
          <div className="tl-line" />
          <div className={`tl-step ${isDiterimaToko ? "done" : isArrived ? "active" : ""}`}>
            <div className="tl-dot">{isDiterimaToko ? "✅" : "🏪"}</div>
            <div className="tl-text">
              <b>Diterima Toko</b>
              <span>
                {isDiterimaToko
                  ? "Toko sudah konfirmasi"
                  : isArrived
                  ? "Menunggu konfirmasi toko..."
                  : "Menunggu konfirmasi toko"}
              </span>
            </div>
          </div>
          <div className="tl-line" />
          <div className="tl-step">
            <div className="tl-dot">🏁</div>
            <div className="tl-text">
              <b>Pengiriman Selesai</b>
              <span>Driver menyelesaikan tugas</span>
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="delivery-footer">
          {isDiterimaToko ? (
            <>
              <button
                className="btn-action pulse-green"
                onClick={handleSelesaikan}
                disabled={completing}
              >
                {completing ? "⏳ Memproses..." : "Pengiriman Selesai ✅"}
              </button>
              <p className="footer-note success-note">
                🎉 Toko telah mengkonfirmasi penerimaan barang. Tekan tombol di atas untuk menyelesaikan tugas ini.
              </p>
            </>
          ) : isArrived ? (
            <>
              <button className="btn-action waiting" disabled>
                ⏳ Menunggu Konfirmasi Toko...
              </button>
              <p className="footer-note">
                Anda telah tiba. Tunggu pihak Toko menekan tombol "Terima Barang" dan mengupload bukti penerimaan.
              </p>
            </>
          ) : (
            <>
              <button className="btn-action disabled" disabled>
                🚚 Sedang Mengantar...
              </button>
              <p className="footer-note">
                Informasi lokasi Anda dibagikan secara live ke Toko &amp; Gudang.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
