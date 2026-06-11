import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { 
  subscribeWarehouseStock, 
  subscribeRequests, 
  subscribeBranches, 
  subscribeAdminRestockToGudang,
  subscribeNotifications
} from "../../../services/wmsApi";

export default function AdminDashboard() {
  const { period, setPeriod } = useOutletContext();
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsub1 = subscribeWarehouseStock(data => setStock(data || []));
    const unsub2 = subscribeRequests(data => setRequests(data || []));
    const unsub3 = subscribeBranches(data => setBranches(data || []));
    const unsub4 = subscribeAdminRestockToGudang(data => setAdminRequests(data || []));
    const unsub5 = subscribeNotifications(data => setNotifications(data || []));
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); };
  }, []);

  const totalOrders = requests.length;
  const completedOrders = requests.filter(r => r.status === "Selesai").length;
  const fulfillmentRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0.0";
  
  const outOfStock = stock.filter(s => s.qty === 0).length;
  const lowStock = stock.filter(s => s.qty > 0 && s.qty <= (s.minQty || 20)).length;

  const stats = [
    { label: "Total Orders", value: totalOrders.toString(), trend: "-", sub: "Real-time", icon: "🛍️", color: "#3b82f6" },
    { label: "Fulfillment Rate", value: `${fulfillmentRate}%`, trend: "-", sub: "Real-time", icon: "🎯", color: "#22c55e" },
    { label: "Out of Stock Items", value: outOfStock.toString(), trend: "-", sub: "Real-time", icon: "📦", color: "#ef4444", danger: outOfStock > 0 },
    { label: "Low Stock Alerts", value: lowStock.toString(), trend: "-", sub: "Real-time", icon: "⚠️", color: "#f97316", danger: lowStock > 0 },
    { label: "Stock Turnover", value: "N/A", trend: "-", sub: "Belum tersedia", icon: "🔄", color: "#8b5cf6" },
  ];

  const gudangList = branches.filter(b => b.type === 'gudang').map(gudang => {
    const gStock = stock.filter(s => s.branchId === gudang.id);
    const totalQty = gStock.reduce((sum, s) => sum + s.qty, 0);
    const hasCritical = gStock.some(s => s.qty === 0);
    const hasLow = gStock.some(s => s.qty > 0 && s.qty <= (s.minQty || 20));
    
    let status = "Normal";
    let badgeClass = "success";
    if (hasCritical) { status = "Critical"; badgeClass = "danger"; }
    else if (hasLow) { status = "Low Stock"; badgeClass = "warn"; }
    
    return { name: gudang.name, qty: totalQty, status, badgeClass };
  });

  const recentOrders = [...requests].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const topProducts = [...stock].sort((a,b) => b.qty - a.qty).slice(0, 3);
  
  const fastMoving = stock.filter(s => s.qty > 100).length;
  const medMoving = stock.filter(s => s.qty > 30 && s.qty <= 100).length;
  const slowMoving = stock.filter(s => s.qty > 0 && s.qty <= 30).length;
  const totalItems = stock.length;

  return (
    <div className="dashboard-view">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Selamat Datang Admin!</h1>
          <p>Berikut ringkasan performa warehouse hari ini secara live.</p>
        </div>
      </header>

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

      <section className="dashboard-grid middle">
        <div className="grid-card chart-card">
          <div className="card-header">
            <h3>Pergerakan Stok (Stock In vs Stock Out)</h3>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="Mingguan">Mingguan</option>
              <option value="Bulanan">Bulanan</option>
              <option value="Tahunan">Tahunan</option>
            </select>
          </div>
          <div className="chart-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#888' }}>Data pergerakan stok belum cukup untuk menampilkan chart realtime.</p>
          </div>
        </div>

        <div className="grid-card chart-card">
          <div className="card-header">
            <h3>Kesehatan Stok</h3>
            <button className="text-btn" onClick={() => navigate('/admin/produk')}>Lihat Detail</button>
          </div>
          <div className="donut-container">
            <div className="donut-chart">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="10" />
                {totalItems > 0 && (
                  <>
                    {fastMoving > 0 && (
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4a90e2" strokeWidth="10" strokeDasharray={`${(fastMoving / totalItems) * 251} 251`} strokeDashoffset="0" />
                    )}
                    {medMoving > 0 && (
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e4915a" strokeWidth="10" strokeDasharray={`${(medMoving / totalItems) * 251} 251`} strokeDashoffset={`-${(fastMoving / totalItems) * 251}`} />
                    )}
                    {slowMoving > 0 && (
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fcd34d" strokeWidth="10" strokeDasharray={`${(slowMoving / totalItems) * 251} 251`} strokeDashoffset={`-${((fastMoving + medMoving) / totalItems) * 251}`} />
                    )}
                    {outOfStock > 0 && (
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="10" strokeDasharray={`${(outOfStock / totalItems) * 251} 251`} strokeDashoffset={`-${((fastMoving + medMoving + slowMoving) / totalItems) * 251}`} />
                    )}
                  </>
                )}
              </svg>
              <div className="donut-center">
                <strong>{totalItems}</strong>
                <span>Total Item</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item"><i className="dot blue"></i> Fast Moving <span>{fastMoving} item</span></div>
              <div className="legend-item"><i className="dot orange"></i> Medium Moving <span>{medMoving} item</span></div>
              <div className="legend-item"><i className="dot yellow"></i> Slow Moving <span>{slowMoving} item</span></div>
              <div className="legend-item"><i className="dot red"></i> Dead Stock <span>{outOfStock} item</span></div>
            </div>
          </div>
        </div>

        <div className="grid-card table-card">
          <div className="card-header">
            <h3>Ringkasan Gudang</h3>
            <button className="text-btn" onClick={() => navigate('/admin/gudang')}>Lihat Semua</button>
          </div>
          <table className="compact-table">
            <thead>
              <tr><th>Gudang</th><th>Stok</th><th>Status</th></tr>
            </thead>
            <tbody>
              {gudangList.map((g, i) => (
                <tr key={i}><td>{g.name}</td><td>{g.qty}</td><td><span className={`badge ${g.badgeClass}`}>{g.status}</span></td></tr>
              ))}
              {gudangList.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>Belum ada data gudang</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-grid lower">
        <div className="grid-card list-card">
          <div className="card-header">
            <h3>Peringatan & Alert</h3>
            <button className="text-btn" onClick={() => navigate('/admin/stok-gudang')}>Lihat Semua</button>
          </div>
          <div className="alert-list">
            <div className="alert-item">
              <span className="alert-icon warn">⚠️</span>
              <div className="alert-body">
                <strong>Low Stock Items</strong>
                <span>Stok di bawah minimum</span>
              </div>
              <span className="alert-value warn">{lowStock}</span>
            </div>
            <div className="alert-item">
              <span className="alert-icon danger">📦</span>
              <div className="alert-body">
                <strong>Out of Stock Items</strong>
                <span>Stok habis</span>
              </div>
              <span className="alert-value danger">{outOfStock}</span>
            </div>
          </div>
        </div>

        <div className="grid-card table-card">
          <div className="card-header">
            <h3>Top Produk (Berdasarkan Stok Tersedia)</h3>
            <button className="text-btn" onClick={() => navigate('/admin/produk')}>Lihat Semua</button>
          </div>
          <table className="compact-table">
            <thead>
              <tr><th>Produk</th><th>SKU</th><th>Stok Tersedia</th></tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i}><td>{p.name}</td><td>{p.sku}</td><td>{p.qty}</td></tr>
              ))}
              {topProducts.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>Belum ada data stok</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="grid-card list-card">
          <div className="card-header">
            <h3>Aktivitas Terakhir</h3>
            <button className="text-btn" onClick={() => navigate('/admin/requests')}>Lihat Semua</button>
          </div>
          <div className="activity-list">
            {notifications.slice(0, 3).map((n, i) => (
              <div key={i} className="activity-item">
                <span className="act-icon">{n.type === 'restock_done' ? '✅' : '📥'}</span>
                <div className="act-body">
                  <strong>{n.title}</strong>
                  <span>{n.message}</span>
                </div>
                <span className="act-time">{n.time}</span>
              </div>
            ))}
            {notifications.length === 0 && <p style={{ padding: '20px', color: '#888', textAlign: 'center' }}>Tidak ada aktivitas</p>}
          </div>
        </div>
      </section>

      <section className="dashboard-grid full">
        <div className="grid-card table-card">
          <div className="card-header">
            <h3>Order Terbaru</h3>
          </div>
          <table className="main-table">
            <thead>
              <tr>
                <th>ORDER NO.</th>
                <th>ITEM TOTAL</th>
                <th>FROM</th>
                <th>TO</th>
                <th>STATUS</th>
                <th>ORDERED ON</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((r, i) => {
                const totalItems = (r.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
                return (
                  <tr key={i}>
                    <td>{r.id}</td>
                    <td>{totalItems}</td>
                    <td>{r.fromName}</td>
                    <td>{r.toName}</td>
                    <td><span className={`status-badge ${r.status === 'Selesai' ? 'done' : 'pending'}`}>{r.status}</span></td>
                    <td>{r.createdAt}</td>
                    <td>⋮</td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Belum ada order.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
