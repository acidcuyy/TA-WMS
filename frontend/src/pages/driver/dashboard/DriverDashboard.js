import { motion } from "framer-motion";
import Card from "../../../components/common/Card";
import "./DriverDashboard.css";

export default function DriverDashboard() {
  const activeTask = {
    id: "REQ-2026-045",
    type: "Antar Barang",
    from: "Gudang Pusat",
    to: "Toko Cabang A",
    items: 124,
    status: "Menunggu Pick-up",
    priority: "Tinggi",
    time: "14:30 WIB"
  };

  const tasks = [
    { id: "REQ-2026-042", from: "Gudang Barat", to: "Toko B", status: "Selesai", date: "03 Mei 2026" },
    { id: "REQ-2026-041", from: "Gudang Timur", to: "Toko C", status: "Selesai", date: "02 Mei 2026" },
    { id: "REQ-2026-040", from: "Gudang Pusat", to: "Gudang Selatan", status: "Selesai", date: "02 Mei 2026" },
  ];

  return (
    <div className="ddash">
      <header className="ddash__head">
        <h1 className="ddash__title">Halo, Budi Santoso! 👋</h1>
        <p className="ddash__subtitle">Anda memiliki 1 tugas baru yang menunggu.</p>
      </header>

      <div className="ddash__grid">
        <div className="ddash__main">
          {/* ACTIVE TASK */}
          <section className="ddash__active">
            <h3 className="section-title">Tugas Aktif Hari Ini</h3>
            <Card className="active-card">
              <div className="active-card__header">
                <span className="task-id">{activeTask.id}</span>
                <span className="task-priority" style={{ background: '#fff1f0', color: '#ff4d4f' }}>{activeTask.priority}</span>
              </div>
              <div className="active-card__route">
                <div className="route-point">
                  <div className="point-icon origin">🏙</div>
                  <div className="point-info">
                    <span className="point-label">Dari (Asal)</span>
                    <b className="point-name">{activeTask.from}</b>
                  </div>
                </div>
                <div className="route-line"></div>
                <div className="route-point">
                  <div className="point-icon destination">📍</div>
                  <div className="point-info">
                    <span className="point-label">Ke (Tujuan)</span>
                    <b className="point-name">{activeTask.to}</b>
                  </div>
                </div>
              </div>
              <div className="active-card__details">
                <div className="detail-item">
                  <span>📦 Total Item</span>
                  <b>{activeTask.items} item</b>
                </div>
                <div className="detail-item">
                  <span>🕒 Estimasi</span>
                  <b>{activeTask.time}</b>
                </div>
              </div>
              <button className="btn-start-trip" onClick={() => window.location.href='/driver/tracking'}>
                Ambil & Mulai Pengantaran 🚚
              </button>
            </Card>
          </section>

          {/* PERFORMANCE STATS */}
          <div className="ddash__stats">
            {[
              { label: "Total Pengiriman", val: "128", sub: "Bulan ini", icon: "🚚", color: "#1890ff" },
              { label: "Rating Driver", val: "4.9", sub: "Bintang", icon: "⭐", color: "#faad14" },
              { label: "On Time Rate", val: "98%", sub: "Sangat Baik", icon: "⏱", color: "#52c41a" },
            ].map((s, i) => (
              <Card key={i} className="mini-stat">
                <span className="mini-stat__icon">{s.icon}</span>
                <div className="mini-stat__info">
                  <span className="mini-stat__label">{s.label}</span>
                  <h4 className="mini-stat__val">{s.val}</h4>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <aside className="ddash__sidebar">
          <Card className="history-widget">
            <div className="widget-header">
              <h3>Riwayat Terbaru</h3>
              <a href="/driver/history">Lihat Semua</a>
            </div>
            <div className="history-list">
              {tasks.map((t, i) => (
                <div key={i} className="history-item">
                  <div className="history-icon">📦</div>
                  <div className="history-info">
                    <b>{t.id}</b>
                    <span>{t.from} → {t.to}</span>
                  </div>
                  <div className="history-date">{t.date}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="driver-info-card">
            <div className="driver-profile-mini">
              <div className="driver-avatar-large">👤</div>
              <h4>Budi Santoso</h4>
              <p>ID Driver: DRV-001</p>
            </div>
            <div className="vehicle-info">
              <span className="info-label">Kendaraan:</span>
              <b>Truck Hino (B 1234 ABC)</b>
            </div>
            <div className="vehicle-info">
              <span className="info-label">Kapasitas:</span>
              <b>3.5 Ton / 12 m³</b>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
