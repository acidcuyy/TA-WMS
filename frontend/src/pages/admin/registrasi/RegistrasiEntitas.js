import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBranchAccount, updateDriverProfile, createBranchUser, subscribeBranches } from "../../../services/wmsApi";
import "./RegistrasiEntitas.css";

export default function RegistrasiEntitas() {
  const [activeTab, setActiveTab] = useState("Gudang");
  const [toastMsg, setToastMsg] = useState("");

  // Multi-step state (for Gudang & Toko)
  const [currentStep, setCurrentStep] = useState(1);
  const [registeredBranch, setRegisteredBranch] = useState(null); // { id, name, type }
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [branches, setBranches] = useState([]);

  React.useEffect(() => {
    return subscribeBranches(setBranches);
  }, []);

  const tabs = ["Gudang", "Toko", "Driver"];

  // Form States — Branch
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [alamatLengkap, setAlamatLengkap] = useState("");
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plat, setPlat] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState("Truck Hino");
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
  };

  const resetAllForms = () => {
    resetBranchForm();
    resetUserForm();
    setUsername("");
    setPassword("");
    setEmail("");
    setPhone("");
    setPlat("");
    setNomorSim("");
    setAlamatDomisili("");
    setCurrentStep(1);
    setRegisteredBranch(null);
    setRegisteredUsers([]);
  };

  // Step 1: Submit branch
  const handleSubmitBranch = async (e) => {
    e.preventDefault();
    if (!nama || !lokasi || !alamatLengkap) return alert("Mohon lengkapi Nama, Lokasi, dan Alamat Lengkap.");

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

    // Find the newly created branch from result
    const branches = result.branches || [];
    const newBranch = branches[branches.length - 1];

    setRegisteredBranch({
      id: newBranch?.id || "BRC-NEW",
      name: nama,
      type: activeTab.toLowerCase(),
    });

    showToast(`${activeTab} "${nama}" berhasil didaftarkan! Lanjutkan daftarkan user.`);
    setCurrentStep(2);
  };

  // Step 2: Add user to branch
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!userUsername || !userPassword || !userName) return alert("Mohon lengkapi Nama, Username, dan Password user.");

    const userPayload = {
      branchId: registeredBranch.id,
      branchName: registeredBranch.name,
      branchType: registeredBranch.type,
      nama: userName,
      username: userUsername,
      password: userPassword,
      email: userEmail,
      phone: userPhone,
    };

    createBranchUser(userPayload);

    setRegisteredUsers((prev) => [
      ...prev,
      { ...userPayload, id: `USR-${Date.now()}` },
    ]);

    showToast(`User "${userName}" berhasil ditambahkan ke ${registeredBranch.name}!`);
    resetUserForm();
  };

  // Step 2: Finish registration
  const handleFinish = () => {
    showToast(`Pendaftaran ${registeredBranch.name} selesai dengan ${registeredUsers.length} user!`);
    resetAllForms();
  };

  const handleSubmitDriver = async (e) => {
    e.preventDefault();
    if (!nama || !plat || !phone || !nomorSim || !username || !password || !driverBranchId) return alert("Mohon lengkapi data Driver beserta Cabang Gudang.");

    const gudang = branches.find(b => b.id === driverBranchId);

    const payload = {
      branchId: driverBranchId,
      branchName: gudang ? gudang.name : "",
      branchType: "gudang",
      nama: nama,
      username,
      password,
      email: email,
      phone: phone,
      nomorSim,
      alamatDomisili,
      statusMitra,
      vehicle: `${tipeKendaraan} (${plat})`,
      role: "driver",
      joinedAt: new Date().toISOString()
    };

    createBranchUser(payload);
    showToast(`Driver "${nama}" berhasil didaftarkan ke ${payload.branchName}!`);
    resetAllForms();
    setDriverBranchId("");
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
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Alamat Detail / Jalan Lengkap</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Jl. Sudirman No. 45, RT 01/RW 02, Jakarta Selatan, 12345"
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kota / Area Lokasi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Yogyakarta"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                />
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
                    <input type="number" className="form-input" placeholder="Contoh: 50000" value={kapasitas} onChange={(e) => setKapasitas(e.target.value)} />
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
                    <input type="text" className="form-input" placeholder="Contoh: Bpk. Haryanto" value={pemilik} onChange={(e) => setPemilik(e.target.value)} />
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
                <button type="submit" className="btn-next-step">
                  Lanjut — Daftarkan User <span className="btn-arrow">→</span>
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
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username Login</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Contoh: user_${registeredBranch.type}_01`}
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
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
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nomor Telepon / WhatsApp</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Contoh: 081234567890"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>

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
                          <td><strong>{u.nama}</strong></td>
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
                    <input type="text" className="form-input" placeholder="Contoh: Budi Santoso" value={nama} onChange={(e) => setNama(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Handphone / WhatsApp</label>
                    <input type="tel" className="form-input" placeholder="Contoh: 081234567890" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" placeholder="Contoh: budi@reastock.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor SIM</label>
                    <input type="text" className="form-input" placeholder="Contoh: 1234-5678-9012" value={nomorSim} onChange={(e) => setNomorSim(e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Alamat Domisili</label>
                    <input type="text" className="form-input" placeholder="Contoh: Jl. Pegangsaan Timur No. 56, Jakarta Pusat" value={alamatDomisili} onChange={(e) => setAlamatDomisili(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username Login</label>
                    <input type="text" className="form-input" placeholder="Contoh: driver_budi" value={username} onChange={(e) => setUsername(e.target.value)} />
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
                    <input type="text" className="form-input" placeholder="Contoh: B 1234 ABC" value={plat} onChange={(e) => setPlat(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Kendaraan</label>
                    <select className="form-input" value={tipeKendaraan} onChange={(e) => setTipeKendaraan(e.target.value)}>
                      <option value="Truck Hino">Truck Box Hino (Besar)</option>
                      <option value="Engkel Box">Engkel Box (Sedang)</option>
                      <option value="Grandmax Blindvan">Blindvan (Kecil)</option>
                      <option value="Pick Up">Mobil Pick Up</option>
                    </select>
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
