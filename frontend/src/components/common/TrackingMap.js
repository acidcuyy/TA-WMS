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
import "leaflet-routing-machine";

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

  useEffect(() => {
    setIsFollowing(follow);
  }, [follow]);

  useEffect(() => {
    const onDragStart = () => setIsFollowing(false);
    map.on("dragstart", onDragStart);
    return () => map.off("dragstart", onDragStart);
  }, [map]);

  useEffect(() => {
    const doFit = () => map.invalidateSize({ animate: false });
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

  useEffect(() => {
    map.invalidateSize({ animate: false });
    if (isFollowing && driver) {
      map.panTo([driver.lat, driver.lng], {
        animate: true,
        duration: 0.8,
        easeLinearity: 1,
      });
    }
  }, [map, driver?.lat, driver?.lng, isFollowing]);

  return null;
}

  // 3. RoutingFetcher: Komponen tersembunyi untuk mengambil rute asli dari OSRM
  // Menggunakan fetch langsung ke API OSRM agar lebih stabil dan reliable
  function RoutingFetcher({ start, end, onRouteUpdate }) {
    useEffect(() => {
      if (!start || !end) return;
  
      let isCancelled = false;
      
      const fetchRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (isCancelled) return;
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
            onRouteUpdate(coords);
          }
        } catch (err) {
          console.error("OSRM Route Error:", err);
        }
      };

      fetchRoute();
  
      return () => {
        isCancelled = true;
      };
    }, [start.lat, start.lng, end.lat, end.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  
    return null;
  }

async function geocodeAddressCached(address) {
  if (!address) return null;
  const cacheKey = "geocode_" + address;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      sessionStorage.setItem(cacheKey, JSON.stringify(coords));
      return coords;
    }
  } catch (e) {
    console.warn("Geocoding failed for", address);
  }
  return null;
}

// 4. Komponen Utama TrackingMap
export default function TrackingMap({
  start,
  end,
  startAddress,
  endAddress,
  progress = 0,
  showHistory = true,
  followDriver = true,
  gpsPosition = null,
}) {
  const p = Math.max(0, Math.min(1, progress));
  const [routeCoords, setRouteCoords] = useState([]);
  
  const [actualStart, setActualStart] = useState(start);
  const [actualEnd, setActualEnd] = useState(end);

  // Efek Geocoding
  useEffect(() => {
    let isCancelled = false;
        const fetchCoords = async () => {
        let newStart = start;
        let newEnd = end;
  
        // Hanya geocode jika lat/lng masih 0 (belum di-set spesifik di registrasi cabang)
        const needsStartGeocode = startAddress && (!start || (start.lat === 0 && start.lng === 0));
        const needsEndGeocode = endAddress && (!end || (end.lat === 0 && end.lng === 0));

        if (needsStartGeocode) {
          const coords = await geocodeAddressCached(startAddress);
          if (coords) newStart = coords;
        }
        
        // Kasih jeda kecil agar tidak di-rate-limit oleh Nominatim (1 request / detik)
        if (needsStartGeocode && needsEndGeocode && !sessionStorage.getItem("geocode_" + endAddress)) {
          await new Promise(r => setTimeout(r, 1100));
        }
  
        if (needsEndGeocode) {
          const coords = await geocodeAddressCached(endAddress);
          if (coords) newEnd = coords;
        }
  
        if (!isCancelled) {
          setActualStart(newStart);
          setActualEnd(newEnd);
        }
      };

    if (startAddress || endAddress) {
      fetchCoords();
    } else {
      setActualStart(start);
      setActualEnd(end);
    }

    return () => { isCancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAddress, endAddress, start?.lat, start?.lng, end?.lat, end?.lng]);

  // Interpolasi posisi driver aktif di atas jalan raya (route)
  const activeDriver = useMemo(() => {
    if (gpsPosition && gpsPosition.lat && gpsPosition.lng) {
      return gpsPosition;
    }
    
    if (routeCoords.length === 0) {
      return {
        lat: actualStart.lat + (actualEnd.lat - actualStart.lat) * p,
        lng: actualStart.lng + (actualEnd.lng - actualStart.lng) * p,
      };
    }
    
    if (p <= 0) return routeCoords[0];
    if (p >= 1) return routeCoords[routeCoords.length - 1];

    let totalDist = 0;
    const distances = [0];
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const pt1 = L.latLng(routeCoords[i]);
      const pt2 = L.latLng(routeCoords[i+1]);
      const d = pt1.distanceTo(pt2);
      totalDist += d;
      distances.push(totalDist);
    }

    const targetDist = totalDist * p;
    
    for (let i = 0; i < distances.length - 1; i++) {
      if (targetDist >= distances[i] && targetDist <= distances[i+1]) {
        const segDist = distances[i+1] - distances[i];
        const segP = segDist === 0 ? 0 : (targetDist - distances[i]) / segDist;
        const pt1 = routeCoords[i];
        const pt2 = routeCoords[i+1];
        return {
          lat: pt1.lat + (pt2.lat - pt1.lat) * segP,
          lng: pt1.lng + (pt2.lng - pt1.lng) * segP
        };
      }
    }
    
    return routeCoords[routeCoords.length - 1];
  }, [actualStart, actualEnd, p, gpsPosition, routeCoords]);

  // Helper mencari titik terdekat di rute dengan GPS
  const closestRouteIndex = useMemo(() => {
    if (!gpsPosition || routeCoords.length === 0) return -1;
    let minDist = Infinity;
    let idx = 0;
    const gpsLatLng = L.latLng(gpsPosition.lat, gpsPosition.lng);
    for (let i = 0; i < routeCoords.length; i++) {
      const d = L.latLng(routeCoords[i]).distanceTo(gpsLatLng);
      if (d < minDist) {
        minDist = d;
        idx = i;
      }
    }
    return idx;
  }, [gpsPosition, routeCoords]);

  // Garis perjalanan yang sudah ditempuh (Warna Biru Solid)
  const traveledPath = useMemo(() => {
    if (routeCoords.length === 0) {
      return [[actualStart.lat, actualStart.lng], [activeDriver.lat, activeDriver.lng]];
    }
    
    // Jika ada GPS asli, snap garis biru ke jalan raya terdekat
    if (gpsPosition && closestRouteIndex >= 0) {
      const path = routeCoords.slice(0, closestRouteIndex + 1).map(c => [c.lat, c.lng]);
      path.push([gpsPosition.lat, gpsPosition.lng]);
      return path;
    }

    if (p <= 0) return [];
    if (p >= 1) return routeCoords;

    let totalDist = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      totalDist += L.latLng(routeCoords[i]).distanceTo(L.latLng(routeCoords[i+1]));
    }
    const targetDist = totalDist * p;
    
    const path = [];
    let curDist = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      path.push([routeCoords[i].lat, routeCoords[i].lng]);
      const d = L.latLng(routeCoords[i]).distanceTo(L.latLng(routeCoords[i+1]));
      if (curDist + d >= targetDist) {
        path.push([activeDriver.lat, activeDriver.lng]);
        break;
      }
      curDist += d;
    }
    return path;
  }, [actualStart, activeDriver, p, routeCoords, gpsPosition, closestRouteIndex]);

  // Garis perjalanan yang belum ditempuh (Abu-abu putus-putus)
  const remainingPath = useMemo(() => {
    if (routeCoords.length === 0) {
      return [[activeDriver.lat, activeDriver.lng], [actualEnd.lat, actualEnd.lng]];
    }

    // Jika ada GPS asli, sisa garis dimulai dari posisi GPS driver ke sisa jalan raya
    if (gpsPosition && closestRouteIndex >= 0) {
      const path = [[gpsPosition.lat, gpsPosition.lng]];
      for (let i = closestRouteIndex; i < routeCoords.length; i++) {
        path.push([routeCoords[i].lat, routeCoords[i].lng]);
      }
      return path;
    }
    
    if (p >= 1) return [];

    let totalDist = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      totalDist += L.latLng(routeCoords[i]).distanceTo(L.latLng(routeCoords[i+1]));
    }
    const targetDist = totalDist * p;
    
    const path = [[activeDriver.lat, activeDriver.lng]];
    let curDist = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const d = L.latLng(routeCoords[i]).distanceTo(L.latLng(routeCoords[i+1]));
      if (curDist + d >= targetDist) {
        for (let j = i + 1; j < routeCoords.length; j++) {
          path.push([routeCoords[j].lat, routeCoords[j].lng]);
        }
        break;
      }
      curDist += d;
    }
    return path;
  }, [activeDriver, actualEnd, p, routeCoords, gpsPosition, closestRouteIndex]);

  const initialBounds = useMemo(() => {
    if (routeCoords.length > 0) {
      const lats = routeCoords.map(c => c.lat);
      const lngs = routeCoords.map(c => c.lng);
      return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
    }
    const lats = [actualStart.lat, actualEnd.lat, activeDriver.lat];
    const lngs = [actualStart.lng, actualEnd.lng, activeDriver.lng];
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [actualStart, actualEnd, activeDriver, routeCoords]);

  return (
    <div style={{ width: "100%", height: "100%", flex: 1, position: "relative" }}>
      <MapContainer
        bounds={initialBounds}
        boundsOptions={{ padding: [50, 50] }}
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | Routing: OSRM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RoutingFetcher start={actualStart} end={actualEnd} onRouteUpdate={setRouteCoords} />
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

        <Marker position={[actualStart.lat, actualStart.lng]} icon={ICON_START} />
        <Marker position={[actualEnd.lat, actualEnd.lng]} icon={ICON_END} />
        <Marker position={[activeDriver.lat, activeDriver.lng]} icon={ICON_DRIVER} />
      </MapContainer>
    </div>
  );
}
