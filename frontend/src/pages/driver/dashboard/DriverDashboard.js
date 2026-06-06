import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import "./DriverDashboard.css";
import {
  subscribeRequests,
  driverAcceptTask,
  subscribeDriverProfile,
  driverUploadBuktiSiapKirim,
} from "../../../services/wmsApi";

export default function DriverDashboard() {
  const [allReq, setAllReq]     = useState([]);
  const [profile, setProfile]   = useState({});
  const [resiFile, setResiFile] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const resiInputRef = useRef(null);
  const fotoInputRef = useRef(null);

  useEffect(() => {
    const unsubReq     = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubProfile = subscribeDriverProfile((data) => setProfile(data || {}));
    return () => { unsubReq(); unsubProfile(); };
  }, []);

  /* ── Task state priorities ── */
  const activeTask = useMemo(() =>
    allReq.find(r =>
      (r.status === "Mengirim" || r.status === "Diterima Toko") &&
      r.driverName === profile.name
    ), [allReq, profile.name]);

  const pickupTask = useMemo(() =>
    allReq.find(r => r.status === "Pickup" && r.driverName === profile.name),
    [allReq, profile.name]);

  const readyTasks = useMemo(() => {
    if (activeTask || pickupTask) return [];
    return allReq.filter(r => r.status === "Siap Dikirim");
  }, [allReq, activeTask, pickupTask]);

  const historyTasks = useMemo(() =>
    allReq
      .filter(r => r.status === "Selesai" && r.driverName === profile.name)
      .slice(0, 5),
    [allReq, profile.name]);

  const isBusy = !!(activeTask || pickupTask);

  /* ── Handlers ── */
  const handleAcceptTask = async (id) => {
    await driverAcceptTask(id, profile.name);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === "resi") setResiFile(ev.target.result);
      else setFotoFile(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSiapMengirim = async () => {
    if (!resiFile || !fotoFile || !pickupTask) return;
    setUploading(true);
    await driverUploadBuktiSiapKirim(pickupTask.id, profile.name, {
      resi: resiFile,
      foto: fotoFile,
    });
    setUploading(false);
    window.location.href = "/driver/tracking";
  };

  /* ── Render helpers ── */
  const RouteCard = ({ task }) => (
    <div className="active-card__route">
      <div className="route-point">
        <div className="point-icon origin">🏙</div>
        <div className="point-info">
          <span className="point-label">Dari</span>
          <b className="point-name">{task.toName || "Gudang"}</b>
        </div>
      </div>
      <div className="route-line" />
      <div className="route-point">
        <div className="point-icon destination">📍</div>
        <div className="point-info">
          <span className="point-label">Ke</span>
          <b className="point-name">{task.fromName || "Toko"}</b>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ddash">
      {/* ── Header ── */}
      <header className="ddash__head">
        <h1 className="ddash__title">Halo, {profile.name || "Driver"}! 👋</h1>
        <p className="ddash__subtitle">
          {activeTask
            ? activeTask.status === "Diterima Toko"
              ? "Toko telah menerima barang. Segera selesaikan pengiriman di halaman tracking."
              : "Anda sedang melakukan pengiriman aktif."
            : pickupTask
            ? "Upload bukti resi & foto barang sebelum memulai pengiriman."
            : readyTasks.length > 0
            ? `Ada ${readyTasks.length} tugas baru yang menunggu Anda.`
            : "Tidak ada tugas baru saat ini. Tunggu notifikasi."}
        </p>
      </header>

      <div className="ddash__grid">
        <div className="ddash__main">

          {/* ══════════════════════════════
              SECTION 1: TASK AREA
          ══════════════════════════════ */}
          <AnimatePresence mode="wait">

            {/* 1a. Tugas Aktif (Mengirim / Diterima Toko) */}
            {activeTask ? (
              <motion.section
                key="active"
                className="ddash__active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="section-title">🚚 Tugas Aktif Sedang Berjalan</h3>
                <Card
                  className="active-card"
                  style={{
                    borderLeft: `4px solid ${activeTask.status === "Diterima Toko" ? "#52c41a" : "#1890ff"}`,
                  }}
                >
                  <div className="active-card__header">
                    <span className="task-id">{activeTask.id}</span>
                    <span
                      className="task-priority"
                      style={{
                        background: activeTask.status === "Diterima Toko" ? "#f6ffed" : "#e6f7ff",
                        color:      activeTask.status === "Diterima Toko" ? "#52c41a" : "#1890ff",
                      }}
                    >
                      {activeTask.status === "Diterima Toko" ? "✅ DITERIMA TOKO" : "🔵 DALAM PENGIRIMAN"}
                    </span>
                  </div>

                  <RouteCard task={activeTask} />

                  {activeTask.status === "Diterima Toko" && (
                    <div className="received-banner">
                      ✅ Toko telah mengkonfirmasi penerimaan barang. Pergi ke halaman tracking untuk menyelesaikan pengiriman.
                    </div>
                  )}

                  <button
                    className="btn-start-trip"
                    onClick={() => window.location.href = "/driver/tracking"}
                  >
                    {activeTask.status === "Diterima Toko"
                      ? "Selesaikan Pengiriman 🏁"
                      : "Pantau Navigasi & Maps 🗺️"}
                  </button>
                </Card>
              </motion.section>

            ) : pickupTask ? (
              /* 1b. Pickup — upload bukti barang */
              <motion.section
                key="pickup"
                className="ddash__active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="section-title">📦 Upload Bukti Barang</h3>
                <Card className="active-card upload-card">
                  <div className="active-card__header">
                    <span className="task-id">{pickupTask.id}</span>
                    <span className="task-priority" style={{ background: "#fff7e6", color: "#fa8c16" }}>
                      🟠 MENUNGGU BUKTI
                    </span>
                  </div>

                  <RouteCard task={pickupTask} />

                  <div className="upload-section">
                    <p className="upload-instruction">
                      📋 Upload foto <strong>resi pengiriman</strong> dan <strong>foto barang</strong> yang sesuai sebelum memulai pengiriman.
                    </p>

                    <div className="upload-grid">
                      {/* Resi */}
                      <div
                        className={`upload-item ${resiFile ? "uploaded" : ""}`}
                        onClick={() => resiInputRef.current.click()}
                      >
                        <input
                          ref={resiInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "resi")}
                          style={{ display: "none" }}
                        />
                        {resiFile ? (
                          <div className="upload-preview">
                            <img src={resiFile} alt="Resi" />
                            <div className="upload-overlay">✅ Ganti Foto</div>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <span className="upload-placeholder__icon">🧾</span>
                            <p>Foto Resi</p>
                            <small>Klik untuk upload</small>
                          </div>
                        )}
                        <div className="upload-label">
                          {resiFile ? "✅ Resi diunggah" : "Foto Resi *"}
                        </div>
                      </div>

                      {/* Foto Barang */}
                      <div
                        className={`upload-item ${fotoFile ? "uploaded" : ""}`}
                        onClick={() => fotoInputRef.current.click()}
                      >
                        <input
                          ref={fotoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "foto")}
                          style={{ display: "none" }}
                        />
                        {fotoFile ? (
                          <div className="upload-preview">
                            <img src={fotoFile} alt="Barang" />
                            <div className="upload-overlay">✅ Ganti Foto</div>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <span className="upload-placeholder__icon">📦</span>
                            <p>Foto Barang</p>
                            <small>Klik untuk upload</small>
                          </div>
                        )}
                        <div className="upload-label">
                          {fotoFile ? "✅ Foto diunggah" : "Foto Barang *"}
                        </div>
                      </div>
                    </div>

                    <button
                      className={`btn-start-trip ${(!resiFile || !fotoFile) ? "btn-muted" : ""}`}
                      disabled={!resiFile || !fotoFile || uploading}
                      onClick={handleSiapMengirim}
                    >
                      {uploading
                        ? "⏳ Memproses..."
                        : !resiFile || !fotoFile
                        ? "Upload kedua foto terlebih dahulu"
                        : "Siap Mengirim 🚚"}
                    </button>
                  </div>
                </Card>
              </motion.section>

            ) : readyTasks.length > 0 ? (
              /* 1c. Notifikasi tugas baru (Siap Dikirim) */
              <motion.section
                key="ready"
                className="ddash__active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="section-title">🔔 Notifikasi Tugas Baru</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {readyTasks.map((task) => (
                    <Card key={task.id} className="active-card notif-card">
                      <div className="notif-pulse-dot" />
                      <div className="active-card__header">
                        <span className="task-id">{task.id}</span>
                        <span className="task-priority" style={{ background: "#fff7e6", color: "#fa8c16" }}>
                          SIAP PICKUP
                        </span>
                      </div>
                      <RouteCard task={task} />
                      <div className="active-card__details" style={{ margin: "15px 0" }}>
                        <div className="detail-item">
                          <span>📦 Items</span>
                          <b>{task.items?.[0]?.qty || 0} Pcs</b>
                        </div>
                        <div className="detail-item">
                          <span>📝 Catatan</span>
                          <b style={{ fontSize: "11px" }}>{task.note || "—"}</b>
                        </div>
                      </div>
                      <button
                        className="btn-start-trip"
                        onClick={() => handleAcceptTask(task.id)}
                      >
                        Ambil Tugas Sekarang ✅
                      </button>
                    </Card>
                  ))}
                </div>
              </motion.section>

            ) : (
              /* 1d. Empty state */
              <section className="ddash__active">
                <h3 className="section-title">Tugas Aktif</h3>
                <div className="empty-task">
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚛</div>
                  <p>Belum ada tugas baru. Silakan tunggu notifikasi dari gudang.</p>
                </div>
              </section>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════
              SECTION 2: RIWAYAT TERBARU
              (dipindah ke bawah task section)
          ══════════════════════════════ */}
          <section className="ddash__history-section">
            <div className="section-header-row">
              <h3 className="section-title" style={{ marginBottom: 0 }}>📋 Riwayat Terbaru</h3>
              <a href="/driver/history" className="section-link">Lihat Semua →</a>
            </div>
            <Card className="history-widget-main">
              {historyTasks.length === 0 ? (
                <div className="history-empty">
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
                  <p>Belum ada riwayat pengiriman selesai.</p>
                </div>
              ) : (
                <div className="history-list-main">
                  {historyTasks.map((t, i) => (
                    <div key={i} className="history-item-main">
                      <div className="history-icon-main">✅</div>
                      <div className="history-info-main">
                        <b>{t.id}</b>
                        <span>{t.toName} → {t.fromName}</span>
                      </div>
                      <span className="history-badge-done">Selesai</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* ══════════════════════════════
              SECTION 3: STATS
          ══════════════════════════════ */}
          <div className="ddash__stats">
            {[
              { label: "Total Selesai", val: historyTasks.length, icon: "🚚", color: "#1890ff" },
              { label: "Rating Driver", val: "4.9 ⭐", icon: "⭐", color: "#faad14" },
              { label: "Status Kerja", val: isBusy ? "Sibuk" : "Standby", icon: "⏱", color: isBusy ? "#fa8c16" : "#52c41a" },
            ].map((s, i) => (
              <Card key={i} className="mini-stat">
                <span className="mini-stat__icon" style={{ color: s.color }}>{s.icon}</span>
                <div className="mini-stat__info">
                  <span className="mini-stat__label">{s.label}</span>
                  <h4 className="mini-stat__val">{s.val}</h4>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Sidebar: Profile only ── */}
        <aside className="ddash__sidebar">
          <Card className="driver-info-card">
            <div className="driver-profile-mini">
              <div className="driver-avatar-large">👤</div>
              <h4>{profile.name || "Driver"}</h4>
              <p>{profile.role || "Driver Utama"}</p>
              <div
                className="status-dot-badge"
                style={{ background: isBusy ? "#fa8c16" : "#52c41a" }}
              >
                {isBusy ? "🔴 Sibuk" : "🟢 Standby"}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
