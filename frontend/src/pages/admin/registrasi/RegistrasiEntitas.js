import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBranchAccount, updateDriverProfile } from "../../../services/wmsApi";
import "./RegistrasiEntitas.css";

export default function RegistrasiEntitas() {
  const [activeTab, setActiveTab] = useState("Gudang");
  const [toastMsg, setToastMsg] = useState("");

  const tabs = ["Gudang", "Toko", "Driver"];

  // Form States
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [jamBuka, setJamBuka] = useState("08:00");
  const [jamTutup, setJamTutup] = useState("17:00");
  const [pemilik, setPemilik] = useState("");
  const [kapasitas, setKapasitas] = useState("");
  const [tipeGudang, setTipeGudang] = useState("General");
  const [kategoriToko, setKategoriToko] = useState("Minimarket");
  
  // Data Akun (Global)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Data Driver
  const [plat, setPlat] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState("Truck Hino");
  const [nomorSim, setNomorSim] = useState("");
  const [alamatDomisili, setAlamatDomisili] = useState("");
  const [statusMitra, setStatusMitra] = useState("In-House");

  // Map Picker State
  const mapRef = useRef(null);
  const [markerPos, setMarkerPos] = useState(null); // { x, y } in pixels
  const [latLng, setLatLng] = useState({ lat: -6.200000, lng: 106.816666 }); // Default Jakarta

  const handleMapClick = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMarkerPos({ x, y });

    // Mock calculation for Lat/Lng based on click
    // Map bounds (approx Jakarta region)
    const latMin = -6.3;
    const latMax = -6.1;
    const lngMin = 106.7;
    const lngMax = 106.9;

    const percentX = x / rect.width;
    const percentY = y / rect.height;

    const lng = lngMin + (percentX * (lngMax - lngMin));
    const lat = latMax - (percentY * (latMax - latMin));

    setLatLng({ lat, lng });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "Gudang" || activeTab === "Toko") {
      if (!nama || !lokasi || !alamatLengkap || !username || !password) return alert("Mohon lengkapi Nama, Lokasi, Alamat Lengkap, Username, dan Password.");

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
        username,
        password,
        email,
        phone,
        lat: latLng.lat,
        lng: latLng.lng
      };

      await createBranchAccount(payload);
      showToast(`${activeTab} "${nama}" berhasil didaftarkan!`);
    } else if (activeTab === "Driver") {
      if (!nama || !plat || !phone || !nomorSim || !username || !password) return alert("Mohon lengkapi data Driver (termasuk No. SIM, Username & Password).");

      const payload = {
        name: nama,
        email: email,
        phone: phone,
        username,
        password,
        nomorSim,
        alamatDomisili,
        statusMitra,
        vehicle: `${tipeKendaraan} (${plat})`,
        role: "Driver Ekspedisi",
        joinedAt: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
      };

      updateDriverProfile(payload);
      showToast(`Driver "${nama}" berhasil didaftarkan!`);
    }

    // Reset Form
    setNama("");
    setLokasi("");
    setAlamatLengkap("");
    setPemilik("");
    setKapasitas("");
    setUsername("");
    setPassword("");
    setEmail("");
    setPhone("");
    setPlat("");
    setNomorSim("");
    setAlamatDomisili("");
    setMarkerPos(null);
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
              setMarkerPos(null);
            }}
          >
            {t === "Gudang" ? "🏢" : t === "Toko" ? "🏪" : "🚚"} {t}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="registrasi-card"
      >
        <form onSubmit={handleSubmit} className="registrasi-form-grid">
          {/* COMMON FIELDS UNTUK GUDANG & TOKO */}
          {(activeTab === "Gudang" || activeTab === "Toko") && (
            <>
              <div className="form-group full-width">
                <label className="form-label">Nama {activeTab}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Contoh: ${activeTab === 'Gudang' ? 'Gudang Distribusi Jakarta' : 'Toko Makmur Sentosa'}`}
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
                  placeholder="Contoh: Jakarta Selatan"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Jam Operasional (Buka - Tutup)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input
                    type="time"
                    className="form-input"
                    value={jamBuka}
                    onChange={(e) => setJamBuka(e.target.value)}
                  />
                  <span style={{ fontWeight: 600, color: '#64748b' }}>s/d</span>
                  <input
                    type="time"
                    className="form-input"
                    value={jamTutup}
                    onChange={(e) => setJamTutup(e.target.value)}
                  />
                </div>
              </div>

              {activeTab === "Gudang" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Kapasitas Maksimal (Unit)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Contoh: 50000"
                      value={kapasitas}
                      onChange={(e) => setKapasitas(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Gudang</label>
                    <select 
                      className="form-input"
                      value={tipeGudang}
                      onChange={(e) => setTipeGudang(e.target.value)}
                    >
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
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Bpk. Haryanto"
                      value={pemilik}
                      onChange={(e) => setPemilik(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori Toko</label>
                    <select 
                      className="form-input"
                      value={kategoriToko}
                      onChange={(e) => setKategoriToko(e.target.value)}
                    >
                      <option value="Minimarket">Minimarket</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Grosir">Grosir / Distributor Besar</option>
                      <option value="Warung Kelontong">Warung Kelontong</option>
                    </select>
                  </div>
                </>
              )}

              {/* INFORMASI AKUN & KONTAK */}
              <div className="form-group full-width" style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Informasi Akun & Kontak</h4>
                <div className="registrasi-form-grid">
                  <div className="form-group">
                    <label className="form-label">Username Login</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Contoh: admin_${activeTab.toLowerCase()}`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password Login</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Operasional</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder={`Contoh: info@${activeTab.toLowerCase()}.com`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Telepon / WhatsApp</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* MAP PICKER REMOVED AS REQUESTED */}
            </>
          )}

          {/* FIELDS UNTUK DRIVER */}
          {activeTab === "Driver" && (
            <>
              <div className="form-group full-width" style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Data Diri & Akun</h4>
                <div className="registrasi-form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Driver</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Budi Santoso"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Handphone / WhatsApp</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Contoh: budi@reastock.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor SIM</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: 1234-5678-9012"
                      value={nomorSim}
                      onChange={(e) => setNomorSim(e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Alamat Domisili</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Jl. Pegangsaan Timur No. 56, Jakarta Pusat"
                      value={alamatDomisili}
                      onChange={(e) => setAlamatDomisili(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username Login</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: driver_budi"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password Login</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group full-width" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Informasi Kendaraan</h4>
                <div className="registrasi-form-grid">
                  <div className="form-group">
                    <label className="form-label">Plat Nomor Kendaraan</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: B 1234 ABC"
                      value={plat}
                      onChange={(e) => setPlat(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipe Kendaraan</label>
                    <select 
                      className="form-input"
                      value={tipeKendaraan}
                      onChange={(e) => setTipeKendaraan(e.target.value)}
                    >
                      <option value="Truck Hino">Truck Box Hino (Besar)</option>
                      <option value="Engkel Box">Engkel Box (Sedang)</option>
                      <option value="Grandmax Blindvan">Blindvan (Kecil)</option>
                      <option value="Pick Up">Mobil Pick Up</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status Mitra / Kepemilikan</label>
                    <select 
                      className="form-input"
                      value={statusMitra}
                      onChange={(e) => setStatusMitra(e.target.value)}
                    >
                      <option value="In-House">In-House (Karyawan Internal)</option>
                      <option value="Vendor">Vendor (Pihak Ketiga)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-group full-width">
            <button type="submit" className="btn-submit-reg">
              Daftarkan {activeTab} ke Sistem
            </button>
          </div>
        </form>
      </motion.div>

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
