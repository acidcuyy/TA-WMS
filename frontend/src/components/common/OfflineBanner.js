// src/components/common/OfflineBanner.js
// Banner kecil yang muncul otomatis saat koneksi internet terputus

import { useState, useEffect } from "react";
import "./OfflineBanner.css";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const goOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      // Sembunyikan banner "Terhubung kembali" setelah 3 detik
      setTimeout(() => setJustReconnected(false), 3000);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline && !justReconnected) return null;

  return (
    <div className={`offline-banner ${isOffline ? "offline-banner--offline" : "offline-banner--online"}`}>
      <span className="offline-banner__dot" />
      <span className="offline-banner__text">
        {isOffline
          ? "📡 Tidak ada koneksi — Aplikasi berjalan dalam mode offline"
          : "✅ Koneksi internet kembali"}
      </span>
    </div>
  );
}
