import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import "../admin/PageAdmin.css";

import { useReastockDb } from "../../services/useReastockDb";
import { completeShipmentByToko, getShipment } from "../../services/wmsApi";
import TrackingMap from "../../components/common/TrackingMap";

export default function PengirimanToko() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = useReastockDb();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const req = useMemo(() => db.requests.find((r) => r.id === id), [db.requests, id]);
  const shipment = useMemo(() => (id ? getShipment(id) : null), [id, tick]);

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

  if (!id) {
    return (
      <div className="pageAdmin">
        <div className="pageAdmin__head">
          <h1>Pengiriman</h1>
          <p className="pageAdmin__muted">ID pengiriman tidak ada.</p>
        </div>
      </div>
    );
  }

  if (!req || !shipment) {
    return (
      <div className="pageAdmin">
        <div className="pageAdmin__head">
          <h1>Pengiriman</h1>
          <p className="pageAdmin__muted">Data pengiriman belum tersedia untuk {id}.</p>
          <button className="pageAdmin__btn" onClick={() => navigate("/toko/request")}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { progress, etaMs, driver } = calc(shipment);
  const etaMin = Math.ceil(etaMs / 60000);
  const itemsText = (req.items || []).map((it) => `${it.sku} (${it.qty})`).join(", ");

  const canFinish = req.status === "Mengirim";

  return (
    <div className="pageAdmin pageAdmin--wide" style={{ paddingBottom: 120 }}>
      <div className="pageAdmin__head">
        <h1>Pengiriman #{id}</h1>
        <p>
          Dari Gudang • Tujuan: <b>{req.fromName}</b> • Items: <b>{itemsText}</b>
        </p>

        <button className="pageAdmin__btn" onClick={() => navigate("/toko/request")}>
          Kembali
        </button>
      </div>

      <Card className="pageAdmin__card pageAdmin__card--full">
        <TrackingMap start={shipment.start} end={shipment.end} progress={progress} height={560} />
      </Card>

      {/* Bottom bar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 14,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>Estimasi sampai</div>
              <div className="pageAdmin__muted">{etaMin} menit</div>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Progress</div>
              <div style={{ height: 10, background: "rgba(0,0,0,0.08)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${(progress * 100).toFixed(0)}%`, height: "100%", background: "rgba(0,0,0,0.45)" }} />
              </div>
              <div className="pageAdmin__muted" style={{ marginTop: 6 }}>
                {(progress * 100).toFixed(0)}%
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700 }}>Koordinat Driver</div>
              <div className="pageAdmin__muted">
                {driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}
              </div>
            </div>

            <div>
              <button
                className="pageAdmin__btn"
                disabled={!canFinish}
                onClick={() => {
                  completeShipmentByToko(id);
                  navigate("/toko/request");
                }}
                style={{ opacity: canFinish ? 1 : 0.55 }}
              >
                Selesai (Barang diterima)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
