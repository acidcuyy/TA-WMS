import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../PageAdmin.css";

export default function ProfileAdmin() {
  const navigate = useNavigate();
  const [notifStock, setNotifStock] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "Admin",
    email: "admin@gmail.com",
    phone: "081234567890",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // mock save action
    setIsEditModalOpen(false);
    // Optional: show a toast or success message here
  };

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
              <h2>{formData.nama}</h2>
              <span className="status-badge online"><i className="dot"></i> Online</span>
            </div>
            <p className="hero-email">{formData.email} <span>Admin</span></p>
            <p className="hero-role">Admin</p>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setIsEditModalOpen(true)}>Edit Profil</button>
          <button className="btn-outline">Ubah Password</button>
          <button className="btn-text" onClick={() => navigate('/admin/requests')}>Lihat Aktivitas</button>
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
              <span className="info-value">{formData.nama}</span>
            </div>
            <div className="info-item">
              <span className="info-label">✉️ Email</span>
              <span className="info-value">{formData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">📞 Telepon</span>
              <span className="info-value">{formData.phone}</span>
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
            <button className="text-btn-sm" onClick={() => navigate('/admin/requests')}>Lihat Semua</button>
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

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="profile-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <motion.div 
              className="profile-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="profile-modal-header">
                <div>
                  <h2>Edit Profil</h2>
                  <p>Perbarui informasi akun dan kredensial Anda.</p>
                </div>
                <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
              </div>
              <form className="profile-modal-body" onSubmit={handleSaveProfile}>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nomor Telepon</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Alamat Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat email"
                    required
                  />
                </div>

                <div className="form-divider">
                  <span>Ubah Password (Opsional)</span>
                </div>

                <div className="form-group">
                  <label>Password Lama</label>
                  <input 
                    type="password" 
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    placeholder="Masukkan password lama"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Password Baru</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Masukkan password baru"
                    />
                  </div>
                  <div className="form-group">
                    <label>Konfirmasi Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>

                <div className="profile-modal-footer">
                  <button type="button" className="btn-outline" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                  <button type="submit" className="btn-primary">Simpan Perubahan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
