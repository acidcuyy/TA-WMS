import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  subscribeRequests,
  subscribeDriverProfile,
  getShipment,
  driverSelesaikanPengiriman,
} from "../../../services/wmsApi";
import TrackingMap from "../../../components/common/TrackingMap";
import "./DriverTracking.css";

export default function DriverTracking() {
  const [requests, setRequests] = useState([]);
  const [profile,  setProfile]  = useState({});
  const [tick,     setTick]     = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const unsubReq     = subscribeRequests((rows) => setRequests(rows || []));
    const unsubProfile = subscribeDriverProfile((data) => setProfile(data || {}));
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => { unsubReq(); unsubProfile(); clearInterval(t); };
  }, []);

  /* Find the request that belongs to this driver and is active */
  const activeRequest = useMemo(() =>
    requests.find(
      (r) =>
        (r.status === "Mengirim" || r.status === "Diterima Toko") &&
        r.driverName === profile.name
    ),
    [requests, profile.name]
  );

  const shipment = useMemo(() => {
    if (!activeRequest) return null;
    return getShipment(activeRequest.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRequest, tick]);

  /* Progress calculation */
  const calc = (sh) => {
    if (!sh) return { progress: 0, etaMs: 0, driver: { lat: 0, lng: 0 } };
    const elapsed  = Date.now() - sh.startedAt;
    const progress = Math.max(0, Math.min(1, elapsed / sh.durationMs));
    const etaMs    = Math.max(0, sh.durationMs - elapsed);
    const driver   = {
      lat: sh.start.lat + (sh.end.lat - sh.start.lat) * progress,
      lng: sh.start.lng + (sh.end.lng - sh.start.lng) * progress,
    };
    return { progress, etaMs, driver };
  };

  /* Handler: driver selesaikan pengiriman */
  const handleSelesaikan = async () => {
    if (!activeRequest || completing) return;
    setCompleting(true);
    await driverSelesaikanPengiriman(activeRequest.id);
    setCompleting(false);
    window.location.href = "/driver/history";
  };

  /* ── Empty state ── */
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

  const { progress, etaMs, driver } = calc(shipment);
  const etaMin       = Math.ceil(etaMs / 60000);
  const isArrived    = progress >= 1;
  const isDiterimaToko = activeRequest.status === "Diterima Toko";

  /* Determine status text for map bar */
  const mapBarText = isDiterimaToko
    ? "✅ Barang telah diterima oleh Toko"
    : isArrived
    ? "📍 Tiba di lokasi tujuan — menunggu konfirmasi Toko"
    : "🚚 Sedang dalam perjalanan...";

  return (
    <div className="dtracking">
      {/* ── Left: Full-height map ── */}
      <div className="dtracking__map-container">
        <div className="map-overlay">
          <div className={`map-search-bar ${isDiterimaToko ? "bar-done" : ""}`}>
            {mapBarText}
          </div>
        </div>
        <TrackingMap
          start={shipment.start}
          end={shipment.end}
          progress={progress}
        />
      </div>

      {/* ── Right: Info panel ── */}
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

        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              style={{
                background: isDiterimaToko
                  ? "#52c41a"
                  : "var(--primary)",
              }}
            />
          </div>
          <div className="progress-labels">
            <span>{(progress * 100).toFixed(0)}% Perjalanan</span>
            <span>
              {isArrived || isDiterimaToko
                ? "Sampai"
                : `Sisa ${etaMin} menit`}
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
            <span className="track-label">Koordinat Driver</span>
            <b className="track-val">
              {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
            </b>
          </div>
          <div className="track-item">
            <span className="track-label">Estimasi</span>
            <b className="track-val">
              {isArrived || isDiterimaToko ? "Sudah Tiba" : `${etaMin} menit`}
            </b>
          </div>
        </div>

        {/* Timeline steps */}
        <div className="delivery-timeline">
          <div className={`tl-step ${true ? "done" : ""}`}>
            <div className="tl-dot">✅</div>
            <div className="tl-text">
              <b>Barang Diambil</b>
              <span>Bukti telah diunggah</span>
            </div>
          </div>
          <div className="tl-line" />
          <div className={`tl-step ${isArrived || isDiterimaToko ? "done" : "active"}`}>
            <div className="tl-dot">
              {isArrived || isDiterimaToko ? "✅" : "🚚"}
            </div>
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
          <div className={`tl-step ${isDiterimaToko ? "done" : ""}`}>
            <div className="tl-dot">{isDiterimaToko ? "✅" : "🏪"}</div>
            <div className="tl-text">
              <b>Diterima Toko</b>
              <span>
                {isDiterimaToko
                  ? "Toko sudah konfirmasi"
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

        {/* Action footer */}
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
                Informasi lokasi Anda dibagikan secara live ke Toko & Gudang.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
