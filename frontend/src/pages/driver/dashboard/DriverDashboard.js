import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import "./DriverDashboard.css";
import { subscribeRequests, driverAcceptTask, subscribeDriverProfile } from "../../../services/wmsApi";

export default function DriverDashboard() {
  const [allReq, setAllReq] = useState([]);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubProfile = subscribeDriverProfile((data) => setProfile(data || {}));
    return () => {
      unsubReq();
      unsubProfile();
    };
  }, []);

  const readyTasks = useMemo(() => {
    return allReq.filter(r => r.status === "Siap Dikirim");
  }, [allReq]);

  const activeTask = useMemo(() => {
    return allReq.find(r => r.status === "Mengirim" && r.driverName === profile.name);
  }, [allReq, profile.name]);

  const historyTasks = useMemo(() => {
    return allReq.filter(r => r.status === "Selesai" && r.driverName === profile.name).slice(0, 5);
  }, [allReq, profile.name]);

  const handleAcceptTask = async (id) => {
    await driverAcceptTask(id, profile.name);
  };

  return (
    <div className="ddash">
      <header className="ddash__head">
        <h1 className="ddash__title">Halo, {profile.name || "Driver"}! 👋</h1>
        <p className="ddash__subtitle">
          {activeTask ? "Anda sedang melakukan pengiriman." : readyTasks.length > 0 ? `Ada ${readyTasks.length} tugas baru yang menunggu.` : "Tidak ada tugas baru saat ini."}
        </p>
      </header>

      <div className="ddash__grid">
        <div className="ddash__main">
          {/* ACTIVE TASK */}
          <AnimatePresence mode="wait">
            {activeTask ? (
              <motion.section 
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="ddash__active"
              >
                <h3 className="section-title">Tugas Aktif Sedang Berjalan</h3>
                <Card className="active-card" style={{ borderLeft: '4px solid #1890ff' }}>
                  <div className="active-card__header">
                    <span className="task-id">{activeTask.id}</span>
                    <span className="task-priority" style={{ background: '#e6f7ff', color: '#1890ff' }}>DALAM PENGIRIMAN</span>
                  </div>
                  <div className="active-card__route">
                    <div className="route-point">
                      <div className="point-icon origin">🏙</div>
                      <div className="point-info">
                        <span className="point-label">Dari</span>
                        <b className="point-name">{activeTask.toName || "Gudang"}</b>
                      </div>
                    </div>
                    <div className="route-line"></div>
                    <div className="route-point">
                      <div className="point-icon destination">📍</div>
                      <div className="point-info">
                        <span className="point-label">Ke</span>
                        <b className="point-name">{activeTask.fromName || "Toko"}</b>
                      </div>
                    </div>
                  </div>
                  <button className="btn-start-trip" onClick={() => window.location.href=`/driver/tracking/${activeTask.id}`}>
                    Pantau Navigasi & Maps 🗺️
                  </button>
                </Card>
              </motion.section>
            ) : readyTasks.length > 0 ? (
              <motion.section 
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="ddash__active"
              >
                <h3 className="section-title">Tugas Menunggu (Standby)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {readyTasks.map(task => (
                    <Card key={task.id} className="active-card">
                      <div className="active-card__header">
                        <span className="task-id">{task.id}</span>
                        <span className="task-priority" style={{ background: '#fff7e6', color: '#fa8c16' }}>SIAP PICKUP</span>
                      </div>
                      <div className="active-card__route">
                        <div className="route-point">
                          <b className="point-name">{task.toName}</b>
                          <span style={{ fontSize: '12px' }}>→</span>
                          <b className="point-name">{task.fromName}</b>
                        </div>
                      </div>
                      <div className="active-card__details" style={{ margin: '15px 0' }}>
                        <div className="detail-item">
                          <span>📦 Items</span>
                          <b>{task.items?.[0]?.qty || 0} Pcs</b>
                        </div>
                        <div className="detail-item">
                          <span>📝 Note</span>
                          <b style={{ fontSize: '11px' }}>{task.note || "-"}</b>
                        </div>
                      </div>
                      <button className="btn-start-trip" onClick={() => handleAcceptTask(task.id)}>
                        Ambil Tugas Sekarang ✅
                      </button>
                    </Card>
                  ))}
                </div>
              </motion.section>
            ) : (
              <section className="ddash__active">
                <h3 className="section-title">Tugas Aktif</h3>
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '15px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚛</div>
                  <p>Belum ada tugas baru. Silakan tunggu notifikasi.</p>
                </div>
              </section>
            )}
          </AnimatePresence>

          {/* PERFORMANCE STATS */}
          <div className="ddash__stats">
            {[
              { label: "Total Selesai", val: historyTasks.length, sub: "Bulan ini", icon: "🚚", color: "#1890ff" },
              { label: "Rating Driver", val: "4.9", sub: "Bintang", icon: "⭐", color: "#faad14" },
              { label: "Status Kerja", val: activeTask ? "SibuK" : "Standby", sub: "Live", icon: "⏱", color: activeTask ? "#fa8c16" : "#52c41a" },
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

        <aside className="ddash__sidebar">
          <Card className="history-widget">
            <div className="widget-header">
              <h3>Riwayat Terbaru</h3>
            </div>
            <div className="history-list">
              {historyTasks.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', padding: '20px' }}>Belum ada riwayat.</p>
              ) : historyTasks.map((t, i) => (
                <div key={i} className="history-item">
                  <div className="history-icon">✅</div>
                  <div className="history-info">
                    <b>{t.id}</b>
                    <span>{t.toName} → {t.fromName}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="driver-info-card">
            <div className="driver-profile-mini">
              <div className="driver-avatar-large">👤</div>
              <h4>{profile.name || "Driver"}</h4>
              <p>{profile.role || "Driver Utama"}</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
