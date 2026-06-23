import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";

/**
 * SettingsPage - Komponen bersama untuk pengaturan akun.
 * @param {string} role - "admin" | "gudang" | "toko"
 */
export default function SettingsPage({ role = "admin" }) {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  // Local state for settings
  const [notifItems, setNotifItems] = useState([]);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("5");
  const [syncStatus, setSyncStatus] = useState("Connected");
  const [tempTheme, setTempTheme] = useState(theme);
  const [compact, setCompact] = useState(false);

  // Initialize notification items based on role
  useEffect(() => {
    let initialItems = [];
    if (role === "admin") {
      initialItems = [
        { id: "stock", label: "Stok menipis", desc: "Tampil saat stok gudang/toko melewati batas minimum.", enabled: true },
        { id: "requests", label: "Permintaan barang", desc: "Tampil saat toko mengirim request kebutuhan barang.", enabled: true },
      ];
    } else if (role === "gudang") {
      initialItems = [
        { id: "stock", label: "Stok menipis", desc: "Tampil saat stok gudang melewati batas minimum.", enabled: true },
        { id: "request_in", label: "Request masuk", desc: "Tampil saat toko mengirim permintaan barang ke gudang.", enabled: true },
        { id: "order_in", label: "Order masuk", desc: "Tampil saat ada order baru yang harus diproses gudang.", enabled: true },
      ];
    } else if (role === "toko") {
      initialItems = [
        { id: "stock", label: "Stok menipis", desc: "Tampil saat stok produk toko melewati batas minimum.", enabled: true },
        { id: "new_order", label: "Pesanan baru", desc: "Tampil saat ada pesanan penjualan baru masuk.", enabled: true },
        { id: "returns", label: "Retur penjualan", desc: "Tampil saat pelanggan mengajukan retur barang.", enabled: true },
      ];
    }
    setNotifItems(initialItems);
    setTempTheme(theme);
  }, [role, theme]);

  const handleToggleNotif = (id) => {
    setNotifItems(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const handleSave = () => {
    // Apply the theme to global state only on save
    setTheme(tempTheme);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const testRealtime = () => {
    setSyncStatus("Testing...");
    setTimeout(() => setSyncStatus("Connected"), 900);
  };

  const sectionMotion = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: easing },
  };

  const statusClass =
    syncStatus === "Testing..."
      ? "sa-settings-status is-testing"
      : syncStatus.toLowerCase().includes("connected")
        ? "sa-settings-status is-connected"
        : "sa-settings-status";

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <>
      <style>{`
        .sa-settings-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 24px 40px;
          color: var(--text);
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
          background-color: transparent;
        }

        .sa-settings-shell {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .sa-settings-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .sa-settings-hero-left h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .sa-settings-hero-left p {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
        }

        .sa-settings-actions {
          display: flex;
          gap: 12px;
        }

        .sa-settings-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          border: none;
        }

        .sa-settings-btn-primary {
          background: var(--primary);
          color: #fff;
        }

        .sa-settings-btn-secondary {
          background: var(--bg-2);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .sa-settings-btn:hover {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }

        .sa-settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .sa-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px;
          box-shadow: var(--shadow-soft);
        }

        .sa-card-full {
          grid-column: span 2;
        }

        .sa-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .sa-card-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sa-card-icon {
          width: 48px;
          height: 48px;
          background: var(--surface);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--primary);
        }

        .sa-card-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .sa-card-title p {
          margin: 2px 0 0;
          font-size: 13px;
          color: var(--muted);
        }

        .sa-card-pill {
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
          background: #22c55e;
          padding: 4px 12px;
          border-radius: 999px;
          text-transform: capitalize;
        }

        .sa-card-pill-orange {
          color: #ffffff;
          background: var(--primary);
        }

        .sa-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sa-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sa-row-info h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .sa-row-info p {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
        }

        /* TOGGLE SWITCH */
        .sa-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .sa-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .sa-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border);
          transition: .3s;
          border-radius: 24px;
        }

        .sa-slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .sa-slider {
          background-color: var(--primary);
        }

        input:checked + .sa-slider:before {
          transform: translateX(20px);
        }

        /* SINKRONISASI SPECIFICS */
        .sa-sync-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 8px;
        }

        .sa-field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }

        .sa-field-subtext {
          display: block;
          font-size: 11px;
          color: var(--subtle);
          margin-bottom: 8px;
        }

        .sa-select-wrapper {
          position: relative;
        }

        .sa-select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          appearance: none;
          cursor: pointer;
        }

        .sa-select-wrapper::after {
          content: "▼";
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          color: var(--muted);
          pointer-events: none;
        }

        .sa-status-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }

        .sa-status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }

        .sa-tes-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid var(--primary);
          background: transparent;
          color: var(--text);
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: var(--transition);
        }

        .sa-tes-btn:hover {
          background: var(--primary);
          color: #ffffff;
        }

        /* TAMPILAN SPECIFICS */
        .sa-theme-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 12px;
        }

        .sa-theme-card {
          position: relative;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          cursor: pointer;
          transition: var(--transition);
          background: var(--bg);
        }

        .sa-theme-card.is-active {
          border-color: var(--primary);
          box-shadow: 0 0 0 1px var(--primary);
        }

        .sa-theme-strip {
          height: 48px;
          border-radius: 10px;
          margin-bottom: 16px;
          display: flex;
          overflow: hidden;
        }

        .sa-theme-strip span { flex: 1; }
        .sa-theme-strip.warm span:nth-child(1) { background: #fed7aa; }
        .sa-theme-strip.warm span:nth-child(2) { background: #fb923c; }
        .sa-theme-strip.warm span:nth-child(3) { background: #ea580c; }

        .sa-theme-strip.dark span:nth-child(1) { background: #1e293b; }
        .sa-theme-strip.dark span:nth-child(2) { background: #334155; }
        .sa-theme-strip.dark span:nth-child(3) { background: #94a3b8; }

        .sa-theme-info h5 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          text-transform: capitalize;
        }

        .sa-theme-info p {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
        }

        .sa-check-mark {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 24px;
          height: 24px;
          background: var(--primary);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: var(--shadow-hero);
          border: 2px solid var(--bg);
        }

        .sa-compact-row {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 1024px) {
          .sa-settings-grid { grid-template-columns: 1fr; }
          .sa-card-full { grid-column: span 1; }
        }

        @media (max-width: 600px) {
          .sa-settings-page { padding: 16px 20px; }
          .sa-settings-hero { flex-direction: column; align-items: flex-start; }
          .sa-sync-controls { grid-template-columns: 1fr; }
          .sa-theme-grid { grid-template-columns: 1fr; }
          .sa-card { padding: 16px; }
          .sa-row { flex-direction: column; align-items: flex-start; gap: 12px; }
          .sa-row .sa-switch { align-self: flex-start; }
        }
      `}</style>

      <div className="sa-settings-page">
        <motion.div
          className="sa-settings-shell"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easing }}
        >
          {/* HEADER */}
          <section className="sa-settings-hero">
            <div className="sa-settings-hero-left">
              <h1>Pengaturan Sistem</h1>
              <p>Kelola pengaturan aplikasi untuk notifikasi, sinkronisasi, dan tampilan.</p>
            </div>

            <div className="sa-settings-actions">
              <button className="sa-settings-btn sa-settings-btn-primary" onClick={handleSave}>
                <span>💾</span> Simpan Perubahan
              </button>
              <button className="sa-settings-btn sa-settings-btn-secondary" onClick={() => window.location.reload()}>
                <span>🔄</span> Reset
              </button>
            </div>
          </section>

          {/* GRID */}
          <div className="sa-settings-grid">
            {/* NOTIFIKASI */}
            <motion.div className="sa-card" {...sectionMotion}>
              <div className="sa-card-head">
                <div className="sa-card-title-group">
                  <div className="sa-card-icon">🔔</div>
                  <div className="sa-card-title">
                    <h3>Notifikasi</h3>
                    <p>Atur notifikasi penting untuk {role}.</p>
                  </div>
                </div>
                <span className="sa-card-pill sa-card-pill-orange">Alerts</span>
              </div>

              <div className="sa-stack">
                {notifItems.map(item => (
                  <div className="sa-row" key={item.id}>
                    <div className="sa-row-info">
                      <h4>{item.label}</h4>
                      <p>{item.desc}</p>
                    </div>
                    <label className="sa-switch">
                      <input type="checkbox" checked={item.enabled} onChange={() => handleToggleNotif(item.id)} />
                      <span className="sa-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SINKRONISASI */}
            <motion.div className="sa-card" {...sectionMotion}>
              <div className="sa-card-head">
                <div className="sa-card-title-group">
                  <div className="sa-card-icon">🔄</div>
                  <div className="sa-card-title">
                    <h3>Sinkronisasi</h3>
                    <p>Kontrol data realtime and interval sinkronisasi aplikasi.</p>
                  </div>
                </div>
                <span className="sa-card-pill">Realtime</span>
              </div>

              <div className="sa-stack">
                <div className="sa-row">
                  <div className="sa-row-info">
                    <h4>Auto Sync</h4>
                    <p>Sinkronisasi otomatis agar stok selalu update.</p>
                  </div>
                  <label className="sa-switch">
                    <input type="checkbox" checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} />
                    <span className="sa-slider"></span>
                  </label>
                </div>

                <div className="sa-sync-controls">
                  <div className="sa-field">
                    <label className="sa-field-label">Interval Sync</label>
                    <span className="sa-field-subtext">berapa menit sekali (dummy)</span>
                    <div className="sa-select-wrapper">
                      <select className="sa-select" value={syncInterval} onChange={(e) => setSyncInterval(e.target.value)} disabled={!autoSync}>
                        <option value="1">1 menit</option>
                        <option value="5">5 menit</option>
                        <option value="10">10 menit</option>
                        <option value="30">30 menit</option>
                      </select>
                    </div>
                  </div>

                  <div className="sa-field">
                    <label className="sa-field-label">Status</label>
                    <span className="sa-field-subtext">contoh status koneksi realtime</span>
                    <div className="sa-status-box">
                      <span className="sa-status-dot"></span>
                      <span>{syncStatus} (dummy)</span>
                    </div>
                  </div>
                </div>

                <button className="sa-tes-btn" onClick={testRealtime}>
                  <span>📡</span> Tes Realtime
                </button>
              </div>
            </motion.div>

            {/* TAMPILAN */}
            <motion.div className="sa-card sa-card-full" {...sectionMotion}>
              <div className="sa-card-head">
                <div className="sa-card-title-group">
                  <div className="sa-card-icon">🎨</div>
                  <div className="sa-card-title">
                    <h3>Tampilan</h3>
                    <p>Pilih tema dan atur tampilan sesuai preferensi.</p>
                  </div>
                </div>
                <span className="sa-card-pill sa-card-pill-orange">UI</span>
              </div>

              <div className="sa-stack">
                <div className="sa-field">
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Theme</h4>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>Pilih mode tampilan aplikasi</p>

                  <div className="sa-theme-grid">
                    {["warm", "dark"].map((t) => (
                      <div key={t} className={`sa-theme-card ${tempTheme === t ? 'is-active' : ''}`} onClick={() => setTempTheme(t)}>
                        <div className={`sa-theme-strip ${t}`}>
                          <span /><span /><span />
                        </div>
                        <div className="sa-theme-info">
                          <h5>{t}</h5>
                          <p>
                            {t === "warm" && "Nuansa hangat, lembut, dan natural."}
                            {t === "dark" && "Mode gelap yang fokus dan elegan."}
                          </p>
                        </div>
                        {tempTheme === t && <div className="sa-check-mark">✓</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sa-row sa-compact-row">
                  <div className="sa-row-info">
                    <h4>Compact Mode</h4>
                    <p>Tampilan lebih rapat untuk layar kecil.</p>
                  </div>
                  <label className="sa-switch">
                    <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
                    <span className="sa-slider"></span>
                  </label>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}