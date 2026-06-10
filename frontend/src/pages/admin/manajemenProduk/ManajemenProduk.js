import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeWarehouseStock, subscribeBranches, editWarehouseStock, deleteWarehouseStock } from "../../../services/wmsApi";
import "../PageAdmin.css";
import "./ManajemenProdukAdmin.css";

export default function ManajemenProduk() {
  const navigate = useNavigate();
  const [allStock, setAllStock] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Modal State
  const [editModal, setEditModal] = useState(null);
  const [editQty, setEditQty] = useState(0);
  
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

      // Mock image agar terlihat bagus sementara
      let mockImage = "";
      const cat = (stock.type || stock.category || "Umum").toLowerCase();
      if (cat === "elektronik") mockImage = "https://images.unsplash.com/photo-1558494949-ef0109583a85?w=200&h=200&fit=crop";
      else if (cat === "minuman") mockImage = "https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop";
      else if (cat === "pakaian") mockImage = "https://images.unsplash.com/photo-1586864387917-f538a5a94781?w=200&h=200&fit=crop";
      else mockImage = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop";

      return {
        ...stock,
        branchName: branch.name,
        branchType: branch.type.toLowerCase(),
        stockStatus,
        price: stock.price || mockPrice,
        image: stock.image || mockImage
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

      {/* MAIN GRID */}
      <div className="mpAdmin__grid">
        {filteredStocks.filter(p => p.qty > 0).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888', gridColumn: '1 / -1' }}>
            Data inventaris kosong atau tidak ada stok yang cocok dengan filter.
          </div>
        ) : (
          filteredStocks.filter(p => p.qty > 0).map((p, i) => {
            const isAman = p.stockStatus === 'Aman';
            const isHabis = p.stockStatus === 'Habis';
            const badgeClass = isAman ? 'aman' : isHabis ? 'habis' : 'rendah';
            
            return (
              <div key={`${p.sku}-${p.branchId}-${i}`} className="mpAdmin__productCard">
                <span className={`mpAdmin__badge ${badgeClass}`}>
                  ● {p.stockStatus}
                </span>
                <div className="mpAdmin__imgWrap">
                  {p.image ? <img src={p.image} alt={p.name} /> : "📦"}
                </div>
                <h4 className="mpAdmin__prodName">{p.name}</h4>
                <p className="mpAdmin__prodSKU">{p.sku}</p>
                <div className="mpAdmin__prodMeta">
                  <div><span>Kategori:</span> <b>{p.type || "General"}</b></div>
                  <div><span>Lokasi:</span> <b>{p.branchName}</b></div>
                  <div>
                    <span>Tipe Cabang:</span> 
                    <b style={{
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '9px',
                      background: p.branchType === 'gudang' ? '#e6f7ff' : '#fff7e6',
                      color: p.branchType === 'gudang' ? '#1890ff' : '#fa8c16'
                    }}>
                      {p.branchType.toUpperCase()}
                    </b>
                  </div>
                </div>
                <div className="mpAdmin__stockRow">
                  <span>Sisa Stok (Fisik)</span>
                  <b className={`mpAdmin__stockValue ${badgeClass}`}>{p.qty} Unit</b>
                </div>
                <div className="mpAdmin__prodActions">
                  <button 
                    className="btn-icon" 
                    title="Edit Stok Manual" 
                    onClick={() => { setEditModal(p); setEditQty(p.qty); }}
                  >✏️</button>
                  <button 
                    className="btn-icon btn-icon--danger" 
                    title="Hapus Produk"
                    onClick={() => {
                      if(window.confirm(`Hapus produk ${p.name}?`)) {
                        deleteWarehouseStock(p.sku, p.branchId);
                      }
                    }}
                  >🗑️</button>
                  <button 
                    className="btn-icon" 
                    title="Detail Pergerakan Stok"
                    onClick={() => navigate('/admin/laporan')}
                  >📊</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {editModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setEditModal(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>Edit Stok Manual</h3>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Ubah jumlah fisik untuk produk <b>{editModal.name}</b></p>
              
              <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Sisa Stok (Fisik) Terbaru</label>
                <input 
                  type="number" 
                  value={editQty} 
                  onChange={(e) => setEditQty(Number(e.target.value))} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => setEditModal(null)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}
                >Batal</button>
                <button 
                  onClick={() => {
                    editWarehouseStock(editModal.sku, editModal.branchId, editQty);
                    setEditModal(null);
                  }}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >Simpan Perubahan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
