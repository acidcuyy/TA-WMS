// ntar gue garap -JorloJor
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeRequests, subscribeDriverProfile, getShipment } from "../../../services/wmsApi";
import TrackingMap from "../../../components/common/TrackingMap";
import "./DriverTracking.css";

export default function DriverTracking() {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setRequests(rows || []));
    const unsubProfile = subscribeDriverProfile((data) => setProfile(data || {}));
    const t = setInterval(() => setTick(x => x + 1), 1000);

    return () => {
      unsubReq();
      unsubProfile();
      clearInterval(t);
    };
  }, []);

  const activeRequest = useMemo(() => {
    return requests.find(r => r.status === "Mengirim" && r.driverName === profile.name);
  }, [requests, profile.name]);

  const shipment = useMemo(() => {
    if (!activeRequest) return null;
    return getShipment(activeRequest.id);
  }, [activeRequest]);

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
          <p>Anda sedang tidak memiliki tugas pengiriman yang berjalan. <br /> Silakan cek Dashboard untuk mengambil tugas baru.</p>
          <button className="btn-goto-dash" onClick={() => window.location.href = '/driver'}>Ke Dashboard</button>
        </motion.div>
      </div>
    );
  }

  const { progress, etaMs, driver } = calc(shipment);
  const etaMin = Math.ceil(etaMs / 60000);
  const isArrived = progress >= 1;

  return (
    <div className="dtracking">
      <div className="dtracking__map-container">
        <Card className="dtracking__map-card">
          <TrackingMap start={shipment.start} end={shipment.end} progress={progress} height="100%" />
          <div className="map-overlay">
            <div className="map-search-bar">
              📍 {isArrived ? "Tiba di lokasi tujuan" : "Sedang dalam perjalanan..."}
            </div>
          </div>
        </Card>
      </div>

      <div className="dtracking__info">
        <Card className="delivery-card">
          <div className="delivery-header">
            <div className="delivery-id">
              <span>ID Pengiriman</span>
              <b>{activeRequest.id}</b>
            </div>
            <span className={`status-pill ${isArrived ? 'arrived' : 'shipping'}`}>
              {isArrived ? "Tiba" : "Mengirim"}
            </span>
          </div>

          <div className="progress-section">
            <div className="progress-bar-bg">
              <motion.div
                className="progress-bar-fill"
                initial={false}
                animate={{ width: `${progress * 100}%` }}
              ></motion.div>
            </div>
            <div className="progress-labels">
              <span>{(progress * 100).toFixed(0)}% Perjalanan</span>
              <span>{isArrived ? "Selesai" : `Sisa ${etaMin} menit`}</span>
            </div>
          </div>

          <div className="tracking-details">
            <div className="track-item">
              <span className="track-label">Tujuan</span>
              <b className="track-val">{activeRequest.toName}</b>
            </div>
            <div className="track-item">
              <span className="track-label">Koordinat</span>
              <b className="track-val">{driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}</b>
            </div>
            <div className="track-item">
              <span className="track-label">Estimasi</span>
              <b className="track-val">{isArrived ? "Sampai" : `${etaMin} menit`}</b>
            </div>
          </div>

          <div className="delivery-footer">
            <button
              className={`btn-action ${isArrived ? "pulse" : "disabled"}`}
              disabled={!isArrived}
              onClick={() => alert("Silakan tunggu pihak Toko melakukan konfirmasi penerimaan barang.")}
            >
              {isArrived ? "Tiba di Tujuan" : "Sedang Mengantar..."}
            </button>
            <p className="footer-note">
              {isArrived
                ? "Pesanan akan selesai otomatis setelah Toko mengunggah bukti penerimaan."
                : "Informasi lokasi Anda dibagikan secara live ke Toko & Gudang."}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
