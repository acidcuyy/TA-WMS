import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./ManajemenTokoAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function ManajemenToko() {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  // Laporan Harian
  const reports = [
    { date: "03", month: "Feb 2026", toko: "Toko A", desc: "Pengiriman: 45 transaksi • Keluar: 1 • Stok kritis: 2 item", status: "Tersedia" },
    { date: "02", month: "Feb 2026", toko: "Toko B", desc: "Pengiriman: 32 transaksi • Stok kritis: 1 item", status: "Tersedia" },
    { date: "01", month: "Feb 2026", toko: "Toko C", desc: "—", status: "Belum upload" },
    { date: "31", month: "Jan 2026", toko: "Toko A", desc: "Pengiriman: 28 transaksi • Penerimaan stok: 3 item", status: "Tersedia" },
    { date: "30", month: "Jan 2026", toko: "Toko B", desc: "—", status: "Belum upload" },
  ];

  // Stats
  const summary = {
    tokoAktif: 3,
    transaksiHariIni: 76,
    pendingRestock: 4,
    estimasiOmzet: 12500000,
  };

  // Shipments
  const shipments = [
    { id: "SHP-210", to: "Toko A", driver: "Kurir 01", eta: "2:20 menit", status: "Dalam perjalanan", progress: 75, route: "Gudang → Jl. Melati → Toko A" },
    { id: "SHP-208", to: "Toko B", driver: "Kurir 02", eta: "0:45 menit", status: "Terkirim", progress: 100, route: "Gudang → Ringroad → Toko B" },
    { id: "SHP-205", to: "Toko C", driver: "Kurir 03", eta: "1:10 menit", status: "Dalam perjalanan", progress: 40, route: "Gudang → Jl. Sudirman → Toko C" },
  ];

  // Transactions
  const transactions = [
    { id: "TRX-301", toko: "Toko A", tanggal: "02 Feb 2026", tipe: "Pengiriman", item: 14, nilai: 3250000, status: "Diproses", tracking: "Sedang diproses gudang" },
    { id: "TRX-300", toko: "Toko B", tanggal: "02 Feb 2026", tipe: "Pengiriman", item: 9, nilai: 1750000, status: "Dalam perjalanan", tracking: "Terkirim - 100% - ETA: Selesai" },
    { id: "TRX-299", toko: "Toko C", tanggal: "01 Feb 2026", tipe: "Pengiriman", item: 6, nilai: 980000, status: "Selesai", tracking: "—" },
    { id: "TRX-298", toko: "Toko A", tanggal: "31 Jan 2026", tipe: "Retur", item: 2, nilai: 180000, status: "Selesai", tracking: "—" },
  ];

  // Requests
  const requests = [
    { id: "T-REQ-021", toko: "Toko A", tanggal: "03 Feb 2026", item: 12, catatan: "Butuh untuk weekend", status: "Pending" },
    { id: "T-REQ-020", toko: "Toko B", tanggal: "02 Feb 2026", item: 8, catatan: "Stok kritis di etalase", status: "Dalam perjalanan" },
    { id: "T-REQ-019", toko: "Toko C", tanggal: "01 Feb 2026", item: 5, catatan: "Perlu pengganti item rusak", status: "Declined" },
    { id: "T-REQ-018", toko: "Toko A", tanggal: "31 Jan 2026", item: 3, catatan: "Fast moving", status: "Accepted" },
  ];

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mtAdmin__head">
        <div>
          <h1 className="mtAdmin__title">Manajemen Toko</h1>
          <p className="mtAdmin__subtitle">
            Kelola operasional toko, transaksi gudang, request restock, dan pengiriman dalam satu dashboard.
          </p>
        </div>
        <div className="mtAdmin__headRight">
          <span className="mtAdmin__badge mtAdmin__badge--live">
            <span className="mtAdmin__dot" />
            Live Monitoring
          </span>
          <div className="stokAdm__heroBadge">
            <span className="user-icon">👤</span> Admin / Owner <span className="chevron">⌄</span>
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="mtAdmin__stats">
        <Card className="mtAdmin__statCard">
          <div className="mtAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>🏪</div>
          <div className="mtAdmin__statContent">
            <p className="mtAdmin__statLabel">Total Toko Aktif</p>
            <h3 className="mtAdmin__statValue">{summary.tokoAktif}</h3>
            <p className="mtAdmin__statHint">Toko terdaftar (dummy)</p>
          </div>
        </Card>
        <Card className="mtAdmin__statCard">
          <div className="mtAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>🔄</div>
          <div className="mtAdmin__statContent">
            <p className="mtAdmin__statLabel">Transaksi Hari Ini</p>
            <h3 className="mtAdmin__statValue">{summary.transaksiHariIni}</h3>
            <p className="mtAdmin__statHint">Pengiriman + penerimaan</p>
          </div>
        </Card>
        <Card className="mtAdmin__statCard">
          <div className="mtAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>📦</div>
          <div className="mtAdmin__statContent">
            <p className="mtAdmin__statLabel">Pending Restock</p>
            <h3 className="mtAdmin__statValue">{summary.pendingRestock}</h3>
            <p className="mtAdmin__statHint">Request restock yang aktif</p>
          </div>
        </Card>
        <Card className="mtAdmin__statCard">
          <div className="mtAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>💰</div>
          <div className="mtAdmin__statContent">
            <p className="mtAdmin__statLabel">Estimasi Omzet</p>
            <h3 className="mtAdmin__statValue">Rp {fmtIDR(summary.estimasiOmzet)}</h3>
            <p className="mtAdmin__statHint">Omzet hari ini</p>
          </div>
        </Card>
      </div>

      {/* GRID SECTION */}
      <div className="mtAdmin__grid">
        {/* LAPORAN HARIAN */}
        <section className="mtAdmin__card">
          <div className="mtAdmin__cardHead">
            <h3>Laporan Harian Toko</h3>
            <button className="btn-upload"><span>📤</span> Upload Laporan</button>
          </div>
          <div className="mtAdmin__reportList">
            {reports.map((r, i) => (
              <div key={i} className="mtAdmin__reportRow">
                <div className="mtAdmin__reportDateBox">
                  <span className="mtAdmin__reportDateDay">{r.date}</span>
                  <span className="mtAdmin__reportDateMonth">{r.month}</span>
                </div>
                <div className="mtAdmin__reportMain">
                  <p className="mtAdmin__reportTitle"><b>{r.toko}</b> • Laporan Harian</p>
                  <p className="mtAdmin__reportDesc">{r.desc}</p>
                </div>
                <div className="mtAdmin__reportActions">
                  <span className={`mtAdmin__pill ${r.status === 'Tersedia' ? 'mtAdmin__pill--success' : 'mtAdmin__pill--warning'}`}>{r.status}</span>
                  <button className="mtAdmin__miniBtn">Preview</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-lihat-semua-link">Lihat semua laporan ></button>
        </section>

        {/* SHIPMENTS */}
        <section className="mtAdmin__card">
          <div className="mtAdmin__cardHead">
            <h3>Pengiriman dalam perjalanan ke Toko</h3>
            <span className="mtAdmin__badge">🔄 Auto-update</span>
          </div>
          <div className="mtAdmin__shipList">
            {shipments.map((s, i) => (
              <div key={i} className="mtAdmin__shipRow">
                <div className="mtAdmin__shipTop">
                  <div>
                    <div className="mtAdmin__shipLabel"><b>{s.id}</b> → {s.to}</div>
                    <div className="mtAdmin__shipMeta">Dikirim: 02 Feb 2026, 10:30 • ETA: {s.eta}</div>
                    <div className="mtAdmin__shipRoute">{s.route}</div>
                  </div>
                  <span className={`mtAdmin__pill ${s.status === 'Terkirim' ? 'mtAdmin__pill--success' : 'mtAdmin__pill--pending'}`}>{s.status}</span>
                </div>
                <div className="mtAdmin__progressContainer">
                  <div className="mtAdmin__progressFill" style={{ width: `${s.progress}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', fontWeight: '800' }}>{s.progress}%</div>
              </div>
            ))}
          </div>
          <button className="btn-lihat-semua-link">Lihat semua pengiriman ></button>
        </section>
      </div>

      {/* TABLES SECTION */}
      <div className="mtAdmin__grid">
        {/* TRANSAKSI */}
        <section className="mtAdmin__card">
          <div className="mtAdmin__cardHead">
            <h3>Data Transaksi Gudang → Toko</h3>
            <select className="stokAdm__heroBadge" style={{ border: '1px solid #eee', outline: 'none' }}>
              <option>Semua Status</option>
            </select>
          </div>
          <div className="mtAdmin__tableWrap">
            <table className="mtAdmin__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Toko</th>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>Item</th>
                  <th>Nilai</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td className="mtAdmin__mono">{t.id}</td>
                    <td>{t.toko}</td>
                    <td>{t.tanggal}</td>
                    <td>{t.tipe}</td>
                    <td>{t.item} item</td>
                    <td>Rp {fmtIDR(t.nilai)}</td>
                    <td><span className={`mtAdmin__pill ${t.status === 'Selesai' ? 'mtAdmin__pill--success' : t.status === 'Diproses' ? 'mtAdmin__pill--process' : 'mtAdmin__pill--pending'}`}>{t.status}</span></td>
                    <td style={{ fontSize: '11px', color: '#888' }}>{t.tracking}</td>
                    <td><button className="btn-more">⋮</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 4 dari 24 data</span>
          </div>
        </section>

        {/* REQUEST */}
        <section className="mtAdmin__card">
          <div className="mtAdmin__cardHead">
            <h3>Request Toko → Gudang</h3>
            <div className="mgAdmin__pill" style={{ background: '#e4915a', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> Action: Accept / Decline
            </div>
          </div>
          <div className="mtAdmin__tableWrap">
            <table className="mtAdmin__table">
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
                    <td className="mtAdmin__mono">{r.id}</td>
                    <td>{r.toko}</td>
                    <td>{r.tanggal}</td>
                    <td>{r.item} item</td>
                    <td style={{ color: '#888' }}>{r.catatan}</td>
                    <td><span className={`mtAdmin__pill ${r.status === 'Accepted' ? 'mtAdmin__pill--success' : r.status === 'Declined' ? 'mtAdmin__pill--warning' : r.status === 'Pending' ? 'mtAdmin__pill--pending' : 'mtAdmin__pill--process'}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="mtAdmin__btn mgAdmin__btn--ghost" style={{ background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e' }}>Decline</button>
                          <button className="mtAdmin__btn mgAdmin__btn--primary" style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }}>Accept</button>
                        </div>
                      ) : <span style={{ color: '#888', fontSize: '20px' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-lihat-semua-link" style={{ textAlign: 'right', width: 'auto' }}>Lihat semua request ></button>
          </div>
        </section>
      </div>

      <footer style={{ marginTop: '24px', display: 'flex', gap: '8px', alignItems: 'center', color: '#888', fontSize: '12px' }}>
        <span className="info-icon">ℹ️</span>
        Semua data bersifat dummy untuk keperluan UI/UX. Integrasi realtime melalui websocket akan segera hadir.
      </footer>
    </div>
  );
}
