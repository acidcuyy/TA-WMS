import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";
import "./SettingsGudang.css";
import avatarImg from "../../assets/images/stok.jpg";

export default function SettingsGudang() {
  const [activeTab, setActiveTab] = useState("Profil Akun");
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [saved, setSaved] = useState(false);

  // Logic from SettingsPage.js
  const [notifStock, setNotifStock] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("5");
  const [syncStatus, setSyncStatus] = useState("Connected (dummy)");
  const { theme, setTheme } = useTheme();
  const [compact, setCompact] = useState(false);

  const tabs = ["Profil Akun", "Preferensi", "Keamanan", "Notifikasi", "Aktivitas"];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testRealtime = () => {
    setSyncStatus("Testing...");
    setTimeout(() => setSyncStatus("Connected (dummy)"), 900);
  };

  const stats = [
    { label: "Request Baru", val: "12", sub: "Hari ini", icon: "📥", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Stok Menipis", val: "5", sub: "Hari ini", icon: "⚠️", color: "#52c41a", bg: "#f6ffed" },
    { label: "Butuh Perhatian", val: "7", sub: "Hari ini", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Sinkronisasi", val: "98%", sub: "Realtime", icon: "🌐", color: "#722ed1", bg: "#f9f0ff" },
  ];

  const activities = [
    { title: "Request REQ-014 masuk dari Toko A", time: "10:12 WIB", icon: "📥", color: "#1890ff" },
    { title: "Stok BRG-002 menipis (Gudang)", time: "09:40 WIB", icon: "⚠️", color: "#fa8c16" },
    { title: "Penerimaan barang PO-2026-00078", time: "09:15 WIB", icon: "📥", color: "#52c41a" },
    { title: "Transfer TR-2026-00123 selesai", time: "08:30 WIB", icon: "⇄", color: "#1890ff" },
    { title: "Pengeluaran DO-2026-00125 diproses", time: "07:45 WIB", icon: "📤", color: "#722ed1" },
  ];

  return (
    <div className="setGudang">
      {/* HEADER */}
      <header className="setGudang__head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="setGudang__title">Pengaturan Akun</h1>
            <div className="setGudang__breadcrumb">
              Pengaturan <span>›</span> Akun
            </div>
          </div>
          {saved && <div className="sa-settings-saved">Perubahan berhasil disimpan! ✓</div>}
        </div>
      </header>

      {/* TABS */}
      <nav className="setGudang__tabs">
        {tabs.map(t => (
          <div key={t} className={`setGudang__tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </div>
        ))}
      </nav>

      <div className="setGudang__layout">
        <div className="setGudang__mainCol">
          <AnimatePresence mode="wait">
            {activeTab === "Profil Akun" ? (
              <motion.div
                key="profile-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="setGudang__mainCol"
              >
                {/* INFORMASI AKUN */}
                <section className="setGudang__card">
                  <div className="setGudang__cardTitleRow">
                    <div>
                      <h2 className="setGudang__cardTitle">Informasi Akun</h2>
                      <p className="setGudang__cardSub">Kelola informasi akun gudang Anda.</p>
                    </div>
                    <button className="btn-ghost-premium">
                      <span style={{ marginRight: '8px' }}>✎</span> Edit Profil
                    </button>
                  </div>

                  <div className="setGudang__infoGrid">
                    <div className="setGudang__avatarWrap">
                      <img src={avatarImg} alt="Avatar" className="setGudang__avatar" />
                      <div className="setGudang__avatarEdit">📷</div>
                    </div>
                    <div className="setGudang__details">
                      <span className="setGudang__detLabel">Nama Lengkap</span> <span className="setGudang__detVal">Admin Gudang</span>
                      <span className="setGudang__detLabel">Nama Pengguna</span> <span className="setGudang__detVal">Gudang</span>
                      <span className="setGudang__detLabel">Email</span> <span className="setGudang__detVal">gudang@gmail.com</span>
                      <span className="setGudang__detLabel">Role</span> <span className="setGudang__detVal">Gudang</span>
                      <span className="setGudang__detLabel">Gudang</span> <span className="setGudang__detVal">Gudang Pusat</span>
                      <span className="setGudang__detLabel">Terakhir Login</span> <span className="setGudang__detVal"><span style={{ color: '#52c41a', marginRight: '6px' }}>●</span> Hari ini, 09:40 WIB</span>
                    </div>
                  </div>
                </section>

                {/* UBAH PASSWORD */}
                <section className="setGudang__card">
                  <h2 className="setGudang__cardTitle">Ubah Password</h2>
                  <p className="setGudang__cardSub" style={{ marginBottom: '32px' }}>Perbarui password akun Anda secara berkala untuk keamanan.</p>

                  <div className="setGudang__form">
                    <div className="setGudang__field">
                      <label className="setGudang__detLabel">Password Saat Ini</label>
                      <div className="setGudang__inputWrap">
                        <input type={showPass.current ? "text" : "password"} className="setGudang__input" placeholder="Masukkan password saat ini" />
                        <span className="setGudang__inputIcon" onClick={() => setShowPass({ ...showPass, current: !showPass.current })}>
                          {showPass.current ? "👁️" : "👁️‍🗨️"}
                        </span>
                      </div>
                    </div>
                    <div className="setGudang__field">
                      <label className="setGudang__detLabel">Password Baru</label>
                      <div className="setGudang__inputWrap">
                        <input type={showPass.new ? "text" : "password"} className="setGudang__input" placeholder="Masukkan password baru" />
                        <span className="setGudang__inputIcon" onClick={() => setShowPass({ ...showPass, new: !showPass.new })}>
                          {showPass.new ? "👁️" : "👁️‍🗨️"}
                        </span>
                      </div>
                    </div>
                    <div className="setGudang__field">
                      <label className="setGudang__detLabel">Konfirmasi Password Baru</label>
                      <div className="setGudang__inputWrap">
                        <input type={showPass.confirm ? "text" : "password"} className="setGudang__input" placeholder="Konfirmasi password baru" />
                        <span className="setGudang__inputIcon" onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}>
                          {showPass.confirm ? "👁️" : "👁️‍🗨️"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button className="btn-premium" onClick={handleSave}>
                        <span>🔒</span> Simpan Password
                      </button>
                    </div>
                  </div>
                </section>

                {/* PREFERENSI (Integrated logic) */}
                <section className="setGudang__card">
                  <h2 className="setGudang__cardTitle">Preferensi</h2>
                  <p className="setGudang__cardSub" style={{ marginBottom: '32px' }}>Atur preferensi sistem sesuai kebutuhan Anda.</p>

                  <div className="setGudang__prefGrid">
                    <div className="setGudang__prefItem">
                      <div className="setGudang__prefIcon" style={{ background: '#fff7e6', color: '#fa8c16' }}>⚡</div>
                      <div className="setGudang__prefMain">
                        <span className="setGudang__prefLabel">Pengaturan Cepat</span>
                        <span className="setGudang__prefDesc">Aktifkan pintasan untuk mempercepat input data</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="setGudang__prefItem">
                      <div className="setGudang__prefIcon" style={{ background: '#f9f0ff', color: '#722ed1' }}>🔔</div>
                      <div className="setGudang__prefMain">
                        <span className="setGudang__prefLabel">Notifikasi Stok Menipis</span>
                        <span className="setGudang__prefDesc">Terima notifikasi ketika stok melewati batas minimum</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={notifStock} onChange={(e) => setNotifStock(e.target.checked)} />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="setGudang__prefItem">
                      <div className="setGudang__prefIcon" style={{ background: '#f6ffed', color: '#52c41a' }}>🚚</div>
                      <div className="setGudang__prefMain">
                        <span className="setGudang__prefLabel">Notifikasi Pengiriman</span>
                        <span className="setGudang__prefDesc">Terima notifikasi saat toko mengirim permintaan barang</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={notifRequests} onChange={(e) => setNotifRequests(e.target.checked)} />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="setGudang__prefItem">
                      <div className="setGudang__prefIcon" style={{ background: '#e6f7ff', color: '#1890ff' }}>🌐</div>
                      <div className="setGudang__prefMain">
                        <span className="setGudang__prefLabel">Auto Sync Realtime</span>
                        <span className="setGudang__prefDesc">Sinkronisasi otomatis agar stok selalu update</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px' }}>
                    <button className="btn-ghost-premium">↻ Reset ke Default</button>
                    <button className="btn-premium" onClick={handleSave}>Simpan Preferensi</button>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="other-tabs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '120px 40px', color: '#888', background: 'white', borderRadius: '28px', border: '1px solid var(--border)' }}
              >
                <div style={{ fontSize: '56px', marginBottom: '20px' }}>⚙️</div>
                <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>Halaman {activeTab}</h3>
                <p>Modul ini sedang dalam tahap pengembangan teknis.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="setGudang__sideStack">
          <section className="setGudang__card" style={{ padding: '32px' }}>
            <h3 className="setGudang__cardTitle" style={{ fontSize: '18px', marginBottom: '24px' }}>Ringkasan Aktivitas Akun</h3>
            <div className="setGudang__sideGrid">
              {stats.map((s, i) => (
                <div key={i} className="setGudang__sideStat">
                  <div className="setGudang__sideStatIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div>
                    <p className="setGudang__sideStatVal">{s.val}</p>
                    <p className="setGudang__sideStatLabel">{s.label}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="setGudang__card" style={{ padding: '32px' }}>
            <div className="setGudang__cardTitleRow" style={{ marginBottom: '24px' }}>
              <h3 className="setGudang__cardTitle" style={{ fontSize: '18px' }}>Aktivitas Terbaru</h3>
              <button className="btn-text" style={{ fontSize: '13px', color: '#fa8c16', fontWeight: 700 }}>Lihat Semua</button>
            </div>
            <div className="setGudang__timeline">
              {activities.map((a, i) => (
                <div key={i} className="setGudang__timeItem">
                  <div className="setGudang__timeIcon" style={{ color: a.color, background: `${a.color}15` }}>{a.icon}</div>
                  <div className="setGudang__timeMain">
                    <p className="setGudang__timeTitle">{a.title}</p>
                    <p className="setGudang__timeSub">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
