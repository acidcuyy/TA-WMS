import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../../components/common/Card";
import "./DriverTracking.css";

export default function DriverTracking() {
  const [status, setStatus] = useState("Menuju Lokasi"); // Menuju Lokasi, Sampai, Selesai
  const [progress, setProgress] = useState(0);
  const [location, setLocation] = useState({ lat: -6.2088, lng: 106.8456 }); // Jakarta
  const [duration, setDuration] = useState("15 menit");
  const [eta, setEta] = useState("14:55 WIB");

  // Mock movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("Tiba di Tujuan");
          return 100;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dtracking">
      <div className="dtracking__map-container">
        {/* MOCKED GOOGLE MAP */}
        <div className="mock-map">
          <div className="map-overlay">
            <div className="map-search-bar">📍 {status === "Menuju Lokasi" ? "Sedang dalam perjalanan..." : "Tiba di lokasi tujuan"}</div>
          </div>
          
          {/* MOCK ROUTE LINE */}
          <svg className="mock-route" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10,80 C30,70 50,90 90,20" fill="none" stroke="#1890ff" strokeWidth="2" strokeDasharray="5,5" />
            <motion.circle 
              cx={10 + (90-10) * (progress/100)} 
              cy={80 + (20-80) * (progress/100)} 
              r="2" fill="#1890ff" 
            />
          </svg>

          <div className="map-marker origin" style={{ left: '10%', top: '80%' }}>🏢</div>
          <div className="map-marker destination" style={{ left: '90%', top: '20%' }}>📍</div>
          
          <motion.div 
            className="map-marker driver" 
            animate={{ 
              left: `${10 + (90-10) * (progress/100)}%`, 
              top: `${80 + (20-80) * (progress/100)}%` 
            }}
          >
            🚚
          </motion.div>
        </div>
      </div>

      <div className="dtracking__info">
        <Card className="delivery-card">
          <div className="delivery-header">
            <div className="delivery-id">
              <span>ID Pengiriman</span>
              <b>REQ-2026-045</b>
            </div>
            <span className="status-pill">{status}</span>
          </div>

          <div className="progress-section">
            <div className="progress-bar-bg">
              <motion.div 
                className="progress-bar-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              ></motion.div>
            </div>
            <div className="progress-labels">
              <span>{progress}% Perjalanan</span>
              <span>Sisa {duration}</span>
            </div>
          </div>

          <div className="tracking-details">
            <div className="track-item">
              <span className="track-label">Estimasi Tiba</span>
              <b className="track-val">{eta}</b>
            </div>
            <div className="track-item">
              <span className="track-label">Koordinat</span>
              <b className="track-val">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</b>
            </div>
            <div className="track-item">
              <span className="track-label">Kecapatan</span>
              <b className="track-val">45 km/jam</b>
            </div>
          </div>

          <div className="delivery-footer">
            <button 
              className={`btn-action ${status === "Tiba di Tujuan" ? "pulse" : "disabled"}`}
              disabled={status !== "Tiba di Tujuan"}
              onClick={() => alert("Menunggu konfirmasi penerimaan dari Toko...")}
            >
              {status === "Tiba di Tujuan" ? "Hubungi Penerima" : "Sedang Mengantar..."}
            </button>
            <p className="footer-note">Informasi ini dibagikan secara realtime ke Toko Cabang A & Gudang Pusat.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
