import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import "../admin/PageAdmin.css";

const IconDoc = () => (<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a855f7' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const IconBox = () => (<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d97706' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>);
const IconSync = () => (<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>);

const IconUser = () => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const IconMail = () => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a855f7' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const IconShield = () => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const IconClock = () => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const IconCalendar = () => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);

export default function ProfileGudang() {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);
  const [notifStock, setNotifStock] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);
  const branchName = sessionStorage.getItem("reastock_branch_name") || "Gudang Pusat";
  const userName = sessionStorage.getItem("reastock_user_name") || "Admin Gudang";
  const userEmail = sessionStorage.getItem("reastock_user_email") || "gudang@reastock.com";
  const joinDate = sessionStorage.getItem("reastock_user_joinDate") || "10 Januari 2025";
  
  // Format initial
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="pageAdmin-container profile-page">
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easing }}
      >
        <div className="header-info">
          <h1>Profile Gudang</h1>
          <p>Kelola informasi akun, preferensi notifikasi, dan ringkasan aktivitas terbaru.</p>
        </div>
        <div className="header-stats">
          <div className="mini-stat-card">
            <div className="mini-stat-icon" style={{ background: '#f3e8ff' }}><IconDoc /></div>
            <div className="mini-stat-content">
              <span className="mini-stat-label">Request Baru</span>
              <span className="mini-stat-value">8</span>
              <span className="mini-stat-sub">Hari ini</span>
            </div>
          </div>
          <div className="mini-stat-card">
            <div className="mini-stat-icon" style={{ background: '#fef3c7' }}><IconBox /></div>
            <div className="mini-stat-content">
              <span className="mini-stat-label">Stok Menipis</span>
              <span className="mini-stat-value">4</span>
              <span className="mini-stat-sub">Butuh perhatian</span>
            </div>
          </div>
          <div className="mini-stat-card">
            <div className="mini-stat-icon" style={{ background: '#dbeafe' }}><IconSync /></div>
            <div className="mini-stat-content">
              <span className="mini-stat-label">Sinkronisasi</span>
              <span className="mini-stat-value">Aktif</span>
              <span className="mini-stat-sub">Realtime</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="profile-hero-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: easing }}
      >
        <div className="hero-main">
          <div className="hero-avatar">{initial}</div>
          <div className="hero-info">
            <div className="hero-name-row">
              <h2>{userName}</h2>
              <span className="status-badge online"><span className="dot"></span>Online</span>
            </div>
            <p className="hero-email">
              {userEmail} <span>Gudang</span>
            </p>
            <p className="hero-role">{branchName}</p>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn-primary">Edit Profil</button>
          <button className="btn-outline">Ubah Password</button>
          <button className="btn-text" style={{ color: '#e4915a' }}>Lihat Aktivitas</button>
        </div>
      </motion.div>

      <motion.div
        className="profile-content-grid"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: easing }}
      >
        <div className="profile-card">
          <div className="card-header">
            <div>
              <h3>Data Akun</h3>
              <p>Informasi dasar pengguna</p>
            </div>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconUser /> Nama</span>
              <span className="info-value">{userName}</span>
            </div>
            <div className="info-item">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconMail /> Email</span>
              <span className="info-value">{userEmail}</span>
            </div>
            <div className="info-item">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconShield /> Role</span>
              <span className="info-value">Gudang</span>
            </div>
            <div className="info-item">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconClock /> Terakhir Login</span>
              <span className="info-value">Hari Ini</span>
            </div>
            <div className="info-item">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconCalendar /> Bergabung Sejak</span>
              <span className="info-value">{joinDate}</span>
            </div>
          </div>
          <div className="card-actions">
            <button className="btn-primary">Simpan Perubahan</button>
            <button className="btn-outline">Batalkan</button>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <div>
              <h3>Preferensi</h3>
              <p>Pengaturan cepat untuk gudang</p>
            </div>
          </div>
          <div className="settings-list" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="settings-row-modern">
              <div className="row-text">
                <strong>Notifikasi stok menipis</strong>
                <span>Muncul ketika stok gudang melewati batas minimum</span>
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
          <div className="card-actions" style={{ marginTop: '32px' }}>
            <button className="btn-primary">Terapkan</button>
            <button className="btn-outline">Reset</button>
          </div>
        </div>

        <div className="profile-card full-width">
          <div className="card-header" style={{ alignItems: 'center' }}>
            <div>
              <h3>Aktivitas Terbaru</h3>
              <p>Log ringkas untuk monitoring</p>
            </div>
          </div>
          <div className="activity-list-modern">
            <div className="activity-row">
              <div className="activity-icon" style={{ background: '#e0f2fe', color: '#3b82f6' }}>
                <IconDoc />
              </div>
              <div className="activity-time">10:12</div>
              <div className="activity-desc">Request REQ-014 masuk dari Toko A</div>
              <button className="activity-detail-btn">Detail <IconChevronRight /></button>
            </div>
            <div className="activity-row">
              <div className="activity-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <IconBox />
              </div>
              <div className="activity-time">09:40</div>
              <div className="activity-desc">Stok Barang BRG-002 menipis (Gudang)</div>
              <button className="activity-detail-btn">Detail <IconChevronRight /></button>
            </div>
            <div className="activity-row">
              <div className="activity-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}>
                <IconUser />
              </div>
              <div className="activity-time">Kemarin</div>
              <div className="activity-desc">Update profil gudang</div>
              <button className="activity-detail-btn">Detail <IconChevronRight /></button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
