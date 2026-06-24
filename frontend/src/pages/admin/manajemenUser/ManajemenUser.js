import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  subscribeBranches,
  subscribeBranchUsers,
  subscribeDriverProfile,
  deleteBranchUser,
  createBranchUser,
  transferBranchUser,
  deleteBranch,
  updateBranch,
} from "../../../services/wmsApi";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./ManajemenUser.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function LocationPicker({ latLng, setLatLng }) {
  useMapEvents({
    click(e) {
      setLatLng(e.latlng);
    },
  });
  return latLng ? <Marker position={latLng} /> : null;
}

function BranchDetailPanel({ branch, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  
  const [alamatLengkap, setAlamatLengkap] = useState(branch.alamatLengkap || "");
  const [lokasi, setLokasi] = useState(branch.location || "");
  const [jamOperasional, setJamOperasional] = useState(branch.jamOperasional || "");
  const [pemilik, setPemilik] = useState(branch.pemilik || "");
  const [kapasitas, setKapasitas] = useState(branch.kapasitas || "");
  const [latLng, setLatLng] = useState({ lat: branch.lat || -6.200000, lng: branch.lng || 106.816666 });

  const handleSave = () => {
    onSave(branch.id, {
      alamatLengkap,
      location: lokasi,
      jamOperasional,
      pemilik: branch.type === "toko" ? pemilik : undefined,
      kapasitas: branch.type === "gudang" ? kapasitas : undefined,
      lat: latLng.lat,
      lng: latLng.lng,
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="muser-branch-detail-view" style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '1.05rem', fontWeight: 600 }}>Detail Cabang</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                <strong>📍 Alamat:</strong> {branch.alamatLengkap || "-"} ({branch.location || "-"})
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                <strong>⏰ Jam Operasional:</strong> {branch.jamOperasional || "-"}
              </p>
              {branch.type === "gudang" && (
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                  <strong>📦 Kapasitas:</strong> {branch.kapasitas || "-"} Unit
                </p>
              )}
              {branch.type === "toko" && (
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                  <strong>👤 Pemilik:</strong> {branch.pemilik || "-"}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ✏️ Edit Detail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="muser-branch-detail-edit" style={{ padding: '16px 24px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '1.05rem', fontWeight: 600 }}>✏️ Edit Detail Cabang</h4>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#15803d', marginBottom: '6px', fontWeight: 600 }}>Alamat Lengkap</label>
          <input className="form-input" value={alamatLengkap} onChange={e => setAlamatLengkap(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #86efac' }} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#15803d', marginBottom: '6px', fontWeight: 600 }}>Kota/Lokasi</label>
          <input className="form-input" value={lokasi} onChange={e => setLokasi(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #86efac' }} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#15803d', marginBottom: '6px', fontWeight: 600 }}>Jam Operasional</label>
          <input className="form-input" value={jamOperasional} onChange={e => setJamOperasional(e.target.value.replace(/[^a-zA-Z0-9\s.,:-]/g, ""))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #86efac' }} />
        </div>
        {branch.type === "gudang" && (
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#15803d', marginBottom: '6px', fontWeight: 600 }}>Kapasitas (Unit)</label>
            <input type="text" className="form-input" value={kapasitas} onChange={e => setKapasitas(e.target.value.replace(/[^0-9]/g, ""))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #86efac' }} />
          </div>
        )}
        {branch.type === "toko" && (
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#15803d', marginBottom: '6px', fontWeight: 600 }}>Pemilik</label>
            <input className="form-input" value={pemilik} onChange={e => setPemilik(e.target.value.replace(/[^a-zA-Z\s]/g, ""))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #86efac' }} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#15803d', marginBottom: '8px', fontWeight: 600 }}>Pilih Titik Koordinat GPS</label>
        <p style={{ fontSize: "12px", color: "#166534", marginBottom: "8px", marginTop: "-4px" }}>
          Geser/klik pada peta untuk memperbarui titik alamat cabang.
        </p>
        <div style={{ height: "250px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid #86efac" }}>
          <MapContainer center={[latLng.lat, latLng.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; OSM'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker latLng={latLng} setLatLng={setLatLng} />
          </MapContainer>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button 
          onClick={() => { setIsEditing(false); }}
          style={{ padding: '8px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}
        >
          Batal
        </button>
        <button 
          onClick={handleSave}
          style={{ padding: '8px 20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
        >
          💾 Simpan Perubahan
        </button>
      </div>
    </div>
  );
}

export default function ManajemenUser() {
  const [activeTab, setActiveTab] = useState("Gudang");
  const [branches, setBranches] = useState([]);
  const [branchUsers, setBranchUsers] = useState([]);
  const [driverProfile, setDriverProfile] = useState({});
  const [expandedBranch, setExpandedBranch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Inline Add User form state
  const [showAddForm, setShowAddForm] = useState(null); // branchId or null
  const [addNama, setAddNama] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");

  // Transfer modal state
  const [transferUser, setTransferUser] = useState(null); // user object or null
  const [transferTargetBranch, setTransferTargetBranch] = useState("");

  // Delete Branch state
  const [branchToDelete, setBranchToDelete] = useState(null); // { id, name }
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const tabs = [
    { key: "Gudang", icon: "🏢", label: "Cabang Gudang" },
    { key: "Toko", icon: "🏪", label: "Cabang Toko" },
    { key: "Driver", icon: "🚚", label: "Driver" },
  ];

  useEffect(() => {
    const unsubs = [
      subscribeBranches(setBranches),
      subscribeBranchUsers(setBranchUsers),
      subscribeDriverProfile(setDriverProfile),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const resetAddForm = () => {
    setAddNama("");
    setAddUsername("");
    setAddPassword("");
    setAddEmail("");
    setAddPhone("");
  };

  const handleDeleteUser = (userId, userName) => {
    if (!window.confirm(`Hapus user "${userName}"?`)) return;
    deleteBranchUser(userId);
    showToast(`User "${userName}" telah dihapus.`);
  };

  const handleAddUserInline = (e, branch) => {
    e.preventDefault();
    if (!addNama || !addUsername || !addPassword) return alert("Mohon lengkapi Nama, Username, dan Password.");

    createBranchUser({
      branchId: branch.id,
      branchName: branch.name,
      branchType: branch.type,
      nama: addNama,
      username: addUsername,
      password: addPassword,
      email: addEmail,
      phone: addPhone,
    });

    showToast(`User "${addNama}" berhasil ditambahkan ke ${branch.name}!`);
    resetAddForm();
    setShowAddForm(null);
  };

  const handleTransferUser = () => {
    if (!transferUser || !transferTargetBranch) return;
    const targetBranch = branches.find((b) => b.id === transferTargetBranch);
    if (!targetBranch) return;

    transferBranchUser(transferUser.id, targetBranch.id, targetBranch.name, targetBranch.type);
    showToast(`User "${transferUser.nama}" dipindahkan ke ${targetBranch.name}!`);
    setTransferUser(null);
    setTransferTargetBranch("");
  };

  const handleDeleteBranch = (e) => {
    e.preventDefault();
    if (deleteConfirmInput !== branchToDelete?.id) {
      showToast("ID Cabang tidak cocok! Penghapusan dibatalkan.");
      return;
    }
    deleteBranch(branchToDelete.id);
    showToast(`Cabang "${branchToDelete.name}" beserta seluruh usernya telah dihapus.`);
    setBranchToDelete(null);
    setDeleteConfirmInput("");
  };

  const handleUpdateBranch = async (id, payload) => {
    updateBranch(id, payload);
    showToast("Detail cabang berhasil diperbarui!");
  };

  // Filter branches by type
  const filteredBranches = branches.filter(
    (b) => b.type === activeTab.toLowerCase()
  );

  // Get users for a specific branch
  const getUsersForBranch = (branchId) =>
    branchUsers.filter((u) => u.branchId === branchId && u.role !== "driver");

  // Get available branches for transfer (exclude current branch)
  const getTransferTargets = (currentBranchId) =>
    branches.filter((b) => b.id !== currentBranchId && (b.type === "gudang" || b.type === "toko"));

  // Search filter
  const applySearch = (items, fields) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      fields.some((f) => (item[f] || "").toLowerCase().includes(q))
    );
  };

  const filteredBranchesSearched = applySearch(filteredBranches, [
    "name",
    "location",
    "id",
  ]);

  // Stats
  const gudangCount = branches.filter((b) => b.type === "gudang").length;
  const tokoCount = branches.filter((b) => b.type === "toko").length;
  const totalUsers = branchUsers.length;
  const drivers = branchUsers.filter(u => u.role === "driver");

  return (
    <div className="muser-page">
      <header className="muser-header">
        <div className="muser-header-text">
          <h1 className="muser-title">Manajemen User</h1>
          <p className="muser-subtitle">
            Kelola user dan akun yang terdaftar pada setiap cabang gudang, toko,
            dan driver.
          </p>
        </div>
      </header>

      {/* STATS ROW */}
      <div className="muser-stats">
        <div className="muser-stat-card">
          <div className="muser-stat-icon" style={{ background: "#eff6ff" }}>
            🏢
          </div>
          <div className="muser-stat-info">
            <span className="muser-stat-value">{gudangCount}</span>
            <span className="muser-stat-label">Cabang Gudang</span>
          </div>
        </div>
        <div className="muser-stat-card">
          <div className="muser-stat-icon" style={{ background: "#fef3c7" }}>
            🏪
          </div>
          <div className="muser-stat-info">
            <span className="muser-stat-value">{tokoCount}</span>
            <span className="muser-stat-label">Cabang Toko</span>
          </div>
        </div>
        <div className="muser-stat-card">
          <div className="muser-stat-icon" style={{ background: "#f0fdf4" }}>
            👥
          </div>
          <div className="muser-stat-info">
            <span className="muser-stat-value">{totalUsers}</span>
            <span className="muser-stat-label">Total User</span>
          </div>
        </div>
        <div className="muser-stat-card">
          <div className="muser-stat-icon" style={{ background: "#fef2f2" }}>
            🚚
          </div>
          <div className="muser-stat-info">
            <span className="muser-stat-value">
              {drivers.length}
            </span>
            <span className="muser-stat-label">Driver</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="muser-tabs-row">
        <div className="muser-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`muser-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(t.key);
                setExpandedBranch(null);
                setSearchQuery("");
                setShowAddForm(null);
              }}
            >
              <span className="muser-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        {activeTab !== "Driver" && (
          <div className="muser-search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Cari cabang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="muser-content"
        >
          {/* ====== GUDANG / TOKO TAB ====== */}
          {(activeTab === "Gudang" || activeTab === "Toko") && (
            <>
              {filteredBranchesSearched.length === 0 ? (
                <div className="muser-empty">
                  <div className="muser-empty-icon">
                    {activeTab === "Gudang" ? "🏢" : "🏪"}
                  </div>
                  <h3>Belum ada cabang {activeTab.toLowerCase()}</h3>
                  <p>
                    Daftarkan cabang baru melalui halaman Pendaftaran Entitas.
                  </p>
                </div>
              ) : (
                <div className="muser-branch-list">
                  {filteredBranchesSearched.map((branch) => {
                    const users = getUsersForBranch(branch.id);
                    const isExpanded = expandedBranch === branch.id;

                    return (
                      <div
                        key={branch.id}
                        className={`muser-branch-card ${isExpanded ? "expanded" : ""}`}
                      >
                        <div
                          className="muser-branch-header"
                          onClick={() => {
                            setExpandedBranch(isExpanded ? null : branch.id);
                            if (isExpanded) {
                              setShowAddForm(null);
                              resetAddForm();
                            }
                          }}
                        >
                          <div className="muser-branch-left">
                            <div className="muser-branch-icon-wrap">
                              {activeTab === "Gudang" ? "🏢" : "🏪"}
                            </div>
                            <div className="muser-branch-info">
                              <span className="muser-branch-name">
                                {branch.name}
                              </span>
                              <span className="muser-branch-loc">
                                📍 {branch.location || "—"}
                              </span>
                            </div>
                          </div>
                          <div className="muser-branch-right">
                            <span className="muser-branch-badge">
                              {branch.id}
                            </span>
                            <span className="muser-branch-users-count">
                              👥 {users.length} user
                            </span>
                            <button
                              className="muser-btn-delete-branch"
                              title="Hapus Cabang"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBranchToDelete(branch);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                marginLeft: '8px'
                              }}
                            >
                              🗑️
                            </button>
                            <span
                              className={`muser-branch-chevron ${isExpanded ? "open" : ""}`}
                            >
                              ▼
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="muser-branch-body"
                            >
                              <BranchDetailPanel branch={branch} onSave={handleUpdateBranch} />
                              {/* USER TABLE */}
                              {users.length === 0 ? (
                                <div className="muser-no-users">
                                  <span>📭</span>
                                  <p>Belum ada user terdaftar pada cabang ini.</p>
                                </div>
                              ) : (
                                <div className="muser-users-table-wrap">
                                  <table className="muser-users-table">
                                    <thead>
                                      <tr>
                                        <th>No</th>
                                        <th>Nama</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Telepon</th>
                                        <th>Terdaftar</th>
                                        <th>Aksi</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {users.map((u, i) => (
                                        <tr key={u.id}>
                                          <td>{i + 1}</td>
                                          <td>
                                            <strong>{u.nama}</strong>
                                          </td>
                                          <td>
                                            <code>{u.username}</code>
                                          </td>
                                          <td>{u.email || "—"}</td>
                                          <td>{u.phone || "—"}</td>
                                          <td>{u.createdAt || "—"}</td>
                                          <td>
                                            <div className="muser-action-btns">
                                              <button
                                                className="muser-btn-transfer"
                                                title="Pindahkan ke cabang lain"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setTransferUser(u);
                                                  setTransferTargetBranch("");
                                                }}
                                              >
                                                🔀
                                              </button>
                                              <button
                                                className="muser-btn-delete"
                                                title="Hapus user"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteUser(u.id, u.nama);
                                                }}
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* INLINE ADD USER */}
                              <div className="muser-add-user-section">
                                {showAddForm === branch.id ? (
                                  <motion.form
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="muser-add-form"
                                    onSubmit={(e) => handleAddUserInline(e, branch)}
                                  >
                                    <div className="muser-add-form-title">
                                      <span>👤</span> Tambah User Baru ke <strong>{branch.name}</strong>
                                    </div>
                                    <div className="muser-add-form-grid">
                                      <div className="muser-add-field">
                                        <label>Nama Lengkap</label>
                                        <input
                                          type="text"
                                          placeholder="Contoh: Ahmad Fauzi"
                                          value={addNama}
                                          onChange={(e) => setAddNama(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                        />
                                      </div>
                                      <div className="muser-add-field">
                                        <label>Username</label>
                                        <input
                                          type="text"
                                          placeholder="Contoh: ahmad_01"
                                          value={addUsername}
                                          onChange={(e) => setAddUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                                        />
                                      </div>
                                      <div className="muser-add-field">
                                        <label>Password</label>
                                        <input
                                          type="password"
                                          placeholder="Kata sandi"
                                          value={addPassword}
                                          onChange={(e) => setAddPassword(e.target.value)}
                                        />
                                      </div>
                                      <div className="muser-add-field">
                                        <label>Email</label>
                                        <input
                                          type="email"
                                          placeholder="Contoh: ahmad@email.com"
                                          value={addEmail}
                                          onChange={(e) => setAddEmail(e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""))}
                                        />
                                      </div>
                                      <div className="muser-add-field">
                                        <label>No. Telepon</label>
                                        <input
                                          type="tel"
                                          placeholder="Contoh: 081234567890"
                                          value={addPhone}
                                          onChange={(e) => setAddPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                        />
                                      </div>
                                    </div>
                                    <div className="muser-add-form-actions">
                                      <button
                                        type="button"
                                        className="muser-add-cancel"
                                        onClick={() => {
                                          setShowAddForm(null);
                                          resetAddForm();
                                        }}
                                      >
                                        Batal
                                      </button>
                                      <button type="submit" className="muser-add-submit">
                                        ＋ Tambah User
                                      </button>
                                    </div>
                                  </motion.form>
                                ) : (
                                  <button
                                    className="muser-btn-add-user"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowAddForm(branch.id);
                                      resetAddForm();
                                    }}
                                  >
                                    <span>＋</span> Tambah User ke {branch.name}
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ====== DRIVER TAB ====== */}
          {activeTab === "Driver" && (
            <>
              {drivers.length === 0 ? (
                <div className="muser-empty">
                  <div className="muser-empty-icon">🚚</div>
                  <h3>Belum ada driver terdaftar</h3>
                  <p>Daftarkan driver baru melalui halaman Pendaftaran Entitas.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {drivers.map(driver => (
                    <div key={driver.id} className="muser-driver-card" style={{ maxWidth: "100%", margin: 0 }}>
                      <div className="muser-driver-header">
                        <div className="muser-driver-avatar">
                          {(driver.nama || "D")[0].toUpperCase()}
                        </div>
                        <div className="muser-driver-info">
                          <span className="muser-driver-name">{driver.nama}</span>
                          <span className="muser-driver-role">Driver - {driver.branchName}</span>
                        </div>
                        <div className={`muser-driver-status ${driver.status === "online" ? "online" : "offline"}`}>
                          <span className="muser-driver-status-dot" />
                          {driver.status || "Offline"}
                        </div>
                      </div>

                      <div className="muser-driver-details">
                        <div className="muser-driver-detail-item">
                          <span className="muser-detail-label">📧 Email</span>
                          <span className="muser-detail-value">{driver.email || "—"}</span>
                        </div>
                        <div className="muser-driver-detail-item">
                          <span className="muser-detail-label">📱 Telepon</span>
                          <span className="muser-detail-value">{driver.phone || "—"}</span>
                        </div>
                        <div className="muser-driver-detail-item">
                          <span className="muser-detail-label">🚗 Kendaraan</span>
                          <span className="muser-detail-value">{driver.vehicle || "—"}</span>
                        </div>
                        <div className="muser-driver-detail-item">
                          <span className="muser-detail-label">📅 Bergabung</span>
                          <span className="muser-detail-value">{driver.joinedAt ? new Date(driver.joinedAt).toLocaleDateString("id-ID") : "—"}</span>
                        </div>
                      </div>
                      <div className="muser-driver-footer">
                        <button 
                          className="muser-btn-delete-driver" 
                          onClick={() => handleDeleteUser(driver.id, driver.nama)}
                        >
                          <span>🗑️</span> Hapus Driver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ====== TRANSFER MODAL ====== */}
      <AnimatePresence>
        {transferUser && (
          <div
            className="muser-modal-overlay"
            onClick={() => setTransferUser(null)}
          >
            <motion.div
              className="muser-transfer-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="muser-transfer-header">
                <div className="muser-transfer-icon">🔀</div>
                <h3>Pindahkan User</h3>
                <p>
                  Pindahkan <strong>{transferUser.nama}</strong> dari{" "}
                  <strong>{transferUser.branchName}</strong> ke cabang lain.
                </p>
              </div>

              <div className="muser-transfer-user-info">
                <div className="muser-transfer-user-avatar">
                  {(transferUser.nama || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div className="muser-transfer-user-name">{transferUser.nama}</div>
                  <div className="muser-transfer-user-username">@{transferUser.username}</div>
                </div>
              </div>

              <div className="muser-transfer-body">
                <label className="muser-transfer-label">Pindahkan ke cabang:</label>
                <select
                  className="muser-transfer-select"
                  value={transferTargetBranch}
                  onChange={(e) => setTransferTargetBranch(e.target.value)}
                >
                  <option value="">— Pilih cabang tujuan —</option>
                  {getTransferTargets(transferUser.branchId).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.type === "gudang" ? "🏢" : "🏪"} {b.name} ({b.location || b.id})
                    </option>
                  ))}
                </select>

                {transferTargetBranch && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="muser-transfer-preview"
                  >
                    <div className="muser-transfer-flow">
                      <div className="muser-transfer-from">
                        <span>{transferUser.branchType === "gudang" ? "🏢" : "🏪"}</span>
                        <span>{transferUser.branchName}</span>
                      </div>
                      <div className="muser-transfer-arrow">→</div>
                      <div className="muser-transfer-to">
                        <span>
                          {branches.find((b) => b.id === transferTargetBranch)?.type === "gudang"
                            ? "🏢"
                            : "🏪"}
                        </span>
                        <span>
                          {branches.find((b) => b.id === transferTargetBranch)?.name}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="muser-transfer-actions">
                <button
                  className="muser-transfer-cancel"
                  onClick={() => setTransferUser(null)}
                >
                  Batal
                </button>
                <button
                  className="muser-transfer-confirm"
                  disabled={!transferTargetBranch}
                  onClick={handleTransferUser}
                >
                  🔀 Pindahkan User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST */}

      {/* Delete Branch Modal */}
      <AnimatePresence>
        {branchToDelete && (
          <div className="muser-modal-overlay">
            <motion.div
              className="muser-transfer-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>⚠️ Hapus Cabang</h3>
              <p style={{ marginBottom: '16px', lineHeight: '1.5', color: '#334155' }}>
                Apakah Anda yakin ingin menghapus <strong>{branchToDelete.name}</strong>?
                <br /><br />
                Tindakan ini akan <strong>menghapus seluruh user</strong> yang terkait dengan cabang ini dan data tidak dapat dikembalikan!
              </p>
              
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: '#991b1b', fontWeight: '500' }}>
                  Untuk mengkonfirmasi, ketikkan ID Cabang <strong>{branchToDelete.id}</strong> di bawah ini:
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', borderColor: '#fca5a5', padding: '10px 14px', borderRadius: '8px' }}
                  placeholder={`Ketik ${branchToDelete.id}`}
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                />
              </div>

              <div className="muser-transfer-actions">
                <button
                  className="muser-transfer-cancel"
                  onClick={() => {
                    setBranchToDelete(null);
                    setDeleteConfirmInput("");
                  }}
                >
                  Batal
                </button>
                <button
                  className="muser-transfer-confirm"
                  style={{ background: deleteConfirmInput === branchToDelete.id ? '#ef4444' : '#fca5a5', transition: 'background 0.2s' }}
                  disabled={deleteConfirmInput !== branchToDelete.id}
                  onClick={handleDeleteBranch}
                >
                  🗑️ Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="muser-toast"
          >
            <span>✅</span> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
