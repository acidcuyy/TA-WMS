import React, { useState } from "react";
import Card from "../../components/common/Card";
import "./OrdersGudang.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function OrdersGudang() {
  const [activeTab, setActiveTab] = useState("Semua");

  const stats = [
    { label: "Total Order", value: "85", sub: "Hari ini", icon: "🗒", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Perlu Picking", value: "12", sub: "Urgent", icon: "📦", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Siap Kirim", value: "24", sub: "Sudah Packing", icon: "🚚", color: "#52c41a", bg: "#f6ffed" },
    { label: "Retur", value: "3", sub: "Masalah", icon: "🔄", color: "#ff4d4f", bg: "#fff1f0" },
  ];

  const orders = [
    { id: "ORD-99012", customer: "Budi Santoso", items: "Pipa PVC 1/2 (x10), Lem PVC (x2)", total: 550000, status: "Picking", time: "10:20" },
    { id: "ORD-99011", customer: "Siska Amelia", items: "Kabel NYM 3x1.5 (20m)", total: 320000, status: "New", time: "10:05" },
    { id: "ORD-99010", customer: "Toko Jaya", items: "Baut M8 (x100), Cat Tembok (x5)", total: 1250000, status: "Packed", time: "09:45" },
    { id: "ORD-99009", customer: "Andi Wijaya", items: "Lampu LED 12W (x12)", total: 480000, status: "Shipped", time: "09:15" },
    { id: "ORD-99008", customer: "Herry Kurniawan", items: "Semen Portland (x10)", total: 650000, status: "Packed", time: "08:50" },
  ];

  return (
    <div className="odGudang">
      <header className="odGudang__head">
        <div>
          <h1 className="odGudang__title">Order Masuk</h1>
          <p className="odGudang__subtitle">Kelola pesanan dari pelanggan yang harus diproses di gudang.</p>
        </div>
      </header>

      <div className="odGudang__stats">
        {stats.map((s, i) => (
          <Card key={i} className="rqGudang__statCard">
            <div className="rqGudang__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="rqGudang__statMain">
              <p className="rqGudang__statLabel">{s.label}</p>
              <h3 className="rqGudang__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.sub}</span></h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="odGudang__filterBar">
         <div className="moAdmin__searchWrap" style={{ flex: 1 }}>
            <span className="moAdmin__searchIcon">🔍</span>
            <input placeholder="Cari ID Order, pelanggan, atau kurir..." style={{ padding: '10px 12px 10px 32px' }} />
         </div>
         <select className="moAdmin__select"><option>Status Order</option></select>
         <button className="btn-reset-filter">Reset</button>
      </div>

      <div className="odGudang__tableCard">
        <table className="odGudang__table">
          <thead>
            <tr>
              <th>ID Order</th>
              <th>Waktu</th>
              <th>Pelanggan</th>
              <th>Detail Item</th>
              <th>Total (Rp)</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>{o.id}</td>
                <td>{o.time}</td>
                <td><b>{o.customer}</b></td>
                <td style={{ fontSize: '12px', color: '#666' }}>{o.items}</td>
                <td style={{ fontWeight: 700 }}>Rp {fmtIDR(o.total)}</td>
                <td>
                  <span className={`status-tag ${o.status.toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="pageAdmin__btnSmall">Proses</button>
                    <button className="btn-icon">👁️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
