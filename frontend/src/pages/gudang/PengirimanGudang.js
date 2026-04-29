import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import "../admin/PageAdmin.css";

import { useReastockDb } from "../../services/useReastockDb";
import { getRequestById, getShipment } from "../../services/wmsApi";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function PengirimanGudang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = useReastockDb();

  const req = useMemo(() => getRequestById(id), [id, db]);
  const shipment = useMemo(() => getShipment(id), [id, db]);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // fallback aman kalau shipment belum ada
  const start = shipment?.start || { lat: -6.2000, lng: 106.8166 };
  const end = shipment?.end || { lat: -6.1754, lng: 106.8272 };
  const startedAt = shipment?.startedAt || Date.now() - 1000 * 60 * 2;
  const durationMs = shipment?.durationMs || 1000 * 60 * 18;

  const tRaw = (now - startedAt) / durationMs;
  const t = clamp(tRaw, 0, 1);

  const driverLat = lerp(start.lat, end.lat, t);
  const driverLng = lerp(start.lng, end.lng, t);

  const progressPct = Math.round(t * 100);
  const etaMs = Math.max(0, startedAt + durationMs - now);
  const etaMin = Math.ceil(etaMs / 60000);

  // Embed peta (tanpa library tambahan)
  // Kita bikin bbox kecil di sekitar driver supaya terasa “tracking”
  const delta = 0.03;
  const left = driverLng - delta;
  const right = driverLng + delta;
  const top = driverLat + delta;
  const bottom = driverLat - delta;

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${driverLat}%2C${driverLng}`;

  return (
    <div className="pageAdmin pageAdmin--wide">
      <div className="pageAdmin__head">
        <h1>Pengiriman #{id}</h1>
        <p>
          {req
            ? `Dari Gudang • Tujuan: ${req.fromName} • Items: ${(req.items || [])
                .map((it) => `${it.sku} (${it.qty})`)
                .join(", ")}`
            : "Detail pengiriman"}
        </p>
      </div>

      <button
        className="pageAdmin__btn"
        style={{ width: "100%", marginBottom: 12 }}
        onClick={() => navigate("/gudang/requests")}
        type="button"
      >
        Kembali
      </button>

      <Card className="pageAdmin__card pageAdmin__card--full">
        <div
          style={{
            width: "100%",
            height: 520,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <iframe
            title="Tracking Map Gudang"
            src={mapSrc}
            width="100%"
            height="520"
            frameBorder="0"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </Card>

      {/* Bottom bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          marginTop: 12,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          padding: "12px 16px",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr 240px",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>Estimasi sampai</div>
            <div className="pageAdmin__muted">
              {progressPct >= 100 ? "Sampai" : `${etaMin} menit`}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Progress</div>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.35)",
                }}
              />
            </div>
            <div className="pageAdmin__muted" style={{ marginTop: 6 }}>
              {progressPct}%
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700 }}>Koordinat Driver</div>
            <div className="pageAdmin__muted">
              {driverLat.toFixed(5)}, {driverLng.toFixed(5)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
