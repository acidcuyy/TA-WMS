import { useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Inventory Value", value: "Rp 2.450.000.000", trend: "+12.5%", sub: "vs minggu lalu", icon: "💰", color: "#e4915a" },
    { label: "Total Orders", value: "1.248", trend: "+8.2%", sub: "vs minggu lalu", icon: "🛍️", color: "#3b82f6" },
    { label: "Fulfillment Rate", value: "98.5%", trend: "+2.1%", sub: "vs minggu lalu", icon: "🎯", color: "#22c55e" },
    { label: "Out of Stock Items", value: "23", trend: "↑ 4", sub: "vs minggu lalu", icon: "📦", color: "#ef4444", danger: true },
    { label: "Low Stock Alerts", value: "47", trend: "↑ 6", sub: "vs minggu lalu", icon: "⚠️", color: "#f97316", danger: true },
    { label: "Stock Turnover", value: "6.2x", trend: "↑ 1.1x", sub: "vs minggu lalu", icon: "🔄", color: "#8b5cf6" },
  ];

  return (
    <div className="dashboard-view">
      {/* HEADER AREA */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Selamat Datang Admin!</h1>
          <p>Berikut ringkasan performa warehouse hari ini.</p>
        </div>
      </header>

      {/* STATS GRID */}
      <section className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div className="stat-info">
                <span className="stat-label">{s.label}</span>
                <span className="stat-value">{s.value}</span>
              </div>
            </div>
            <div className="stat-bottom">
              <span className={`stat-trend ${s.danger ? 'danger' : 'success'}`}>{s.trend}</span>
              <span className="stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* MIDDLE SECTION: CHARTS & SUMMARY */}
      <section className="dashboard-grid middle">
        <div className="grid-card chart-card">
          <div className="card-header">
            <h3>Pergerakan Stok (Stock In vs Stock Out)</h3>
            <select><option>Mingguan</option></select>
          </div>
          <div className="chart-area">
            <div className="chart-y-axis">
              <span>500</span>
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
            </div>
            <div className="chart-main">
              <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="svg-chart">
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4a90e2" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e4915a" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#e4915a" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="0" x2="500" y2="0" stroke="var(--border-subtle)" strokeWidth="0.5" />
                <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border-subtle)" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="var(--border-subtle)" strokeWidth="0.5" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border-subtle)" strokeWidth="0.5" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="var(--border-subtle)" strokeWidth="0.5" />
                <line x1="0" y1="200" x2="500" y2="200" stroke="var(--border-subtle)" strokeWidth="0.5" />
                {/* Stock In - Area Fill */}
                <path d="M0,120 C40,100 60,60 100,70 C140,80 160,40 200,50 C240,60 280,30 320,45 C360,60 400,35 450,40 L500,55 L500,200 L0,200 Z" fill="url(#gradBlue)" />
                {/* Stock In - Line */}
                <path d="M0,120 C40,100 60,60 100,70 C140,80 160,40 200,50 C240,60 280,30 320,45 C360,60 400,35 450,40 L500,55" fill="none" stroke="#4a90e2" strokeWidth="2.5" strokeLinecap="round" />
                {/* Stock Out - Area Fill */}
                <path d="M0,150 C40,140 60,110 100,120 C140,130 160,95 200,100 C240,105 280,80 320,90 C360,100 400,85 450,80 L500,95 L500,200 L0,200 Z" fill="url(#gradOrange)" />
                {/* Stock Out - Line */}
                <path d="M0,150 C40,140 60,110 100,120 C140,130 160,95 200,100 C240,105 280,80 320,90 C360,100 400,85 450,80 L500,95" fill="none" stroke="#e4915a" strokeWidth="2.5" strokeLinecap="round" />
                {/* Data points - Stock In */}
                <circle cx="0" cy="120" r="3" fill="#4a90e2" />
                <circle cx="100" cy="70" r="3" fill="#4a90e2" />
                <circle cx="200" cy="50" r="3" fill="#4a90e2" />
                <circle cx="320" cy="45" r="3" fill="#4a90e2" />
                <circle cx="450" cy="40" r="3" fill="#4a90e2" />
                <circle cx="500" cy="55" r="3" fill="#4a90e2" />
                {/* Data points - Stock Out */}
                <circle cx="0" cy="150" r="3" fill="#e4915a" />
                <circle cx="100" cy="120" r="3" fill="#e4915a" />
                <circle cx="200" cy="100" r="3" fill="#e4915a" />
                <circle cx="320" cy="90" r="3" fill="#e4915a" />
                <circle cx="450" cy="80" r="3" fill="#e4915a" />
                <circle cx="500" cy="95" r="3" fill="#e4915a" />
              </svg>
              <div className="chart-x-axis">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
                <span>Min</span>
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <span><i className="dot blue"></i> Stock In</span>
            <span><i className="dot orange"></i> Stock Out</span>
          </div>
        </div>

        <div className="grid-card chart-card">
          <div className="card-header">
            <h3>Kesehatan Stok</h3>
            <button className="text-btn">Lihat Detail</button>
          </div>
          <div className="donut-container">
            <div className="donut-chart">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4a90e2" strokeWidth="10" strokeDasharray="150 251" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e4915a" strokeWidth="10" strokeDasharray="80 251" strokeDashoffset="-150" />
              </svg>
              <div className="donut-center">
                <strong>2.104</strong>
                <span>Total Item</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item"><i className="dot blue"></i> Fast Moving <span>35% (737)</span></div>
              <div className="legend-item"><i className="dot orange"></i> Medium Moving <span>40% (842)</span></div>
              <div className="legend-item"><i className="dot yellow"></i> Slow Moving <span>15% (316)</span></div>
              <div className="legend-item"><i className="dot red"></i> Dead Stock <span>10% (209)</span></div>
            </div>
          </div>
        </div>

        <div className="grid-card table-card">
          <div className="card-header">
            <h3>Ringkasan Gudang</h3>
            <button className="text-btn">Lihat Semua</button>
          </div>
          <table className="compact-table">
            <thead>
              <tr><th>Gudang</th><th>Stok</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>Gudang Pusat</td><td>1.240</td><td><span className="badge success">Normal</span></td></tr>
              <tr><td>Gudang Barat</td><td>620</td><td><span className="badge success">Normal</span></td></tr>
              <tr><td>Gudang Timur</td><td>180</td><td><span className="badge warn">Low Stock</span></td></tr>
              <tr><td>Gudang Selatan</td><td>64</td><td><span className="badge danger">Critical</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* LOWER SECTION: ALERTS & PRODUCTS */}
      <section className="dashboard-grid lower">
        <div className="grid-card list-card">
          <div className="card-header">
            <h3>Peringatan & Alert</h3>
            <button className="text-btn">Lihat Semua</button>
          </div>
          <div className="alert-list">
            <div className="alert-item">
              <span className="alert-icon warn">⚠️</span>
              <div className="alert-body">
                <strong>Low Stock Items</strong>
                <span>Stok di bawah minimum</span>
              </div>
              <span className="alert-value warn">47</span>
            </div>
            <div className="alert-item">
              <span className="alert-icon danger">📦</span>
              <div className="alert-body">
                <strong>Out of Stock Items</strong>
                <span>Stok habis</span>
              </div>
              <span className="alert-value danger">23</span>
            </div>
          </div>
        </div>

        <div className="grid-card table-card">
          <div className="card-header">
            <h3>Top 5 Produk (Berdasarkan Penjualan)</h3>
            <button className="text-btn">Lihat Semua</button>
          </div>
          <table className="compact-table">
            <thead>
              <tr><th>Produk</th><th>Terjual</th><th>Stok Tersedia</th></tr>
            </thead>
            <tbody>
              <tr><td>Red Carpet</td><td>1.250 m</td><td>320 m</td></tr>
              <tr><td>Silky Wool</td><td>980 m</td><td>210 m</td></tr>
              <tr><td>Cotton Fabric</td><td>760 m</td><td>180 m</td></tr>
            </tbody>
          </table>
        </div>

        <div className="grid-card list-card">
          <div className="card-header">
            <h3>Aktivitas Terakhir</h3>
            <button className="text-btn">Lihat Semua</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <span className="act-icon">📝</span>
              <div className="act-body">
                <strong>PO-20250513-001 diselesaikan</strong>
                <span>Order dari Toko Surabaya</span>
              </div>
              <span className="act-time">2 menit lalu</span>
            </div>
            <div className="activity-item">
              <span className="act-icon">📥</span>
              <div className="act-body">
                <strong>Stock In - 320 item</strong>
                <span>Red Carpet di Gudang Pusat</span>
              </div>
              <span className="act-time">25 menit lalu</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL SECTION: RECENT ORDERS */}
      <section className="dashboard-grid full">
        <div className="grid-card table-card">
          <div className="card-header">
            <h3>Order Terbaru</h3>
          </div>
          <table className="main-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ORDER NO.</th>
                <th>ITEM</th>
                <th>CUSTOMER</th>
                <th>STATUS</th>
                <th>ORDERED ON</th>
                <th>CREATED BY</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>PO-20250513-002</td>
                <td>Silky Wool</td>
                <td>Toko Bandung</td>
                <td><span className="status-badge weaving">Weaving</span></td>
                <td>13 Mei 2025</td>
                <td>Admin</td>
                <td>⋮</td>
              </tr>
              <tr>
                <td>2</td>
                <td>PO-20250513-001</td>
                <td>Red Carpet</td>
                <td>Toko Surabaya</td>
                <td><span className="status-badge pending">Pending</span></td>
                <td>13 Mei 2025</td>
                <td>Admin</td>
                <td>⋮</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="floating-action-btn">+</div>
    </div>
  );
}
