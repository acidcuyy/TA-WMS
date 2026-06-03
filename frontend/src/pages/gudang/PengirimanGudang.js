import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import "../toko/PengirimanToko.css";

import { useReastockDb } from "../../services/useReastockDb";
import TrackingMap from "../../components/common/TrackingMap";

export default function PengirimanGudang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = useReastockDb();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const req = useMemo(() => (db.requests || []).find((r) => r.id === id), [db.requests, id]);
  const shipment = useMemo(() => (db.shipments?.[id] || null), [db.shipments, id]);

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
        <div className="spinner"></div>
        <p>Memuat data pelacakan...</p>
      </div>
    );
  }

  const { progress, etaMs, driver } = calc(shipment);
  const etaMin = Math.ceil(etaMs / 60000);
  const isArrived = progress >= 1;

  return (
    <div className="p-toko">
      <header className="p-toko__header">
        <div className="p-toko__title-group">
          <button className="btn-back" onClick={() => navigate("/gudang/requests")}>←</button>
          <div>
            <h1>Pantau Lokasi Pengiriman</h1>
            <p>ID Request: <b>#{id}</b></p>
          </div>
        </div>
        <div className={`p-toko__status ${isArrived ? 'arrived' : 'shipping'}`}>
          {isArrived ? "📦 Telah Sampai" : "🚚 Sedang Berjalan"}
        </div>
      </header>

      <div className="p-toko__grid">
        <div className="p-toko__map-side">
          <Card className="p-toko__map-card">
            <TrackingMap start={shipment.start} end={shipment.end} progress={progress} height="100%" />
            
            <div className="map-info-overlay">
              <div className="info-badge">
                <span className="dot"></span>
                Driver Live
              </div>
            </div>
          </Card>
        </div>

        <aside className="p-toko__info-side">
          <Card className="p-toko__card">
            <h3>Informasi Driver</h3>
            <div className="driver-profile">
              <div className="driver-avatar">👤</div>
              <div className="driver-text">
                <b>{shipment.driverName || "Budi Santoso"}</b>
                <span>DRV-001 • Truck Hino</span>
              </div>
              <button className="btn-contact">📞</button>
            </div>
          </Card>

          <Card className="p-toko__card">
            <h3>Detail Alur</h3>
            <div className="delivery-steps">
              <div className="step-item done">
                <div className="step-dot"></div>
                <div className="step-content">
                  <b>Barang Keluar Gudang</b>
                  <span>Selesai Dipacking</span>
                </div>
              </div>
              <div className={`step-item ${progress > 0.5 ? 'done' : 'active'}`}>
                <div className="step-dot"></div>
                <div className="step-content">
                  <b>Dalam Perjalanan</b>
                  <span>Menuju {req.fromName}</span>
                </div>
              </div>
              <div className={`step-item ${isArrived ? 'done' : ''}`}>
                <div className="step-dot"></div>
                <div className="step-content">
                  <b>Sampai di Tujuan</b>
                  <span>Estimasi: {etaMin} menit lagi</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-toko__card highlight" style={{ background: '#f86c14' }}>
            <div className="eta-section">
              <span className="eta-label">Estimasi Sampai ke Toko</span>
              <h2 className="eta-val">{isArrived ? "Tiba" : `${etaMin} Menit`}</h2>
            </div>
            
            <div className="tracking-stats">
              <div className="stat-row">
                <span>Progress Perjalanan</span>
                <b>{(progress * 100).toFixed(0)}%</b>
              </div>
              <div className="stat-row">
                <span>Koordinat GPS</span>
                <b style={{ fontSize: '10px' }}>{driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}</b>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '12px', opacity: 0.8 }}>
              {isArrived ? "Barang Menunggu Konfirmasi Toko" : "Memantau pergerakan driver secara live"}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
