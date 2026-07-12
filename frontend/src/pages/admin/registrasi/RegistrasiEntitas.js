import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBranchAccount, updateDriverProfile, createBranchUser, subscribeBranches } from "../../../services/wmsApi";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./RegistrasiEntitas.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function LocationPicker({ latLng, setLatLng, setAlamatLengkap }) {
  const map = useMapEvents({
    async click(e) {
      setLatLng(e.latlng);
      if (setAlamatLengkap) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setAlamatLengkap(data.display_name);
            }
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        }
      }
    },
  });

  React.useEffect(() => {
    if (latLng && map) {
      map.setView([latLng.lat, latLng.lng], map.getZoom());
    }
  }, [latLng, map]);

  return latLng ? <Marker position={latLng} /> : null;
}

export default function RegistrasiEntitas() {
  const [activeTab, setActiveTab] = useState("Gudang");
  const [toastMsg, setToastMsg] = useState("");
  const [userFormError, setUserFormError] = useState("");   // error di step 2 user form
  const [userEmailError, setUserEmailError] = useState(""); // email error di step 2
  const [driverFormError, setDriverFormError] = useState(""); // error di driver form
  const [driverEmailError, setDriverEmailError] = useState(""); // email error di driver
  const [branchFormError, setBranchFormError] = useState(""); // error di step 1 branch form

  // Multi-step state (for Gudang & Toko)
  const [currentStep, setCurrentStep] = useState(1);
  const [registeredBranch, setRegisteredBranch] = useState(null); // { id, name, type }
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    return subscribeBranches(setBranches);
  }, []);



  const tabs = ["Gudang", "Toko", "Driver"];

  // Form States — Branch
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Debounce logic for Address Search
  React.useEffect(() => {
    if (alamatLengkap.length < 4) {
      setAddressSuggestions([]);
      return;
    }
    
    // Only search if user is actively typing (dropdown is open)
    if (!showAddressDropdown) return;

    setIsSearchingAddress(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(alamatLengkap)}&format=json&addressdetails=1&limit=5&countrycodes=id`);
        if (!res.ok) throw new Error("Failed to fetch address");
        const data = await res.json();
        setAddressSuggestions(data || []);
      } catch (err) {
        console.error("Geocoding error:", err);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [alamatLengkap, showAddressDropdown]);

  const [jamBuka, setJamBuka] = useState("08:00");
  const [jamTutup, setJamTutup] = useState("17:00");
  const [pemilik, setPemilik] = useState("");
  const [kapasitas, setKapasitas] = useState("");
  const [tipeGudang, setTipeGudang] = useState("General");
  const [kategoriToko, setKategoriToko] = useState("Minimarket");

  // Form States — User (Step 2)
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // Data Driver (single step)
  const [driverNama, setDriverNama] = useState("");  // dedicated — tidak share dg branch form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plat, setPlat] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState("");
  const [nomorSim, setNomorSim] = useState("");
  const [alamatDomisili, setAlamatDomisili] = useState("");
  const [statusMitra, setStatusMitra] = useState("In-House");
  const [driverBranchId, setDriverBranchId] = useState("");

  // Map Picker State
  const mapRef = useRef(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [latLng, setLatLng] = useState({ lat: -6.200000, lng: 106.816666 });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const resetBranchForm = () => {
    setNama("");
    setLokasi("");
    setAlamatLengkap("");
    setAddressSuggestions([]);
    setShowAddressDropdown(false);
    setPemilik("");
    setKapasitas("");
    setMarkerPos(null);
  };

  const resetUserForm = () => {
    setUserName("");
    setUserUsername("");
    setUserPassword("");
    setUserEmail("");
    setUserPhone("");
    setUserFormError("");
    setUserEmailError("");
  };

  const resetAllForms = () => {
    resetBranchForm();
    resetUserForm();
    setDriverNama("");
    setUsername("");
    setPassword("");
    setEmail("");
    setPhone("");
    setPlat("");
    setNomorSim("");
    setAlamatDomisili("");
    setStatusMitra("In-House");
    setDriverFormError("");
    setDriverEmailError("");
    setCurrentStep(1);
    setRegisteredBranch(null);
    setRegisteredUsers([]);
  };

  const handleSubmitBranch = async (e) => {
    e.preventDefault();
    if (!nama || !lokasi || !alamatLengkap) return alert("Mohon lengkapi Nama, Lokasi, dan Alamat Lengkap.");
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: nama,
        type: activeTab.toLowerCase(),
        location: lokasi,
        alamatLengkap,
        jamOperasional: `${jamBuka} - ${jamTutup}`,
        pemilik: activeTab === "Toko" ? pemilik : undefined,
        kapasitas: activeTab === "Gudang" ? kapasitas : undefined,
        tipeGudang: activeTab === "Gudang" ? tipeGudang : undefined,
        kategoriToko: activeTab === "Toko" ? kategoriToko : undefined,
        lat: latLng.lat,
        lng: latLng.lng,
      };

      const result = await createBranchAccount(payload);

      if (!result?.id) {
        setBranchFormError("Gagal mendapatkan ID cabang. Silakan coba lagi.");
        return;
      }

      // Backend returns the newly created branch object directly
      setRegisteredBranch({
        id: result.id,
        name: result.name || nama,
        type: activeTab.toLowerCase(),
      });

      setBranchFormError("");
      showToast(`${activeTab} "${nama}" berhasil didaftarkan! Lanjutkan daftarkan user.`);
      setCurrentStep(2);
    } catch (err) {
      setBranchFormError(err.message || "Gagal mendaftarkan cabang. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Add user to branch
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userUsername || !userPassword || !userName) {
      setUserFormError("Mohon lengkapi Nama, Username, dan Password user.");
      return;
    }

    setUserFormError("");
    const userPayload = {
      branchId: registeredBranch.id,
      name: userName,
      username: userUsername,
      password: userPassword,
      email: userEmail,
      phone: userPhone,
      role: registeredBranch.type === "gudang" ? "GUDANG" : "TOKO",
    };

    try {
      await createBranchUser(userPayload);

      setRegisteredUsers((prev) => [
        ...prev,
        { ...userPayload, id: `USR-${Date.now()}` },
      ]);

      showToast(`User "${userName}" berhasil ditambahkan ke ${registeredBranch.name}!`);
      resetUserForm();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("email sudah digunakan")) {
        setUserEmailError(err.message);
      } else {
        setUserFormError(err.message || "Gagal menambahkan user. Coba lagi.");
      }
    }
  };

  // Step 2: Finish registration
  const handleFinish = () => {
    showToast(`Pendaftaran ${registeredBranch.name} selesai dengan ${registeredUsers.length} user!`);
    resetAllForms();
  };

  const handleSubmitDriver = async (e) => {
    e.preventDefault();
    if (!driverNama || !plat || !phone || !nomorSim || !username || !password || !driverBranchId) {
      setDriverFormError("Mohon lengkapi semua data Driver beserta Cabang Gudang.");
      return;
    }

    setDriverFormError("");
    const gudang = branches.find(b => b.id === driverBranchId);

    const payload = {
      branchId: driverBranchId,
      name: driverNama,
      username,
      password,
      email: email,
      phone: phone,
      nomorSim,
      alamatDomisili,
      statusMitra,
      vehicle: `${tipeKendaraan} (${plat})`,
      role: "DRIVER",
      joinedAt: new Date().toISOString()
    };

    try {
      await createBranchUser(payload);
      showToast(`Driver "${driverNama}" berhasil didaftarkan ke ${gudang?.name || "gudang"}!`);
      resetAllForms();
      setDriverBranchId("");
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("email sudah digunakan")) {
        setDriverEmailError(err.message);
      } else {
        setDriverFormError(err.message || "Gagal mendaftarkan driver. Coba lagi.");
      }
    }
  };

  return (
    <div className="registrasi-page">
      <header className="registrasi-header">
        <h1 className="registrasi-title">Pendaftaran Entitas</h1>
        <p className="registrasi-subtitle">
          Daftarkan Gudang cabang, Mitra Toko, atau Driver pengiriman baru ke dalam sistem WMS.
        </p>
      </header>

      <div className="registrasi-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`registrasi-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => {
              setActiveTab(t);
              resetAllForms();
            }}
          >
            {t === "Gudang" ? "🏢" : t === "Toko" ? "🏪" : "🚚"} {t}
          </button>
        ))}
      </div>

      {/* STEP INDICATOR for Gudang/Toko */}
      {(activeTab === "Gudang" || activeTab === "Toko") && (
        <div className="reg-step-indicator">
          <div className={`reg-step-item ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
            <div className="reg-step-circle">
              {currentStep > 1 ? "✓" : "1"}
            </div>
            <span className="reg-step-label">Data {activeTab}</span>
          </div>
          <div className="reg-step-line-container">
            <div className={`reg-step-line ${currentStep > 1 ? "filled" : ""}`} />
          </div>
          <div className={`reg-step-item ${currentStep >= 2 ? "active" : ""}`}>
            <div className="reg-step-circle">2</div>
            <span className="reg-step-label">Daftarkan User</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ====== STEP 1: FORM CABANG (Gudang/Toko) ====== */}
        {(activeTab === "Gudang" || activeTab === "Toko") && currentStep === 1 && (
          <motion.div
            key={`${activeTab}-step1`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35 }}
            className="registrasi-card"
          >
            <form onSubmit={handleSubmitBranch} className="registrasi-form-grid">
              <div className="form-group full-width">
                <label className="form-label">Nama {activeTab}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Contoh: ${activeTab === 'Gudang' ? 'Gudang Distribusi Jogja' : 'Toko Makmur Sentosa'}`}
                  value={nama}
                  onChange={(e) => setNama(e.target.value.replace(/[^a-zA-Z0-9\s.,&-]/g, ""))}
                />
              </div>

              <div className="form-group full-width" style={{ position: "relative" }}>
                <label className="form-label">Alamat Detail / Jalan Lengkap</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Jl. Sudirman No. 45, RT 01/RW 02, Jakarta Selatan, 12345"
                  value={alamatLengkap}
                  onChange={(e) => {
                    setAlamatLengkap(e.target.value); // Removed replace constraint for searching
                    setShowAddressDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowAddressDropdown(false), 200); // delay to allow click on suggestion
                  }}
                  onFocus={() => {
                    if (alamatLengkap.length > 3) setShowAddressDropdown(true);
                  }}
                />
                
                <AnimatePresence>
                  {showAddressDropdown && alamatLengkap.length > 3 && (
                    <motion.div
                      className="autocomplete-dropdown"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      {isSearchingAddress ? (
                        <div className="autocomplete-searching">Mencari alamat...</div>
                      ) : addressSuggestions.length > 0 ? (
                        addressSuggestions.map((sug, idx) => (
                          <div
                            key={idx}
                            className="autocomplete-item"
                            onClick={() => {
                              setAlamatLengkap(sug.display_name);
                              setLatLng({ lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) });
                              setShowAddressDropdown(false);
                            }}
                          >
                            {sug.display_name}
                          </div>
                        ))
                      ) : (
                        <div className="autocomplete-searching">Tidak ditemukan hasil.</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label">Kota / Area Lokasi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Yogyakarta"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))}
                />
              </div>

                <div className="form-group full-width">
                  <label className="form-label">Tentukan Titik Peta (Opsional namun disarankan)</label>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", marginTop: "-4px" }}>
                    Geser/klik pada peta untuk menentukan lokasi persis agar Tracking GPS rute jalan raya lebih akurat.
                  </p>
                  <div style={{ height: "250px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                    <MapContainer center={[latLng.lat, latLng.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                      <TileLayer
                        attribution='&copy; OSM'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker latLng={latLng} setLatLng={setLatLng} setAlamatLengkap={setAlamatLengkap} />
                    </MapContainer>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Jam Operasional (Buka - Tutup)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input type="time" className="form-input" value={jamBuka} onChange={(e) => setJamBuka(e.target.value)} />
                  <span style={{ fontWeight: 600, color: '#64748b' }}>s/d</span>
                  <input type="time" className="form-input" value={jamTutup} onChange={(e) => setJamTutup(e.target.value)} />
                </div>
              </div>

              {activeTab === "Gudang" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Kapasitas Maksimal (Unit)</label>
                    <input type="text" className="form-input" placeholder="Contoh: 50000" value={kapasitas} onChange={(e) => setKapasitas(e.target.value.replace(/[^0-9]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Gudang</label>
                    <select className="form-input" value={tipeGudang} onChange={(e) => setTipeGudang(e.target.value)}>
                      <option value="General">Gudang Biasa (General)</option>
                      <option value="Cold Storage">Pendingin (Cold Storage)</option>
                      <option value="Hazardous">Bahan Berbahaya (Hazardous)</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === "Toko" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nama Pemilik / Penanggung Jawab</label>
                    <input type="text" className="form-input" placeholder="Contoh: Bpk. Haryanto" value={pemilik} onChange={(e) => setPemilik(e.target.value.replace(/[^a-zA-Z\s.,]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori Toko</label>
                    <input 
                      list="kategori-toko-options" 
                      className="form-input" 
                      value={kategoriToko} 
                      onChange={(e) => setKategoriToko(e.target.value)} 
                      placeholder="Pilih atau ketik kategori..." 
                    />
                    <datalist id="kategori-toko-options">
                      <option value="Minimarket" />
                      <option value="Supermarket" />
                      <option value="Grosir / Distributor Besar" />
                      <option value="Warung Kelontong" />
                    </datalist>
                  </div>
                </>
              )}

              <div className="form-group full-width">
                <button type="submit" className="btn-next-step" disabled={isSubmitting}>
                  {isSubmitting ? "Memproses..." : <>Lanjut — Daftarkan User <span className="btn-arrow">→</span></>}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ====== STEP 2: FORM USER ====== */}
        {(activeTab === "Gudang" || activeTab === "Toko") && currentStep === 2 && registeredBranch && (
          <motion.div
            key={`${activeTab}-step2`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="registrasi-card"
          >
            {/* Branch Info Badge */}
            <div className="branch-info-badge">
              <div className="branch-info-icon">
                {registeredBranch.type === "gudang" ? "🏢" : "🏪"}
              </div>
              <div className="branch-info-text">
                <span className="branch-info-label">Mendaftarkan user untuk</span>
                <span className="branch-info-name">{registeredBranch.name}</span>
              </div>
              <div className="branch-info-id">{registeredBranch.id}</div>
            </div>

            <form onSubmit={handleAddUser} className="registrasi-form-grid" style={{ marginTop: 24 }}>
              <div className="form-section-title full-width">
                <h4>👤 Data User Baru</h4>
                <p>User ini akan digunakan untuk login ke akun {registeredBranch.name}</p>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Nama Lengkap User</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Ahmad Fauzi"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username Login</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Contoh: user_${registeredBranch.type}_01`}
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password Login</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Masukkan kata sandi"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Contoh: ahmad@reastock.com"
                  value={userEmail}
                  onChange={(e) => {
                    setUserEmailError("");
                    setUserEmail(e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""));
                  }}
                />
                {userEmailError && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{userEmailError}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Nomor Telepon / WhatsApp</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Contoh: 081234567890"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>

              {/* Inline error banner */}
              {userFormError && (
                <div className="form-group full-width">
                  <div style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.5)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    color: "#fca5a5",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <span>{userFormError}</span>
                  </div>
                </div>
              )}

              <div className="form-group full-width">
                <button type="submit" className="btn-add-user">
                  <span>＋</span> Tambah User
                </button>
              </div>
            </form>

            {/* Registered Users Table */}
            {registeredUsers.length > 0 && (
              <div className="registered-users-section">
                <h4 className="registered-users-title">
                  User Terdaftar ({registeredUsers.length})
                </h4>
                <div className="registered-users-table-wrap">
                  <table className="registered-users-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Telepon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredUsers.map((u, i) => (
                        <tr key={u.id}>
                          <td>{i + 1}</td>
                          <td><strong>{u.name}</strong></td>
                          <td><code>{u.username}</code></td>
                          <td>{u.email || "-"}</td>
                          <td>{u.phone || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="step2-actions">
              <button
                type="button"
                className="btn-back-step"
                onClick={() => {
                  setCurrentStep(1);
                  setRegisteredBranch(null);
                  setRegisteredUsers([]);
                }}
              >
                ← Kembali
              </button>
              <button
                type="button"
                className="btn-finish"
                onClick={handleFinish}
                disabled={registeredUsers.length === 0}
              >
                ✓ Selesai ({registeredUsers.length} user terdaftar)
              </button>
            </div>
          </motion.div>
        )}

        {/* ====== DRIVER TAB (single step — unchanged) ====== */}
        {activeTab === "Driver" && (
          <motion.div
            key="driver"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="registrasi-card"
          >
            <form onSubmit={handleSubmitDriver} className="registrasi-form-grid">
              <div className="form-group full-width" style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Data Diri & Akun</h4>
                <div className="registrasi-form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Penempatan Cabang Gudang</label>
                    <select className="form-input" value={driverBranchId} onChange={(e) => setDriverBranchId(e.target.value)}>
                      <option value="">-- Pilih Cabang Gudang --</option>
                      {branches.filter(b => b.type === "gudang").map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Driver</label>
                    <input type="text" className="form-input" placeholder="Contoh: Budi Santoso" value={driverNama} onChange={(e) => setDriverNama(e.target.value.replace(/[^a-zA-Z\s]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Handphone / WhatsApp</label>
                    <input type="tel" className="form-input" placeholder="Contoh: 081234567890" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" placeholder="Contoh: budi@reastock.com" value={email} onChange={(e) => {
                      setDriverEmailError("");
                      setEmail(e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""));
                    }} />
                    {driverEmailError && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{driverEmailError}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor SIM</label>
                    <input type="text" className="form-input" placeholder="Contoh: 1234-5678-9012" value={nomorSim} onChange={(e) => setNomorSim(e.target.value.replace(/[^0-9-]/g, ""))} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Alamat Domisili</label>
                    <input type="text" className="form-input" placeholder="Contoh: Jl. Pegangsaan Timur No. 56, Jakarta Pusat" value={alamatDomisili} onChange={(e) => setAlamatDomisili(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username Login</label>
                    <input type="text" className="form-input" placeholder="Contoh: driver_budi" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password Login</label>
                    <input type="password" className="form-input" placeholder="Masukkan kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-group full-width" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Informasi Kendaraan</h4>
                <div className="registrasi-form-grid">
                  <div className="form-group">
                    <label className="form-label">Plat Nomor Kendaraan</label>
                    <input type="text" className="form-input" placeholder="Contoh: B 1234 ABC" value={plat} onChange={(e) => setPlat(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Kendaraan</label>
                    <input type="text" className="form-input" placeholder="Contoh: Truck Box Hino (Besar)" value={tipeKendaraan} onChange={(e) => setTipeKendaraan(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status Mitra / Kepemilikan</label>
                    <select className="form-input" value={statusMitra} onChange={(e) => setStatusMitra(e.target.value)}>
                      <option value="In-House">In-House (Karyawan Internal)</option>
                      <option value="Vendor">Vendor (Pihak Ketiga)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inline error banner */}
              {driverFormError && (
                <div className="form-group full-width">
                  <div style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.5)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    color: "#fca5a5",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <span>{driverFormError}</span>
                  </div>
                </div>
              )}

              <div className="form-group full-width">
                <button type="submit" className="btn-submit-reg">
                  Daftarkan Driver ke Sistem
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="reg-toast"
          >
            <span>✅</span> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
