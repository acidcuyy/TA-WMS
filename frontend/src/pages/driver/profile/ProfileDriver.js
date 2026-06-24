import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeDriverProfile, updateDriverProfile } from "../../../services/wmsApi";
import "./ProfileDriver.css";

export default function ProfileDriver() {
  const [profile, setProfile] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const unsub = subscribeDriverProfile((data) => {
      setProfile(data || {});
      setFormData(data || {});
    });
    return () => unsub();
  }, []);

  const handleUpdate = async () => {
    await updateDriverProfile(formData);
    setShowEdit(false);
  };

  const infoItems = [
    { label: "Nama Lengkap", value: profile.name, icon: "👤" },
    { label: "Email", value: profile.email, icon: "📧" },
    { label: "No. Telepon", value: profile.phone, icon: "📞" },
    { label: "Kendaraan", value: profile.vehicle, icon: "🚛" },
    { label: "Role", value: profile.role, icon: "🛡️" },
    { label: "Terakhir Login", value: profile.lastLogin, icon: "🕒" },
    { label: "Bergabung Sejak", value: profile.joinedAt, icon: "📅" },
  ];

  return (
    <div className="p-driver">
      <header className="p-driver__header">
        <div className="p-driver__title-group">
          <h1>Profil Driver</h1>
          <p>Kelola informasi akun, identitas kendaraan, dan pengaturan profil kurir.</p>
        </div>
        <div className="p-driver__actions">
          <button className="btn-edit-profile" onClick={() => setShowEdit(true)}>Edit Profil</button>
        </div>
      </header>

      <div className="p-driver__grid">
        <aside className="p-driver__sidebar">
          <Card className="p-driver__profile-card">
            <div className="p-driver__avatar-large">👤</div>
            <h2>{profile.name}</h2>
            <span className="p-driver__status-badge">● {profile.status}</span>
            <div className="p-driver__profile-meta">
              <span>{profile.role}</span>
              <span>{profile.email}</span>
            </div>
          </Card>

          <Card className="p-driver__vehicle-card">
            <h3>Unit Kendaraan</h3>
            <div className="p-driver__vehicle-info">
              <div className="vehicle-icon">🚛</div>
              <div className="vehicle-text">
                <b>{profile.vehicle}</b>
                <span>Logistik Internal</span>
              </div>
            </div>
          </Card>
        </aside>

        <main className="p-driver__main">
          <Card className="p-driver__details-card">
            <h3>Data Akun</h3>
            <div className="p-driver__info-list">
              {infoItems.map((item, idx) => (
                <div key={idx} className="p-driver__info-item">
                  <div className="info-icon">{item.icon}</div>
                  <div className="info-content">
                    <label>{item.label}</label>
                    <p>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEdit && (
          <div className="mgAdmin__modalOverlay" onClick={() => setShowEdit(false)}>
            <motion.div 
              className="mgAdmin__modal" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className="mgAdmin__modalHead">
                <h3><span>📝</span> Edit Profil Driver</h3>
                <button className="mgAdmin__modalClose" onClick={() => setShowEdit(false)}>✕</button>
              </div>
              <div className="mgAdmin__modalBody">
                <div className="mgAdmin__formGroup">
                  <label className="mgAdmin__formLabel">Nama Lengkap</label>
                  <input 
                    className="mgAdmin__inputField" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                  />
                </div>
                <div className="mgAdmin__formGroup">
                  <label className="mgAdmin__formLabel">Email</label>
                  <input 
                    className="mgAdmin__inputField" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value.replace(/[^a-zA-Z0-9@._-]/g, "") })}
                  />
                </div>
                <div className="mgAdmin__formGroup">
                  <label className="mgAdmin__formLabel">No. Telepon</label>
                  <input 
                    className="mgAdmin__inputField" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                </div>
                <div className="mgAdmin__formGroup">
                  <label className="mgAdmin__formLabel">Kendaraan</label>
                  <input 
                    className="mgAdmin__inputField" 
                    value={formData.vehicle}
                    onChange={e => setFormData({ ...formData, vehicle: e.target.value.replace(/[^a-zA-Z0-9\s-]/g, "") })}
                  />
                </div>
              </div>
              <div className="mgAdmin__modalFooter">
                <button className="mgAdmin__btnAction mgAdmin__btnAction--cancel" onClick={() => setShowEdit(false)}>Batal</button>
                <button className="mgAdmin__btnAction mgAdmin__btnAction--save" onClick={handleUpdate}>Update Profil</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
