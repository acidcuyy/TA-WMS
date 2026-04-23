import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";

export default function SettingsAdmin() {
  const role = "admin"; // admin | gudang | toko
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);
  const [saved, setSaved] = useState(false);

  // state lama tetap dipertahankan
  const [notifStock, setNotifStock] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("5");
  const [syncStatus, setSyncStatus] = useState("Connected (dummy)");
  const { theme, setTheme } = useTheme();
  const [compact, setCompact] = useState(false);

  // fungsi lama tetap dipertahankan
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const testRealtime = () => {
    setSyncStatus("Testing...");
    setTimeout(() => setSyncStatus("Connected (dummy)"), 900);
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

  return (
    <>
      <style>{`
        .sa-settings-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 20px 64px;
          color: #2f241c;
          box-sizing: border-box;
        }

        .sa-settings-shell {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sa-settings-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .sa-settings-hero-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .sa-settings-badge {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(109, 79, 47, 0.10);
          color: #6d4f2f;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .sa-settings-title {
          margin: 0;
          font-size: clamp(34px, 4vw, 46px);
          line-height: 1.04;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #2e231b;
        }

        .sa-settings-subtitle {
          margin: 0;
          max-width: 720px;
          font-size: 15px;
          line-height: 1.7;
          color: #846f5e;
        }

        .sa-settings-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .sa-settings-btn {
          border: none;
          outline: none;
          cursor: pointer;
          border-radius: 14px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 800;
          transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
        }

        .sa-settings-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.02);
        }

        .sa-settings-btn:active {
          transform: translateY(0);
        }

        .sa-settings-btn-primary {
          background: linear-gradient(135deg, #6b4e00, #8a6707);
          color: #fff;
          box-shadow: 0 14px 28px rgba(107, 78, 0, 0.18);
        }

        .sa-settings-btn-secondary {
          background: rgba(255, 255, 255, 0.72);
          color: #4c392b;
          box-shadow: inset 0 0 0 1px rgba(92, 68, 46, 0.08);
        }

        .sa-settings-saved {
          display: inline-flex;
          align-items: center;
          padding: 11px 14px;
          border-radius: 14px;
          background: #eef8f1;
          color: #287547;
          font-size: 14px;
          font-weight: 800;
          box-shadow: inset 0 0 0 1px rgba(40, 117, 71, 0.08);
        }

        .sa-settings-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 22px;
        }

        .sa-col-6 {
          grid-column: span 6;
        }

        .sa-col-12 {
          grid-column: span 12;
        }

        .sa-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 24px;
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,247,243,0.97));
          border: 1px solid rgba(124, 95, 63, 0.08);
          box-shadow:
            0 18px 42px rgba(78, 55, 32, 0.08),
            inset 0 1px 0 rgba(255,255,255,0.85);
          box-sizing: border-box;
        }

        .sa-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at top right, rgba(155, 117, 74, 0.09), transparent 24%),
            radial-gradient(circle at bottom left, rgba(107, 78, 0, 0.05), transparent 20%);
        }

        .sa-card-head {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .sa-card-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sa-card-title {
          margin: 0;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #30251d;
        }

        .sa-card-desc {
          margin: 0;
          color: #917d6b;
          font-size: 14px;
          line-height: 1.65;
        }

        .sa-card-pill {
          flex-shrink: 0;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(109, 79, 47, 0.10);
          color: #6d4f2f;
          font-size: 12px;
          font-weight: 800;
        }

        .sa-stack {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sa-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          border-top: 1px solid rgba(124, 95, 63, 0.08);
        }

        .sa-row:first-child {
          border-top: none;
          padding-top: 0;
        }

        .sa-row:last-child {
          padding-bottom: 0;
        }

        .sa-row-main {
          min-width: 0;
          flex: 1;
        }

        .sa-row-title {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 800;
          color: #35291f;
        }

        .sa-row-subtitle {
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
          color: #92806f;
        }

        .sa-control {
          flex-shrink: 0;
        }

        .sa-switch {
          position: relative;
          width: 54px;
          height: 30px;
          display: inline-block;
        }

        .sa-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .sa-slider {
          position: absolute;
          inset: 0;
          cursor: pointer;
          border-radius: 999px;
          background: #e2d8ce;
          transition: all 0.25s ease;
          box-shadow: inset 0 0 0 1px rgba(73, 53, 36, 0.06);
        }

        .sa-slider::before {
          content: "";
          position: absolute;
          width: 22px;
          height: 22px;
          left: 4px;
          top: 4px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 3px 8px rgba(38, 29, 21, 0.16);
          transition: transform 0.25s ease;
        }

        .sa-switch input:checked + .sa-slider {
          background: linear-gradient(135deg, #6b4e00, #8a6a13);
        }

        .sa-switch input:checked + .sa-slider::before {
          transform: translateX(24px);
        }

        .sa-switch input:disabled + .sa-slider {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .sa-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: end;
        }

        .sa-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .sa-field-label {
          font-size: 13px;
          font-weight: 800;
          color: #6b5847;
        }

        .sa-help {
          margin: 0;
          color: #8fa0b6;
          font-size: 12px;
          line-height: 1.45;
        }

        .sa-select {
          width: 100%;
          min-height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(110, 82, 53, 0.12);
          background: #fff;
          color: #33271e;
          padding: 0 14px;
          font-size: 14px;
          font-weight: 700;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .sa-select:focus {
          border-color: rgba(107, 78, 0, 0.35);
          box-shadow: 0 0 0 4px rgba(107, 78, 0, 0.09);
        }

        .sa-select:disabled {
          background: #f2ede8;
          color: #9d8c7d;
          cursor: not-allowed;
        }

        .sa-settings-status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 46px;
          padding: 0 14px;
          border-radius: 14px;
          background: #faf7f3;
          border: 1px solid rgba(124, 95, 63, 0.08);
          color: #56453a;
          font-weight: 800;
          box-sizing: border-box;
        }

        .sa-settings-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #8c9aab;
          box-shadow: 0 0 0 4px rgba(140, 154, 171, 0.12);
        }

        .sa-settings-status.is-connected .sa-settings-status-dot {
          background: #2fb067;
          box-shadow: 0 0 0 4px rgba(47, 176, 103, 0.12);
        }

        .sa-settings-status.is-testing .sa-settings-status-dot {
          background: #d29b24;
          box-shadow: 0 0 0 4px rgba(210, 155, 36, 0.12);
        }

        .sa-wide-btn {
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, #5f4500, #7a5b08);
          box-shadow: 0 14px 26px rgba(95, 69, 0, 0.18);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
        }

        .sa-wide-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 30px rgba(95, 69, 0, 0.22);
        }

        .sa-theme-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .sa-theme-btn {
          border: 1px solid rgba(124, 95, 63, 0.1);
          background: #fff;
          border-radius: 18px;
          padding: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 8px 20px rgba(72, 51, 30, 0.04);
        }

        .sa-theme-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(72, 51, 30, 0.09);
        }

        .sa-theme-btn.is-active {
          border-color: rgba(107, 78, 0, 0.22);
          background: linear-gradient(180deg, #fffdf9, #f5eee4);
          box-shadow: 0 16px 30px rgba(107, 78, 0, 0.11);
        }

        .sa-theme-preview {
          height: 52px;
          border-radius: 14px;
          margin-bottom: 10px;
          border: 1px solid rgba(124, 95, 63, 0.08);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .sa-theme-preview.warm span:nth-child(1) { background: #efe2d3; }
        .sa-theme-preview.warm span:nth-child(2) { background: #c8a98c; }
        .sa-theme-preview.warm span:nth-child(3) { background: #6d4f2f; }

        .sa-theme-preview.light span:nth-child(1) { background: #f5f7fb; }
        .sa-theme-preview.light span:nth-child(2) { background: #d8e0ea; }
        .sa-theme-preview.light span:nth-child(3) { background: #73839a; }

        .sa-theme-preview.dark span:nth-child(1) { background: #2a2d33; }
        .sa-theme-preview.dark span:nth-child(2) { background: #424750; }
        .sa-theme-preview.dark span:nth-child(3) { background: #9096a3; }

        .sa-theme-name {
          margin: 0 0 3px;
          font-size: 14px;
          font-weight: 800;
          color: #372b22;
          text-transform: capitalize;
        }

        .sa-theme-desc {
          margin: 0;
          font-size: 12px;
          color: #8d7b6d;
          line-height: 1.45;
        }

        .sa-note {
          margin-top: 4px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(107, 78, 0, 0.05);
          color: #877565;
          font-size: 13px;
          line-height: 1.65;
          border: 1px dashed rgba(107, 78, 0, 0.12);
        }

        @media (max-width: 1080px) {
          .sa-col-6,
          .sa-col-12 {
            grid-column: span 12;
          }

          .sa-split {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .sa-settings-page {
            padding: 22px 14px 48px;
          }

          .sa-settings-actions {
            width: 100%;
          }

          .sa-settings-btn,
          .sa-settings-saved {
            width: 100%;
            justify-content: center;
          }

          .sa-card {
            padding: 18px;
            border-radius: 20px;
          }

          .sa-card-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .sa-row {
            align-items: flex-start;
          }

          .sa-theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="sa-settings-page">
        <motion.div
          className="sa-settings-shell"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easing }}
        >
          <section className="sa-settings-hero">
            <div className="sa-settings-hero-left">
              <span className="sa-settings-badge">System Settings</span>
              <h1 className="sa-settings-title">Settings</h1>
              <p className="sa-settings-subtitle">
                Pengaturan aplikasi untuk notifikasi, sinkronisasi, dan tampilan.
                Semua fungsi tetap sama, hanya tampilannya dibuat lebih rapi,
                modern, dan nyaman dilihat.
              </p>
            </div>

            <div className="sa-settings-actions">
              <button
                type="button"
                className="sa-settings-btn sa-settings-btn-primary"
                onClick={handleSave}
              >
                Simpan
              </button>

              <button
                type="button"
                className="sa-settings-btn sa-settings-btn-secondary"
                onClick={() => window.location.reload()}
              >
                Reset
              </button>

              {saved && <div className="sa-settings-saved">Tersimpan ✓</div>}
            </div>
          </section>

          <section className="sa-settings-grid">
            <motion.div className="sa-col-6" {...sectionMotion}>
              <div className="sa-card">
                <div className="sa-card-head">
                  <div className="sa-card-title-wrap">
                    <h3 className="sa-card-title">Notifikasi</h3>
                    <p className="sa-card-desc">
                      Atur notifikasi penting yang ingin ditampilkan untuk admin.
                    </p>
                  </div>
                  <span className="sa-card-pill">Alerts</span>
                </div>

                <div className="sa-stack">
                  <div className="sa-row">
                    <div className="sa-row-main">
                      <p className="sa-row-title">Stok menipis</p>
                      <p className="sa-row-subtitle">
                        Tampil saat stok gudang atau toko melewati batas minimum.
                      </p>
                    </div>

                    <div className="sa-control">
                      <label className="sa-switch">
                        <input
                          type="checkbox"
                          checked={notifStock}
                          onChange={(e) => setNotifStock(e.target.checked)}
                        />
                        <span className="sa-slider" />
                      </label>
                    </div>
                  </div>

                  <div className="sa-row">
                    <div className="sa-row-main">
                      <p className="sa-row-title">Permintaan barang</p>
                      <p className="sa-row-subtitle">
                        Tampil saat toko mengirim request kebutuhan barang.
                      </p>
                    </div>

                    <div className="sa-control">
                      <label className="sa-switch">
                        <input
                          type="checkbox"
                          checked={notifRequests}
                          onChange={(e) => setNotifRequests(e.target.checked)}
                        />
                        <span className="sa-slider" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="sa-col-6" {...sectionMotion}>
              <div className="sa-card">
                <div className="sa-card-head">
                  <div className="sa-card-title-wrap">
                    <h3 className="sa-card-title">Sinkronisasi</h3>
                    <p className="sa-card-desc">
                      Kontrol data realtime dan interval sinkronisasi aplikasi.
                    </p>
                  </div>
                  <span className="sa-card-pill">Realtime</span>
                </div>

                <div className="sa-stack">
                  <div className="sa-row">
                    <div className="sa-row-main">
                      <p className="sa-row-title">Auto Sync</p>
                      <p className="sa-row-subtitle">
                        Sinkronisasi otomatis agar stok selalu update.
                      </p>
                    </div>

                    <div className="sa-control">
                      <label className="sa-switch">
                        <input
                          type="checkbox"
                          checked={autoSync}
                          onChange={(e) => setAutoSync(e.target.checked)}
                        />
                        <span className="sa-slider" />
                      </label>
                    </div>
                  </div>

                  <div className="sa-split">
                    <div className="sa-field">
                      <label htmlFor="syncInterval" className="sa-field-label">
                        Interval Sync
                      </label>
                      <p className="sa-help">berapa menit sekali (dummy)</p>
                      <select
                        id="syncInterval"
                        className="sa-select"
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(e.target.value)}
                        disabled={!autoSync}
                      >
                        <option value="1">1 menit</option>
                        <option value="5">5 menit</option>
                        <option value="10">10 menit</option>
                        <option value="30">30 menit</option>
                      </select>
                    </div>

                    <div className="sa-field">
                      <label className="sa-field-label">Status</label>
                      <p className="sa-help">contoh status koneksi realtime</p>
                      <div className={statusClass}>
                        <span className="sa-settings-status-dot" />
                        <span>{syncStatus}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="sa-wide-btn"
                    onClick={testRealtime}
                  >
                    Tes Realtime
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div className="sa-col-12" {...sectionMotion}>
              <div className="sa-card">
                <div className="sa-card-head">
                  <div className="sa-card-title-wrap">
                    <h3 className="sa-card-title">Tampilan</h3>
                    <p className="sa-card-desc">
                      Pilih tema dan atur kepadatan tampilan sesuai preferensi.
                    </p>
                  </div>
                  <span className="sa-card-pill">UI</span>
                </div>

                <div className="sa-stack">
                  <div className="sa-field">
                    <label className="sa-field-label">Theme</label>
                    <p className="sa-help">pilih mode tampilan (dummy)</p>

                    <div className="sa-theme-grid">
                      {["warm", "light", "dark"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`sa-theme-btn ${theme === t ? "is-active" : ""}`}
                          onClick={() => setTheme(t)}
                        >
                          <div className={`sa-theme-preview ${t}`}>
                            <span />
                            <span />
                            <span />
                          </div>
                          <p className="sa-theme-name">{t}</p>
                          <p className="sa-theme-desc">
                            {t === "warm" && "Nuansa hangat, lembut, dan natural."}
                            {t === "light" && "Tampilan cerah, bersih, dan ringan."}
                            {t === "dark" && "Mode gelap yang fokus dan elegan."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sa-row">
                    <div className="sa-row-main">
                      <p className="sa-row-title">Compact mode</p>
                      <p className="sa-row-subtitle">
                        Tampilan lebih rapat untuk layar kecil.
                      </p>
                    </div>

                    <div className="sa-control">
                      <label className="sa-switch">
                        <input
                          type="checkbox"
                          checked={compact}
                          onChange={(e) => setCompact(e.target.checked)}
                        />
                        <span className="sa-slider" />
                      </label>
                    </div>
                  </div>

                  <div className="sa-note">
                    * Ini dummy UI dulu. Nanti kamu bisa simpan ke database atau
                    localStorage.
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </>
  );
}