import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./PageAdmin.css";
import "./ManajemenProdukAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function ManajemenProduk() {
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  const stats = [
    { label: "Total Produk", value: 248, hint: "Semua produk terdaftar", icon: "🏠", color: "#e4915a", bg: "#fff8f3" },
    { label: "Produk Aktif", value: 218, hint: "87.9% dari total produk", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
    { label: "Stok Rendah", value: 12, hint: "Perlu perhatian", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Produk Nonaktif", value: 18, hint: "Tidak aktif / diarsipkan", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
  ];

  const products = [
    {
      id: 1,
      name: "Lampu LED 12W",
      variant: "Putih - 12W",
      sku: "LED-12W",
      barcode: "8991234567890",
      category: "Elektronik",
      price: 25000,
      stock: 150,
      stockStatus: "Aman",
      status: "Aktif",
      toko: ["Toko A", "Toko B"],
    },
    {
      id: 2,
      name: "Kabel NYM 3x1.5mm",
      variant: "Roll 50m",
      sku: "KBL-NYM-31.5",
      barcode: "8991234567891",
      category: "Elektronik",
      price: 450000,
      stock: 8,
      stockStatus: "Stok rendah",
      status: "Aktif",
      toko: ["Toko A"],
    },
    {
      id: 3,
      name: "Kran Air Stainless",
      variant: "1/2 inch",
      sku: "KRN-SS-12",
      barcode: "8991234567892",
      category: "Plumbing",
      price: 85000,
      stock: 0,
      stockStatus: "Habis",
      status: "Aktif",
      toko: ["Toko B", "Toko C"],
    },
    {
      id: 4,
      name: "Cat Tembok 5kg",
      variant: "Putih",
      sku: "CTT-5KG-P",
      barcode: "8991234567893",
      category: "Bahan Bangunan",
      price: 120000,
      stock: 23,
      stockStatus: "Aman",
      status: "Aktif",
      toko: ["Toko A", "Toko C"],
    },
    {
      id: 5,
      name: "Lampu LED Strip 5m",
      variant: "Warm White",
      sku: "LED-STRIP-5M",
      barcode: "8991234567894",
      category: "Elektronik",
      price: 75000,
      stock: 5,
      stockStatus: "Stok rendah",
      status: "Nonaktif",
      toko: ["Toko A"],
    },
  ];

  const categories = [
    { label: "Elektronik", count: 98, perc: 39.5, color: "#4a90e2" },
    { label: "Plumbing", count: 64, perc: 25.8, color: "#52c41a" },
    { label: "Bahan Bangunan", count: 56, perc: 22.6, color: "#e4915a" },
    { label: "Lainnya", count: 30, perc: 12.1, color: "#8c8c8c" },
  ];

  const recentProducts = [
    { name: "Stop Kontak Arde", sku: "SK-ARDE", cat: "Elektronik", date: "02 Feb 2026, 14:30", status: "Aktif" },
    { name: "Sealant Silicone Putih", sku: "SIL-WHT", cat: "Bahan Bangunan", date: "02 Feb 2026, 11:15", status: "Aktif" },
    { name: "Pipa PVC 1/2 inch", sku: "PVC-12", cat: "Plumbing", date: "01 Feb 2026, 16:45", status: "Aktif" },
    { name: "Sak Semen 40kg", sku: "SEM-40KG", cat: "Bahan Bangunan", date: "01 Feb 2026, 10:20", status: "Aktif" },
    { name: "Gembok 50mm", sku: "GB-50", cat: "Perkakas", date: "31 Jan 2026, 09:05", status: "Aktif" },
  ];

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mpAdmin__head">
        <div>
          <h1 className="mpAdmin__title">Manajemen Produk</h1>
          <p className="mpAdmin__subtitle">
            Kelola data produk, stok, harga, dan kategori produk dalam sistem.
          </p>
        </div>
        <div className="mpAdmin__headRight">
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
      <div className="mpAdmin__stats">
        {stats.map((s, i) => (
          <Card key={i} className="mpAdmin__statCard">
            <div className="mpAdmin__statIcon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="mpAdmin__statContent">
              <p className="mpAdmin__statLabel">{s.label}</p>
              <h3 className="mpAdmin__statValue">{s.value}</h3>
              <p className="mpAdmin__statHint">{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="mpAdmin__filterBar">
        <div className="mpAdmin__searchWrap">
          <span className="mpAdmin__searchIcon">🔍</span>
          <input placeholder="Cari produk, SKU, atau barcode..." />
        </div>
        <div className="mpAdmin__filterGroup">
          <select className="mpAdmin__select"><option>Semua Kategori</option></select>
          <select className="mpAdmin__select"><option>Semua Status</option></select>
          <select className="mpAdmin__select"><option>Semua Toko</option></select>
          <button className="btn-filter-more"><span>⚙️</span> Filter Lainnya</button>
          <button className="btn-icon" title="Reset Filter">🔄</button>
        </div>
        <button className="btn-add-product"><span>+</span> Tambah Produk</button>
      </div>

      {/* TABLE */}
      <div className="mpAdmin__tableCard">
        <div className="mpAdmin__tableWrap">
          <table className="mpAdmin__table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>SKU / Barcode</th>
                <th>Kategori</th>
                <th>Harga Jual</th>
                <th>Stok</th>
                <th>Status</th>
                <th>Toko</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <div className="recent-img" />
                      <div>
                        <p className="product-name">{p.name}</p>
                        <p className="product-sub">{p.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="sku-cell">
                      <p>{p.sku}</p>
                      <p>{p.barcode}</p>
                    </div>
                  </td>
                  <td>
                    <span className="tag-kategori" style={{ color: p.category === 'Elektronik' ? '#007bff' : '#52c41a', background: p.category === 'Elektronik' ? '#f0f7ff' : '#f6ffed' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>Rp {fmtIDR(p.price)}</td>
                  <td>
                    <div className="stok-cell">
                      <span className="label">{p.stock}</span>
                      <span className={`sub ${p.stockStatus === 'Aman' ? 'safe' : p.stockStatus === 'Habis' ? 'out' : 'low'}`}>
                        {p.stockStatus}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${p.status === 'Aktif' ? 'status-pill--active' : 'status-pill--inactive'}`}>
                      ● {p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{p.toko.join(", ")}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon">✏️</button>
                      <button className="btn-icon">📦</button>
                      <button className="btn-icon">⋮</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="mpAdmin__bottomGrid">
        {/* KATEGORI */}
        <section className="mpAdmin__card">
          <div className="mpAdmin__cardHead">
            <h3>Kategori Produk</h3>
            <button className="btn-lihat-semua-link" style={{ width: 'auto', margin: 0 }}>Kelola Kategori</button>
          </div>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Ringkasan kategori produk</p>
          <div className="category-list">
            {categories.map((c, i) => (
              <div key={i} className="category-item">
                <div className="category-info">
                  <div className="category-label">
                    <span style={{ color: c.color, fontSize: '18px' }}>■</span> {c.label}
                  </div>
                  <span className="category-count">{c.count} produk</span>
                </div>
                <div className="category-progress">
                  <div className="progress-bar" style={{ width: `${c.perc}%`, background: c.color }} />
                  <span className="progress-perc">{c.perc}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RECENT PRODUCTS */}
        <section className="mpAdmin__card">
          <div className="mpAdmin__cardHead">
            <h3>Produk Terbaru</h3>
            <button className="btn-lihat-semua-link" style={{ width: 'auto', margin: 0 }}>Lihat Semua Produk</button>
          </div>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>5 produk terakhir yang ditambahkan</p>
          <div className="recent-list">
            {recentProducts.map((rp, i) => (
              <div key={i} className="recent-product-row">
                <div className="recent-img" />
                <div className="recent-main">
                  <p className="recent-name">{rp.name}</p>
                  <p className="recent-sku">{rp.sku}</p>
                </div>
                <div className="recent-cat">{rp.cat}</div>
                <div className="recent-date">{rp.date}</div>
                <div className="status-pill status-pill--active">● {rp.status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
