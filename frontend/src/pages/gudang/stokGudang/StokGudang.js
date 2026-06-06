import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "../../../components/common/Card";
import "./StokGudang.css";
import { subscribeWarehouseStock } from "../../../services/wmsApi";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function StokGudang() {
  const [activeTab, setActiveTab] = useState("Semua Produk");
  const [dbItems, setDbItems] = useState([]);

  useEffect(() => {
    const unsub = subscribeWarehouseStock(setDbItems);
    return () => unsub?.();
  }, []);

  const products = useMemo(() => {
    const mock = [
      { id: 1, name: "Pipa PVC 1/2 Inch", sku: "PPI-001", cat: "Plumbing", unit: "Pcs", rack: "PLB", stock: 450, value: 45000000, status: "Aman", active: true, image: "" },
      { id: 2, name: "Elbow PVC 1/2 Inch", sku: "ELB-001", cat: "Plumbing", unit: "Pcs", rack: "PLB", stock: 320, value: 28880000, status: "Aman", active: true, image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop" },
      { id: 3, name: "Fitting T 1/2 Inch", sku: "FIT-001", cat: "Plumbing", unit: "Pcs", rack: "PLB", stock: 120, value: 9600000, status: "Menipis", active: true, image: "https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop" },
      { id: 4, name: "Lem PVC 100ml", sku: "LEM-001", cat: "Plumbing", unit: "Pcs", rack: "PLB", stock: 85, value: 2575000, status: "Menipis", active: true, image: "https://images.unsplash.com/photo-1530124560676-4cb383637180?w=200&h=200&fit=crop" },
      { id: 5, name: "Kabel NYM 3x1.5mm", sku: "KAB-001", cat: "Elektrikal", unit: "Meter", rack: "ELK", stock: 380, value: 114000000, status: "Aman", active: true, image: "https://images.unsplash.com/photo-1558494949-ef0109583a85?w=200&h=200&fit=crop" },
      { id: 6, name: "Lampu LED 12W Putih", sku: "LED-012", cat: "Elektrikal", unit: "Pcs", rack: "ELK", stock: 240, value: 20800000, status: "Aman", active: true, image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop" },
      { id: 7, name: "Stop Kontak Arde", sku: "SKA-001", cat: "Elektrikal", unit: "Pcs", rack: "ELK", stock: 60, value: 3600000, status: "Menipis", active: true, image: "https://images.unsplash.com/photo-1517055727180-d2972fd45244?w=200&h=200&fit=crop" },
      { id: 8, name: "Semen Portland 40kg", sku: "SEM-001", cat: "Bahan Bangunan", unit: "Zak", rack: "BAK", stock: 0, value: 0, status: "Habis", active: false, image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop" },
      { id: 9, name: "Cat Tembok Putih 5kg", sku: "CAT-001", cat: "Bahan Bangunan", unit: "Kaleng", rack: "BAK", stock: 15, value: 1350000, status: "Habis", active: false, image: "https://images.unsplash.com/photo-1589939705384-5185138a047a?w=200&h=200&fit=crop" },
      { id: 10, name: "Baut M8 x 40mm", sku: "BAU-001", cat: "Hardware", unit: "Pcs", rack: "HDW", stock: 200, value: 4000000, status: "Aman", active: true, image: "https://images.unsplash.com/photo-1586864387917-f538a5a94781?w=200&h=200&fit=crop" },
    ];

    if (activeTab === "Aktif") return mock.filter(p => p.active);
    if (activeTab === "Tidak Aktif") return mock.filter(p => !p.active);
    return mock;
  }, [activeTab]);

  const stats = [
    { label: "Total Produk", value: "3.245", sub: "Produk", hint: "Lihat semua produk ›", icon: "📦", color: "#722ed1", bg: "#f9f0ff" },
    { label: "Total Stok", value: "12.560", sub: "Item", hint: "Nilai: Rp 2.450.000.000", icon: "🏠", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Stok Tersedia", value: "11.230", sub: "Item", hint: "● 89.4% dari total stok", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
    { label: "Stok Menipis", value: "520", sub: "Item", hint: "● 16.0% dari total produk", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Stok Habis", value: "180", sub: "Item", hint: "● 5.5% dari total produk", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
  ];

  return (
    <div className="gdash">
      <div className="spGudang">
        {/* HEADER */}
        <header className="spGudang__head">
          <div>
            <h1 className="spGudang__title">Stok & Produk</h1>
            <p className="spGudang__subtitle">Lihat informasi stok barang dan kelola data produk di gudang.</p>
            <div className="trBarang__breadcrumb">
              <span>Gudang</span> <span>›</span> <span style={{ color: '#e4915a', fontWeight: 700 }}>Stok & Produk</span>
            </div>
          </div>
          <button className="logout-btn" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f86c14', color: 'white' }}>
            <span style={{ fontSize: '18px' }}>+</span> Tambah Produk
          </button>
        </header>

        {/* STATS */}
        <div className="spGudang__stats">
          {stats.map((s, i) => (
            <Card key={i} className="spGudang__statCard">
              <div className="spGudang__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="spGudang__statMain">
                <p className="spGudang__statLabel">{s.label}</p>
                <h3 className="spGudang__statValue">{s.value} <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{s.sub}</span></h3>
                <p className="spGudang__statHint" style={{ color: s.color === "#52c41a" ? "#52c41a" : s.color === "#fa8c16" ? "#fa8c16" : s.color === "#ff4d4f" ? "#ff4d4f" : "#888" }}>{s.hint}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="spGudang__filterBar">
          <select className="moAdmin__select"><option>Semua Kategori</option></select>
          <select className="moAdmin__select"><option>Semua Satuan</option></select>
          <select className="moAdmin__select"><option>Semua Lokasi Rak</option></select>
          <select className="moAdmin__select"><option>Status Stok</option></select>
          <div className="moAdmin__searchWrap" style={{ flex: 1 }}>
            <span className="moAdmin__searchIcon">🔍</span>
            <input placeholder="Cari nama produk, SKU, atau barcode..." style={{ padding: '10px 12px 10px 32px' }} />
          </div>
          <button className="btn-reset-filter">Reset</button>
        </div>

        {/* TABS */}
        <div className="spGudang__tabs">
          {["Semua Produk", "Aktif", "Tidak Aktif"].map(tab => (
            <div
              key={tab}
              className={`spGudang__tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="spGudang__mainGrid">
          <div className="spGudang__leftCol">
            <div className="spGudang__grid">
              {products.map((p) => (
                <div key={p.id} className="spGudang__productCard">
                  <span className={`spGudang__badge ${p.status.toLowerCase()}`}>
                    ● {p.status}
                  </span>
                  <div className="spGudang__imgWrap">
                    <img src={p.image} alt={p.name} />
                  </div>
                  <h4 className="spGudang__prodName">{p.name}</h4>
                  <p className="spGudang__prodSKU">{p.sku}</p>
                  <div className="spGudang__prodMeta">
                    <div>Kategori: <b>{p.cat}</b></div>
                    <div>Satuan: <b>{p.unit}</b></div>
                    <div>Rak: <b>{p.rack}</b></div>
                  </div>
                  <div className="spGudang__stockRow">
                    <span>Stok Tersedia</span>
                    <b className={`spGudang__stockValue ${p.status.toLowerCase()}`}>{p.stock}</b>
                  </div>
                  <div className="spGudang__stockRow">
                    <span>Nilai Stok</span>
                    <b className="spGudang__stockValue">Rp {fmtIDR(p.value)}</b>
                  </div>
                  <div className="spGudang__prodActions">
                    <button className="btn-icon">👁️</button>
                    <button className="btn-icon">⋮</button>
                  </div>
                </div>
              ))}
            </div>

            <footer className="spGudang__footer">
              <span style={{ fontSize: '12px', color: '#888' }}>Menampilkan 1 - 10 dari 3.245 data</span>
              <div className="pagination">
                <select className="mpAdmin__select" style={{ padding: '4px 8px' }}><option>10 / halaman</option></select>
                <div className="page-controls">
                  <button disabled>⟨</button>
                  <button className="active">1</button>
                  <button>2</button>
                  <button>3</button>
                  <span>...</span>
                  <button>325</button>
                  <button>⟩</button>
                </div>
              </div>
            </footer>
          </div>

          <div className="spGudang__sideStack">
            <div className="spGudang__sideCard">
              <div className="spGudang__sideHead">
                <h3>Ringkasan Stok</h3>
                <button className="btn-icon">📥</button>
              </div>
              <div className="donut-container">
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#52c41a" strokeWidth="4" strokeDasharray="89.4 100" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#fa8c16" strokeWidth="4" strokeDasharray="16 100" strokeDashoffset="-89.4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#ff4d4f" strokeWidth="4" strokeDasharray="5.5 100" strokeDashoffset="-105.4" />
                </svg>
                <div className="donut-text">
                  <span>Total</span>
                  <strong>12.560</strong>
                  <span>Item</span>
                </div>
              </div>
              <div className="spGudang__list" style={{ gap: '8px' }}>
                {[
                  { label: "Aman", val: "11.230", pct: "89.4%", color: "#52c41a" },
                  { label: "Menipis", val: "520", pct: "16.0%", color: "#fa8c16" },
                  { label: "Habis", val: "180", pct: "5.5%", color: "#ff4d4f" },
                  { label: "Lewat Minimum", val: "95", pct: "3.0%", color: "#722ed1" },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginRight: '8px' }}></span>
                    <span style={{ flex: 1, color: '#666' }}>{s.label}</span>
                    <span style={{ fontWeight: 700 }}>{s.val} ({s.pct})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="spGudang__sideCard">
              <div className="spGudang__sideHead">
                <h3>Top Kategori (Nilai Stok)</h3>
              </div>
              <div className="spGudang__list" style={{ gap: '16px' }}>
                {[
                  { label: "Plumbing", val: "Rp 1.250.000.000", icon: "🔧", color: "#1890ff" },
                  { label: "Elektrikal", val: "Rp 950.000.000", icon: "⚡", color: "#faad14" },
                  { label: "Bahan Bangunan", val: "Rp 180.000.000", icon: "🧱", color: "#ff4d4f" },
                  { label: "Hardware", val: "Rp 70.000.000", icon: "⚙️", color: "#52c41a" },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${c.color}15`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700 }}>{c.label}</div>
                      <div style={{ fontSize: '12px', fontWeight: 800 }}>{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="spGudang__sideCard">
              <div className="spGudang__sideHead">
                <h3>Stok Menipis & Habis</h3>
                <button className="btn-text">Lihat Semua</button>
              </div>
              <div className="spGudang__list">
                {products.filter(p => p.status !== "Aman").slice(0, 5).map((p, i) => (
                  <div key={i} className="spGudang__listItem">
                    <img src={p.image} alt="" />
                    <div className="spGudang__listInfo">
                      <div className="spGudang__listName">{p.name}</div>
                      <div className="spGudang__listStock">{p.stock} / 50 Pcs</div>
                    </div>
                    <div className={`spGudang__listStatus ${p.status.toLowerCase()}`}>{p.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
