import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeWarehouseStock, subscribeBranches } from "../../../services/wmsApi";
import "../PageAdmin.css";
import "./ManajemenProdukAdmin.css";

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export default function ManajemenProduk() {
  const [allStock, setAllStock] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Semua"); // Semua, Gudang, Toko
  const [filterBranchId, setFilterBranchId] = useState("Semua"); // ID cabang tertentu
  
  useEffect(() => {
    const unsubStock = subscribeWarehouseStock((data) => setAllStock(data || []));
    const unsubBranches = subscribeBranches((data) => setBranches(data || []));
    return () => {
      unsubStock();
      unsubBranches();
    };
  }, []);

  // Memetakan stock dengan data cabang
  const mappedStocks = useMemo(() => {
    return allStock.map(stock => {
      const branch = branches.find(b => b.id === stock.branchId) || { name: "Unknown", type: "unknown" };
      let stockStatus = "Aman";
      if (stock.qty === 0) stockStatus = "Habis";
      else if (stock.qty <= (stock.minQty || 20)) stockStatus = "Stok rendah";

      // Mock harga jika belum ada (krn di db saat ini belum ada kolom price)
      const mockPrice = stock.type === "Elektronik" ? 450000 : stock.type === "Minuman" ? 8000 : 25000;

      return {
        ...stock,
        branchName: branch.name,
        branchType: branch.type.toLowerCase(),
        stockStatus,
        price: stock.price || mockPrice
      };
    });
  }, [allStock, branches]);

  // Aplikasikan Filter
  const filteredStocks = useMemo(() => {
    return mappedStocks.filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.sku?.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "Semua" ? true : s.branchType === filterType.toLowerCase();
      const matchBranch = filterBranchId === "Semua" ? true : s.branchId === filterBranchId;
      return matchSearch && matchType && matchBranch;
    });
  }, [mappedStocks, search, filterType, filterBranchId]);

  // Statistik
  const stats = useMemo(() => {
    const totalProdukUnik = new Set(filteredStocks.map(s => s.sku)).size;
    const totalItemFisik = filteredStocks.reduce((sum, s) => sum + s.qty, 0);
    const stokHabis = filteredStocks.filter(s => s.qty === 0).length;
    const stokRendah = filteredStocks.filter(s => s.qty > 0 && s.qty <= (s.minQty || 20)).length;

    return [
      { label: "Macam Produk", value: totalProdukUnik, hint: "SKU unik yang ditampilkan", icon: "📦", color: "#e4915a", bg: "#fff8f3" },
      { label: "Total Item Fisik", value: totalItemFisik, hint: "Jumlah Pcs keseluruhan", icon: "📊", color: "#4a90e2", bg: "#f0f7ff" },
      { label: "Stok Menipis", value: stokRendah, hint: "Butuh perhatian/restock", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Stok Habis (Kosong)", value: stokHabis, hint: "Tidak tersedia di cabang", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
    ];
  }, [filteredStocks]);

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mpAdmin__head">
        <div>
          <h1 className="mpAdmin__title">Inventaris & Stok Global</h1>
          <p className="mpAdmin__subtitle">
            Pantau seluruh stok produk yang tersebar di setiap Gudang dan Toko secara langsung.
          </p>
        </div>
        <div className="mpAdmin__headRight">
          <span className="mtAdmin__badge mtAdmin__badge--live">
            <span className="mtAdmin__dot" />
            Live Inventory
          </span>
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
        <div className="mpAdmin__searchWrap" style={{ flex: 1 }}>
          <span className="mpAdmin__searchIcon">🔍</span>
          <input 
            placeholder="Cari nama produk atau SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mpAdmin__filterGroup">
          {/* Filter Tipe Cabang */}
          <select 
            className="mpAdmin__select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterBranchId("Semua"); // reset spesifik cabang kalau ubah tipe
            }}
          >
            <option value="Semua">Semua Lokasi</option>
            <option value="Gudang">Gudang Saja</option>
            <option value="Toko">Toko Saja</option>
          </select>

          {/* Filter Spesifik Cabang */}
          <select 
            className="mpAdmin__select"
            value={filterBranchId}
            onChange={(e) => setFilterBranchId(e.target.value)}
          >
            <option value="Semua">-- Pilih Cabang --</option>
            {branches
              .filter(b => filterType === "Semua" || b.type.toLowerCase() === filterType.toLowerCase())
              .map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.type.toUpperCase()})</option>
              ))
            }
          </select>

          <button 
            className="btn-icon" 
            title="Reset Filter"
            onClick={() => {
              setSearch("");
              setFilterType("Semua");
              setFilterBranchId("Semua");
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="mpAdmin__tableCard">
        <div className="mpAdmin__tableWrap">
          <table className="mpAdmin__table">
            <thead>
              <tr>
                <th>Produk & SKU</th>
                <th>Kategori</th>
                <th>Lokasi Cabang</th>
                <th>Sisa Stok (Fisik)</th>
                <th>Status Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    Data inventaris kosong atau tidak ada stok yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((p, i) => (
                  <tr key={`${p.sku}-${p.branchId}-${i}`}>
                    <td>
                      <div className="product-cell">
                        <div className="recent-img" style={{ borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          📦
                        </div>
                        <div>
                          <p className="product-name" style={{ fontSize: '14px' }}>{p.name}</p>
                          <p className="product-sub" style={{ fontSize: '12px', color: '#64748b' }}>SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="tag-kategori" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {p.type || "General"}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.branchName}</span>
                        <br/>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          background: p.branchType === 'gudang' ? '#e6f7ff' : '#fff7e6',
                          color: p.branchType === 'gudang' ? '#1890ff' : '#fa8c16'
                        }}>
                          {p.branchType.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        {p.qty} <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>Unit</span>
                      </div>
                    </td>
                    <td>
                      <span className={`sub ${p.stockStatus === 'Aman' ? 'safe' : p.stockStatus === 'Habis' ? 'out' : 'low'}`} style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '20px' }}>
                        {p.stockStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title="Edit Stok Manual">✏️</button>
                        <button className="btn-icon" title="Detail Pergerakan Stok">📊</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
