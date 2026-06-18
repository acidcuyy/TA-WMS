import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. Setup Icons - Hapus default leaflet icon agar tidak error
delete L.Icon.Default.prototype._getIconUrl;

const createEmojiIcon = (emoji, size = 36) => {
  return L.divIcon({
    html: `<div style="font-size:${size}px; line-height:1; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5)); display:flex; align-items:center; justify-content:center; width:100%; height:100%;">${emoji}</div>`,
    className: "custom-emoji-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const ICON_DRIVER = createEmojiIcon("🚚", 36);
const ICON_START = createEmojiIcon("🏭", 32);
const ICON_END = createEmojiIcon("🏪", 32);

// 2. MapController untuk mengatur logika pergerakan & ukuran peta
function MapController({ driver, follow }) {
  const map = useMap();
  const [isFollowing, setIsFollowing] = useState(follow);

  // Sync prop changes
  useEffect(() => {
    setIsFollowing(follow);
  }, [follow]);

  // Hentikan pelacakan jika user mencoba menggeser peta
  useEffect(() => {
    const onDragStart = () => setIsFollowing(false);
    map.on("dragstart", onDragStart);
    return () => map.off("dragstart", onDragStart);
  }, [map]);

  // Penanganan ekstrim untuk mencegah "scattered tiles" / bug ukuran container
  useEffect(() => {
    const doFit = () => map.invalidateSize({ animate: false });

    // Memastikan ukuran terhitung setelah animasi CSS / framer-motion selesai
    const t1 = setTimeout(doFit, 100);
    const t2 = setTimeout(doFit, 500);
    const t3 = setTimeout(doFit, 1000);

    let observer;
    const container = map.getContainer();
    if (window.ResizeObserver && container) {
      observer = new ResizeObserver(() => {
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            try { map.invalidateSize({ animate: false }); } catch (e) {}
          }, 50);
        });
      });
      observer.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (observer) observer.disconnect();
    };
  }, [map]);

  // Mengikuti pergerakan driver
  useEffect(() => {
    // ALWAYS force a size check every time the driver updates (biasanya setiap 1 detik)
    // Ini memastikan Leaflet tidak pernah miskalkulasi jika layar berubah ukuran.
    map.invalidateSize({ animate: false });

    if (isFollowing && driver) {
      // Menggunakan panTo agar lebih mulus dan tidak memutus antrean loading peta OSM
      map.panTo([driver.lat, driver.lng], {
        animate: true,
        duration: 0.8,
        easeLinearity: 1,
      });
    }
  }, [map, driver?.lat, driver?.lng, isFollowing]);

  return null;
}

// 3. Komponen Utama TrackingMap
export default function TrackingMap({
  start,
  end,
  progress = 0,
  showHistory = true,
  followDriver = true,
  gpsPosition = null, // Akan diisi oleh Browser Geolocation API dari parent
}) {
  const p = Math.max(0, Math.min(1, progress));

  // Menentukan lokasi driver yang aktif (Memprioritaskan GPS asli)
  const activeDriver = useMemo(() => {
    // Prioritas 1: Jika ada koordinat asli dari Browser Geolocation API
    if (gpsPosition && gpsPosition.lat && gpsPosition.lng) {
      return gpsPosition;
    }
    // Prioritas 2: Simulasi lokasi berdasarkan progress pengiriman
    return {
      lat: start.lat + (end.lat - start.lat) * p,
      lng: start.lng + (end.lng - start.lng) * p,
    };
  }, [start, end, p, gpsPosition]);

  // Menghitung garis perjalanan yang sudah ditempuh
  const traveledPath = useMemo(() => {
    if (p <= 0) return [];
    const steps = 80;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = (i / steps) * p;
      return [
        start.lat + (end.lat - start.lat) * t,
        start.lng + (end.lng - start.lng) * t,
      ];
    });
  }, [start, end, p]);

  // Menghitung garis perjalanan yang belum ditempuh
  const remainingPath = useMemo(() => {
    if (p >= 1) return [];
    return [[activeDriver.lat, activeDriver.lng], [end.lat, end.lng]];
  }, [activeDriver, end, p]);

  // Menentukan batas awal tampilan agar memuat semua titik penting
  const initialBounds = useMemo(() => {
    const lats = [start.lat, end.lat, activeDriver.lat];
    const lngs = [start.lng, end.lng, activeDriver.lng];
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [start, end, activeDriver]);

  return (
    // Wrapper eksternal dijamin mengambil seluruh space parent (flex: 1)
    <div style={{ width: "100%", height: "100%", flex: 1, position: "relative" }}>
      {/* MapContainer mutlak memenuhi wrapper (position: absolute) */}
      <MapContainer
        bounds={initialBounds}
        boundsOptions={{ padding: [50, 50] }}
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController driver={activeDriver} follow={followDriver} />

        {showHistory && traveledPath.length > 1 && (
          <Polyline
            positions={traveledPath}
            pathOptions={{ color: "#3b82f6", weight: 6, opacity: 0.9, lineJoin: "round" }}
          />
        )}

        {remainingPath.length > 0 && (
          <Polyline
            positions={remainingPath}
            pathOptions={{ color: "#9ca3af", weight: 4, opacity: 0.6, dashArray: "10 10" }}
          />
        )}

        <Marker position={[start.lat, start.lng]} icon={ICON_START} />
        <Marker position={[end.lat, end.lng]} icon={ICON_END} />
        <Marker position={[activeDriver.lat, activeDriver.lng]} icon={ICON_DRIVER} />
      </MapContainer>
    </div>
  );
}
