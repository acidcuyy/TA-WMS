import { useMemo } from "react";

export default function TrackingMap({ start, end, progress = 0, height = 520 }) {
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const p = clamp(progress);

  const driver = useMemo(() => {
    const lat = start.lat + (end.lat - start.lat) * p;
    const lng = start.lng + (end.lng - start.lng) * p;
    return { lat, lng };
  }, [start.lat, start.lng, end.lat, end.lng, p]);

  const src = useMemo(() => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${driver.lng - 0.02}%2C${driver.lat - 0.02}%2C${driver.lng + 0.02}%2C${driver.lat + 0.02}&layer=mapnik&marker=${driver.lat}%2C${driver.lng}`;
  }, [driver.lat, driver.lng]);

  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius: 16, overflow: "hidden" }}>
      <iframe
        title="tracking-map"
        src={src}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
      />

      {/* ikon driver kecil (di atas marker, tapi tidak “nabrak” UI) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -120%)",
          pointerEvents: "none",
          fontSize: 22,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
        }}
      >
        🚚
      </div>
    </div>
  );
}
