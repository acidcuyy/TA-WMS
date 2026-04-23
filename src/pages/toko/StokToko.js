import { useEffect, useState } from "react";
import "./StokToko.css";

export default function StokToko() {
  const [notif, setNotif] = useState("");
  const [barang, setBarang] = useState([]);

  useEffect(() => {
  fetch("http://localhost:5000/api/barang")
    .then((res) => res.json())
    .then((data) => setBarang(data))
    .catch((err) => console.error(err));
}, []);

  const showNotif = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 2000);
  };

  const handleRequest = () => {
    showNotif("Request berhasil dibuat!");
  };

  const handleImport = () => {
    showNotif("Fitur import coming soon 🚀");
  };

  const handleAlert = () => {
    showNotif("Menampilkan stok menipis ⚠️");
  };

  
  return (
    <div className="stok-page">
      <div className="stok-container">

        {/* HEADER */}
        <div className="stok-header">
          <div>
            <h1>Stok Toko</h1>
            <p>Monitoring stok barang di toko secara real-time dan kelola permintaan barang.</p>
          </div>
        </div>
        
        <div>
      </div>

        {/* RINGKASAN */}
        <div className="card summary-card">
          <div className="summary-left">
            <div className="icon-box">📦</div>
            <div>
              <p>Total Barang</p>
              <h2>128</h2>
              <span>item</span>
            </div>
          </div>

          <div className="divider" />

          <div className="summary-left">
            <div className="icon-box warning">⚠️</div>
            <div>
              <p>Stok Menipis</p>
              <h2>8</h2>
              <span>item</span>
            </div>
          </div>

          <button className="btn-outline" onClick={handleAlert}>
            Cek Alert →
          </button>
        </div>

        {/* GRID */}
        <div className="grid">

          {/* AKSI */}
          <div className="card">
            <h3>Aksi Cepat</h3>

            <div className="action-grid">
              <div className="action-card">
                <div className="big-icon">+</div>
                <h4>Buat Request</h4>
                <p>Buat permintaan barang ke gudang</p>
                <button className="btn-primary" onClick={handleRequest}>
                  Buat Sekarang →
                </button>
              </div>

              <div className="action-card">
                <div className="big-icon">⬇</div>
                <h4>Import</h4>
                <p>Import data barang dari Excel</p>
                <button className="btn-outline" onClick={handleImport}>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* AKTIVITAS */}
          <div className="card">
            <h3>Aktivitas Terakhir</h3>

            <div className="activity">
              <div>
                <span className="dot green" />
                <p>Request barang baru dibuat</p>
              </div>
              <span>2 jam lalu</span>
            </div>

            <div className="activity">
              <div>
                <span className="dot orange" />
                <p>Stok menipis terdeteksi</p>
              </div>
              <span>5 jam lalu</span>
            </div>

            <div className="activity">
              <div>
                <span className="dot blue" />
                <p>Import data barang</p>
              </div>
              <span>Kemarin</span>
            </div>

            <button className="btn-outline full">
              Lihat Semua Aktivitas →
            </button>
          </div>

        </div>

        {/* INFO */}
        <div className="card info">
          <div>
            <p>Status Koneksi</p>
            <span className="status">● Connected</span>
          </div>

          <div>
            <p>Sinkronisasi Terakhir</p>
            <span>22 Mei 2025, 17:30 WIB</span>
          </div>

          <div>
            <p>Versi Aplikasi</p>
            <span>v1.0.0</span>
          </div>

          <button className="btn-outline">
            Pengaturan Lainnya →
          </button>
        </div>

      </div>

      {/* TOAST */}
      {notif && <div className="toast">{notif}</div>}
    </div>

  


  );
}