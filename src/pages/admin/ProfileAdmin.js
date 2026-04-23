import { useState } from "react";
import { motion } from "framer-motion";
import "./PageAdmin.css";

export default function ProfileAdmin() {
  const [notifStock, setNotifStock] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);

  const stats = [
    { label: "Requests Baru", value: "12", sub: "Hari ini", icon: "🗒️" },
    { label: "Stok Menipis", value: "5", sub: "Butuh perhatian", icon: "📦" },
    { label: "Sinkronisasi", value: "Aktif", sub: "Realtime", icon: "🔄" },
  ];

  const activities = [
    { time: "10:12", text: "Request REQ-014 masuk dari Toko A", icon: "🛍️", color: "#e6f7ff" },
    { time: "09:40", text: "Stok Barang BRG-002 menipis (Gudang)", icon: "📦", color: "#f6ffed" },
    { time: "Kemarin", text: "Update profil admin", icon: "👤", color: "#fff7e6" },
  ];

  return (
    <div className="profile-page">
      {/* TOP HEADER */}
      <header className="profile-header">
        <div className="header-info">
          <h1>Profile Admin</h1>
          <p>Kelola informasi akun, preferensi notifikasi, dan ringkasan aktivitas terbaru.</p>
        </div>
        <div className="header-stats">
          {stats.map((s, i) => (
            <div key={i} className="mini-stat-card">
              <div className="mini-stat-icon">{s.icon}</div>
              <div className="mini-stat-content">
                <span className="mini-stat-label">{s.label}</span>
                <span className="mini-stat-value">{s.value}</span>
                <span className="mini-stat-sub">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="profile-hero-section">
        <div className="hero-main">
          <div className="hero-avatar">A</div>
          <div className="hero-details">
            <div className="hero-name-row">
              <h2>Admin</h2>
              <span className="status-badge online"><i className="dot"></i> Online</span>
            </div>
            <p className="hero-email">admin@gmail.com <span>Admin</span></p>
            <p className="hero-role">Admin</p>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn-primary">Edit Profil</button>
          <button className="btn-outline">Ubah Password</button>
          <button className="btn-text">Lihat Aktivitas</button>
        </div>
      </section>

      {/* CONTENT GRID */}
      <div className="profile-content-grid">
        {/* DATA AKUN */}
        <section className="profile-card">
          <div className="card-header">
            <div className="title-text">
              <h3>Data Akun</h3>
              <p>Informasi dasar pengguna</p>
            </div>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">👤 Nama</span>
              <span className="info-value">Admin</span>
            </div>
            <div className="info-item">
              <span className="info-label">✉️ Email</span>
              <span className="info-value">admin@gmail.com</span>
            </div>
            <div className="info-item">
              <span className="info-label">👤 Role</span>
              <span className="info-value">Admin</span>
            </div>
            <div className="info-item">
              <span className="info-label">🕒 Terakhir Login</span>
              <span className="info-value">13 Mei 2025, 09:40</span>
            </div>
            <div className="info-item">
              <span className="info-label">📅 Bergabung Sejak</span>
              <span className="info-value">10 Januari 2025</span>
            </div>
          </div>
          <div className="card-actions">
            <button className="btn-primary">Simpan Perubahan</button>
            <button className="btn-outline">Batalkan</button>
          </div>
        </section>

        {/* PREFERENSI */}
        <section className="profile-card">
          <div className="card-header">
            <div className="title-text">
              <h3>Preferensi</h3>
              <p>Pengaturan cepat untuk admin</p>
            </div>
          </div>
          <div className="pref-list-modern">
            <div className="settings-row-modern">
              <div className="row-text">
                <strong>Notifikasi stok menipis</strong>
                <span>Muncul ketika stok gudang/toko melewati batas minimum</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifStock} onChange={(e) => setNotifStock(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="settings-row-modern">
              <div className="row-text">
                <strong>Notifikasi request masuk</strong>
                <span>Muncul saat toko mengirim permintaan barang</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifRequests} onChange={(e) => setNotifRequests(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          <div className="card-actions mt-20">
            <button className="btn-primary">Terapkan</button>
            <button className="btn-outline">Reset</button>
          </div>
        </section>

        {/* AKTIVITAS TERBARU */}
        <section className="profile-card full-width">
          <div className="card-header">
            <div className="title-text">
              <h3>Aktivitas Terbaru</h3>
              <p>Log ringkas untuk monitoring</p>
            </div>
            <button className="text-btn-sm">Lihat Semua</button>
          </div>
          <div className="activity-list-modern">
            {activities.map((a, i) => (
              <div key={i} className="activity-row">
                <div className="activity-icon" style={{ backgroundColor: a.color }}>{a.icon}</div>
                <span className="activity-time">{a.time}</span>
                <span className="activity-desc">{a.text}</span>
                <button className="activity-detail-btn">Detail <span>›</span></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
