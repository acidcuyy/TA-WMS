import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./ManajemenOrderAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function ManajemenOrder() {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);
  const [activeTab, setActiveTab] = useState("Semua Order");

  const stats = [
    { label: "Total Order", value: 128, hint: "Semua order", icon: "🏠", color: "#e4915a", bg: "#fff8f3" },
    { label: "Pending", value: 28, hint: "Menunggu diproses", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Processing", value: 42, hint: "Sedang diproses", icon: "⚙️", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Shipped", value: 36, hint: "Dalam pengiriman", icon: "🚚", color: "#52c41a", bg: "#f6ffed" },
    { label: "Completed", value: 22, hint: "Selesai", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
  ];

  const orders = [
    { id: "SO-2026-00248", type: "Sales Order", date: "03 Feb 2026, 09:15", party: "Toko A", city: "Jakarta", items: 15, value: 3250000, status: "Pending", ship: "Belum dikirim", icon: "🛒", iconColor: "#52c41a" },
    { id: "SO-2026-00247", type: "Sales Order", date: "03 Feb 2026, 08:40", party: "Toko B", city: "Surabaya", items: 8, value: 1750000, status: "Processing", ship: "Sedang diproses", icon: "🛒", iconColor: "#52c41a" },
    { id: "PO-2026-00078", type: "Purchase Order", date: "02 Feb 2026, 14:30", party: "Supplier Jaya Abadi", city: "Bandung", items: 23, value: 12500000, status: "Processing", ship: "Partial", icon: "📦", iconColor: "#1890ff" },
    { id: "TR-2026-00056", type: "Transfer Order", date: "02 Feb 2026, 11:10", party: "Gudang Pusat → Toko C", city: "", items: 12, value: 980000, status: "Shipped", ship: "Dalam pengiriman Resi: JT123456789", icon: "⇄", iconColor: "#fa8c16" },
    { id: "SO-2026-00246", type: "Sales Order", date: "01 Feb 2026, 17:05", party: "Toko C", city: "Semarang", items: 5, value: 650000, status: "Completed", ship: "Selesai 03 Feb 2026", icon: "🛒", iconColor: "#52c41a" },
    { id: "PO-2026-00077", type: "Purchase Order", date: "01 Feb 2026, 10:25", party: "Mitra Elektronik", city: "Jakarta", items: 18, value: 8250000, status: "Completed", ship: "Selesai 02 Feb 2026", icon: "📦", iconColor: "#1890ff" },
    { id: "SO-2026-00245", type: "Sales Order", date: "31 Jan 2026, 15:20", party: "Toko D", city: "Medan", items: 9, value: 2150000, status: "Cancelled", ship: "Dibatalkan 31 Jan 2026", icon: "🛒", iconColor: "#ff4d4f" },
  ];

  const analytics = [
    { label: "Rata-rata Nilai Order", value: "Rp 2.850.000", sub: "Dari 128 order", icon: "🏪" },
    { label: "Order Bulan Ini", value: "72", sub: "↑ 12% dari bulan lalu", icon: "📊" },
    { label: "Item Terjual", value: "1.856 item", sub: "Dari sales order", icon: "🛒" },
    { label: "Tingkat Penyelesaian", value: "68.8%", sub: "Completed + Shipped", icon: "📈" },
  ];

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="moAdmin__head">
        <div>
          <h1 className="moAdmin__title">Manajemen Order</h1>
          <p className="moAdmin__subtitle">
            Kelola semua order dalam sistem, pantau status, dan proses pengiriman.
          </p>
        </div>
        <div className="moAdmin__headRight">
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
      <div className="moAdmin__stats">
        {stats.map((s, i) => (
          <Card key={i} className="moAdmin__statCard">
            <div className="moAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="moAdmin__statContent">
              <p className="moAdmin__statLabel">{s.label}</p>
              <h3 className="moAdmin__statValue">{s.value}</h3>
              <p className="moAdmin__statHint">{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="moAdmin__filterBar">
        <div className="moAdmin__searchWrap">
          <span className="moAdmin__searchIcon">🔍</span>
          <input placeholder="Cari ID order, toko, atau produk..." />
        </div>
        <div className="moAdmin__filterGroup">
          <select className="moAdmin__select"><option>Semua Tipe Order</option></select>
          <select className="moAdmin__select"><option>Semua Status</option></select>
          <select className="moAdmin__select"><option>Semua Toko</option></select>
          <div className="date-filter">📅 Pilih Rentang Tanggal</div>
          <button className="btn-reset-filter">Reset</button>
        </div>
        <button className="btn-create-order"><span>+</span> Buat Order Baru</button>
      </div>

      {/* TABS & TABLE */}
      <div className="moAdmin__tableCard">
        <div className="moAdmin__tabsHeader">
          <div className="moAdmin__tabs">
            {["Semua Order", "Penjualan (Sales Order)", "Pembelian (Purchase Order)", "Transfer / Perpindahan"].map(tab => (
              <div 
                key={tab} 
                className={`moAdmin__tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Semua Order" && "📊 "}
                {tab === "Penjualan (Sales Order)" && "🛒 "}
                {tab === "Pembelian (Purchase Order)" && "📦 "}
                {tab === "Transfer / Perpindahan" && "⇄ "}
                {tab}
              </div>
            ))}
          </div>
          <button className="btn-export"><span>📥</span> Export <span className="chevron">⌄</span></button>
        </div>

        <div className="moAdmin__tableWrap">
          <table className="moAdmin__table">
            <thead>
              <tr>
                <th>ID Order</th>
                <th>Tipe Order</th>
                <th>Tanggal Order</th>
                <th>Toko / Pihak</th>
                <th>Total Item</th>
                <th>Total Nilai</th>
                <th>Status</th>
                <th>Pengiriman</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={i}>
                  <td>
                    <div className="id-order-cell">
                      <div className="order-icon" style={{ color: o.iconColor }}>{o.icon}</div>
                      <div>
                        <p className="order-id">{o.id}</p>
                        <p className="order-type-sub">{o.type}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="order-icon" style={{ background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '12px' }}>{o.icon}</div>
                  </td>
                  <td>{o.date}</td>
                  <td>
                    <p style={{ fontWeight: 700 }}>{o.party}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{o.city}</p>
                  </td>
                  <td style={{ fontWeight: 600 }}>{o.items} item</td>
                  <td style={{ fontWeight: 700 }}>Rp {fmtIDR(o.value)}</td>
                  <td>
                    <span className={`status-pill status-pill--${o.status.toLowerCase()}`}>
                      ● {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{o.ship}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon">👁️</button>
                      <button className="btn-icon">⋮</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="table-footer" style={{ padding: '16px 24px' }}>
          <div className="rows-per-page">
            Menampilkan 1 - 10 dari 128 data
          </div>
          <div className="pagination">
             <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
            <div className="page-controls">
              <button disabled>⟨</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <span style={{ padding: '0 8px' }}>...</span>
              <button>13</button>
              <button>⟩</button>
            </div>
          </div>
        </footer>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="moAdmin__analytics">
        {analytics.map((a, i) => (
          <div key={i} className="moAdmin__analyticCard">
            <div className="moAdmin__analyticIcon">{a.icon}</div>
            <div>
              <p className="moAdmin__analyticLabel">{a.label}</p>
              <h4 className="moAdmin__analyticValue">{a.value}</h4>
              <p className="moAdmin__analyticSub">
                {a.label === "Order Bulan Ini" ? (
                  <><b>↑ 12%</b> dari bulan lalu</>
                ) : a.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
