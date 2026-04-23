import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./ManajemenGudangAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function ManajemenGudang() {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  // Laporan Harian
  const [reports] = useState([
    { date: "03", month: "Feb 2026", title: "Laporan Harian • Gudang", desc: "Stok masuk: 120, keluar: 78", status: "Tersedia" },
    { date: "02", month: "Feb 2026", title: "Laporan Harian • Gudang", desc: "Audit rak A2 • koreksi 3 item", status: "Tersedia" },
    { date: "01", month: "Feb 2026", title: "Laporan Harian • Gudang", desc: "—", status: "Belum upload" },
    { date: "31", month: "Jan 2026", title: "Laporan Harian • Gudang", desc: "Pengiriman 2x ke Toko B", status: "Tersedia" },
    { date: "30", month: "Jan 2026", title: "Laporan Harian • Gudang", desc: "—", status: "Belum upload" },
  ]);

  // Stats
  const warehouseStock = {
    totalItem: 1860,
    kategori: 48,
    lowStock: 5,
    inboundToday: 120,
    outboundToday: 78,
    estimasiNilai: 275000000,
  };

  // Request Gudang
  const [requests, setRequests] = useState([
    { id: "REQ-0031", toko: "Toko A", tanggal: "02 Feb 2026, 14:30", item: "BRG-002 (Lampu LED)", qty: "50 pcs", catatan: "Stok hampir habis", status: "Pending" },
  ]);

  // Shipments
  const [shipments, setShipments] = useState([
    { id: "SHP-201", to: "Toko A", driver: "Kurir 01", eta: "Selesai", status: "Terkirim", progress: 100, route: "Gudang → Jl. Melati → Toko A" },
    { id: "SHP-200", to: "Toko B", driver: "Kurir 02", eta: "Selesai", status: "Terkirim", progress: 100, route: "Gudang → Ringroad → Toko B" },
    { id: "SHP-199", to: "Toko C", driver: "Kurir 03", eta: "Selesai", status: "Terkirim", progress: 100, route: "Gudang → Toko C" },
  ]);

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mgAdmin__head">
        <div>
          <h1 className="mgAdmin__title">Manajemen Operasional Gudang</h1>
          <p className="mgAdmin__subtitle">
            Ringkasan operasional gudang: laporan harian, stok, request, dan tracking pengiriman.
          </p>
        </div>
        <div className="mgAdmin__headRight">
          <span className="mgAdmin__badge mgAdmin__badge--live">
            <span className="mgAdmin__dot" />
            Live Monitoring
          </span>
          <div className="stokAdm__heroBadge">
            <span className="user-icon">👤</span> Admin / Owner <span className="chevron">⌄</span>
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="mgAdmin__stats">
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>📦</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Total Stok Gudang</p>
            <h3 className="mgAdmin__statValue">{warehouseStock.totalItem.toLocaleString()}</h3>
            <p className="mgAdmin__statHint">Kategori: {warehouseStock.kategori}</p>
          </div>
        </Card>
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#fff8f3', color: '#ff4d4f' }}>📋</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Stok Menipis</p>
            <h3 className="mgAdmin__statValue" style={{ color: '#ff4d4f' }}>{warehouseStock.lowStock} item</h3>
            <p className="mgAdmin__statHint">Perlu restock segera</p>
          </div>
        </Card>
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#f6ffed', color: '#52c41a' }}>↕</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Aktivitas Hari Ini</p>
            <h3 className="mgAdmin__statValue">
              <span style={{ color: '#52c41a' }}>+{warehouseStock.inboundToday}</span> / <span style={{ color: '#ff4d4f' }}>-{warehouseStock.outboundToday}</span>
            </h3>
            <p className="mgAdmin__statHint">Masuk / Keluar</p>
          </div>
        </Card>
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>💰</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Estimasi Nilai Stok</p>
            <h3 className="mgAdmin__statValue">Rp {fmtIDR(warehouseStock.estimasiNilai)}</h3>
            <p className="mgAdmin__statHint">Total valuasi barang</p>
          </div>
        </Card>
      </div>

      {/* GRID SECTION */}
      <div className="mgAdmin__grid">
        {/* LAPORAN HARIAN */}
        <section className="mgAdmin__card">
          <div className="mgAdmin__cardHead">
            <h3><span>🏠</span> Laporan Harian Gudang</h3>
            <button className="btn-upload"><span>📤</span> Upload Laporan</button>
          </div>
          <div className="mgAdmin__reportList">
            {reports.map((r, i) => (
              <div key={i} className="mgAdmin__reportRow">
                <div className="mgAdmin__reportDateBox">
                  <span className="mgAdmin__reportDateDay">{r.date}</span>
                  <span className="mgAdmin__reportDateMonth">{r.month}</span>
                </div>
                <div className="mgAdmin__reportMain">
                  <p className="mgAdmin__reportTitle">{r.title}</p>
                  <p className="mgAdmin__reportDesc">{r.desc}</p>
                </div>
                <div className="mgAdmin__reportActions">
                  <span className={`mgAdmin__pill ${r.status === 'Tersedia' ? 'mgAdmin__pill--success' : 'mgAdmin__pill--warning'}`}>{r.status}</span>
                  <button className="mgAdmin__miniBtn">Preview</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-lihat-semua">Lihat Semua Laporan</button>
        </section>

        {/* TRACKING REALTIME */}
        <section className="mgAdmin__card">
          <div className="mgAdmin__cardHead">
            <h3><span>📦</span> Tracking Pengiriman (Realtime)</h3>
            <span className="mgAdmin__badge">🔄 Auto-update</span>
          </div>
          <div className="mgAdmin__shipList">
            {shipments.map((s, i) => (
              <div key={i} className="mgAdmin__shipRow">
                <div className="mgAdmin__shipInfo">
                  <span className="mgAdmin__shipLabel"><b>{s.id}</b> → {s.to}</span>
                  <span className="mgAdmin__shipEta">{s.driver} • ETA: {s.eta}</span>
                </div>
                <div className="mgAdmin__shipStatusRow">
                  <span className="mgAdmin__pill mgAdmin__pill--success">Terkirim</span>
                </div>
                <div className="mgAdmin__progressContainer">
                  <div className="mgAdmin__progressFill" style={{ width: `${s.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-lihat-semua">Lihat Semua Pengiriman</button>
        </section>
      </div>

      {/* REQUEST SECTION */}
      <section className="mgAdmin__card" style={{ width: '100%' }}>
        <div className="mgAdmin__cardHead">
          <h3><span>📑</span> Request Gudang ke Admin</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select className="stokAdm__heroBadge" style={{ border: '1px solid #eee', outline: 'none' }}>
              <option>Semua Status</option>
            </select>
            <div className="mgAdmin__pill" style={{ background: '#e4915a', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> Action: Accept / Decline
            </div>
          </div>
        </div>
        <div className="mgAdmin__tableWrap">
          <table className="mgAdmin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Toko</th>
                <th>Tanggal</th>
                <th>Item</th>
                <th>Catatan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={i}>
                  <td className="mgAdmin__mono">{r.id}</td>
                  <td>{r.toko}</td>
                  <td>{r.tanggal}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {r.item} <span className="mgAdmin__pill" style={{ fontSize: '10px' }}>{r.qty}</span>
                    </div>
                  </td>
                  <td>{r.catatan}</td>
                  <td><span className="mgAdmin__pill" style={{ background: '#fff7e6', color: '#fa8c16' }}>● {r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="mgAdmin__btn mgAdmin__btn--primary" style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }}>✓ Accept</button>
                      <button className="mgAdmin__btn" style={{ background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e' }}>✕ Decline</button>
                      <button className="btn-more">⋮</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 5 dari 12 data</span>
          <div className="page-controls">
            <button disabled>⟨</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>⟩</button>
          </div>
        </div>
      </section>
    </div>
  );
}
