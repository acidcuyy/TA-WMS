import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeWarehouseStock, addWarehouseStock, editWarehouseStock } from "../../../services/wmsApi";
import "../../admin/PageAdmin.css";
import "../../admin/manajemenProduk/ManajemenProdukAdmin.css";

export default function StokGudang() {
  const navigate = useNavigate();
  const [allStock, setAllStock] = useState([]);
  
  // Modal State
  const [editModal, setEditModal] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [addModal, setAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    cat: "General",
    customCat: "",
    qty: 0,
    image: ""
  });
  
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  
  useEffect(() => {
    const unsubStock = subscribeWarehouseStock((data) => setAllStock(data || []));
    return () => {
      if (unsubStock) unsubStock();
    };
  }, []);

  // Map the stock
  const mappedStocks = useMemo(() => {
    return allStock.map(stock => {
      let stockStatus = "Aman";
      if (stock.qty === 0) stockStatus = "Habis";
      else if (stock.qty <= (stock.minQty || 20)) stockStatus = "Stok rendah";

      // Mock image agar terlihat bagus sementara
      let mockImage = "";
      if (stock.type === "Elektronik") mockImage = "https://images.unsplash.com/photo-1558494949-ef0109583a85?w=200&h=200&fit=crop";
      else if (stock.type === "Minuman") mockImage = "https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop";
      else if (stock.type === "Pakaian") mockImage = "https://images.unsplash.com/photo-1586864387917-f538a5a94781?w=200&h=200&fit=crop";
      else mockImage = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop";

      return {
        ...stock,
        stockStatus,
        image: stock.image || mockImage
      };
    });
  }, [allStock]);

  // Aplikasikan Filter
  const filteredStocks = useMemo(() => {
    return mappedStocks.filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.sku?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "Semua" ? true : s.stockStatus.toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [mappedStocks, search, filterStatus]);

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
      { label: "Stok Habis (Kosong)", value: stokHabis, hint: "Tidak tersedia di gudang", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
    ];
  }, [filteredStocks]);

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mpAdmin__head">
        <div>
          <h1 className="mpAdmin__title">Stok & Produk</h1>
          <p className="mpAdmin__subtitle">
            Lihat informasi stok barang dan kelola data produk di gudang secara langsung.
          </p>
        </div>
        <div className="mpAdmin__headRight" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="mtAdmin__badge mtAdmin__badge--live">
            <span className="mtAdmin__dot" />
            Live Inventory
          </span>
          <button 
            className="btn-add-stock" 
            style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setAddModal(true)}
          >
            <span style={{ fontSize: '16px' }}>+</span> Tambah Produk
          </button>
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
          <select 
            className="mpAdmin__select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="Aman">Aman</option>
            <option value="Stok rendah">Stok Menipis</option>
            <option value="Habis">Habis</option>
          </select>

          <button 
            className="btn-icon" 
            title="Reset Filter"
            onClick={() => {
              setSearch("");
              setFilterStatus("Semua");
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mpAdmin__grid">
        {filteredStocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888', gridColumn: '1 / -1' }}>
            Data inventaris kosong atau tidak ada stok yang cocok dengan filter.
          </div>
        ) : (
          filteredStocks.map((p, i) => {
            const isAman = p.stockStatus === 'Aman';
            const isHabis = p.stockStatus === 'Habis';
            const badgeClass = isAman ? 'aman' : isHabis ? 'habis' : 'rendah';
            
            return (
              <div key={`${p.sku}-${i}`} className="mpAdmin__productCard">
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
                    showToast(`Stok ${editModal.name} berhasil diperbarui menjadi ${editQty} unit!`);
                    setEditModal(null);
                  }}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >Simpan Perubahan</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {addModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setAddModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '500px', maxWidth: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>Tambah Produk Baru</h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Masukkan detail produk untuk ditambahkan ke gudang secara manual.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>Nama Barang</label>
                  <input 
                    type="text" 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                    placeholder="Contoh: Lampu LED 12W"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>Kode Barang / SKU</label>
                  <input 
                    type="text" 
                    value={newProduct.sku} 
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} 
                    placeholder="Contoh: LED-012"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>Kategori</label>
                  <select 
                    value={newProduct.cat}
                    onChange={(e) => setNewProduct({...newProduct, cat: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="General">General</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Pakaian">Pakaian</option>
                    <option value="Bahan Bangunan">Bahan Bangunan</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Lainnya">Lainnya (Ketik Sendiri)</option>
                  </select>
                </div>
                {newProduct.cat === "Lainnya" && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>Sebutkan Jenis Barang</label>
                    <input 
                      type="text" 
                      value={newProduct.customCat} 
                      onChange={(e) => setNewProduct({...newProduct, customCat: e.target.value})} 
                      placeholder="Masukkan jenis barang..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>Sisa Stok Fisik</label>
                  <input 
                    type="number" 
                    value={newProduct.qty} 
                    onChange={(e) => setNewProduct({...newProduct, qty: Number(e.target.value)})} 
                    placeholder="0"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Foto Barang</label>
                  <div style={{
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '12px', 
                    padding: '24px 16px', 
                    textAlign: 'center', 
                    background: '#f8fafc',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_WIDTH = 400;
                              const MAX_HEIGHT = 400;
                              let width = img.width;
                              let height = img.height;

                              if (width > height) {
                                if (width > MAX_WIDTH) {
                                  height *= MAX_WIDTH / width;
                                  width = MAX_WIDTH;
                                }
                              } else {
                                if (height > MAX_HEIGHT) {
                                  width *= MAX_HEIGHT / height;
                                  height = MAX_HEIGHT;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx.drawImage(img, 0, 0, width, height);
                              
                              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                              setNewProduct({...newProduct, image: dataUrl});
                            };
                            img.src = event.target.result;
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', zIndex: 10 }}
                    />
                    
                    {!newProduct.image ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '28px' }}>📸</span>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Klik atau Drop foto di sini</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Maks. ukuran 2MB (JPG/PNG)</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={newProduct.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                        <span style={{ fontSize: '12px', color: '#1890ff', fontWeight: 600, background: '#e6f7ff', padding: '4px 12px', borderRadius: '4px' }}>Ubah Foto</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => setAddModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}
                >Batal</button>
                <button 
                  onClick={() => {
                    const typeToSave = newProduct.cat === "Lainnya" ? newProduct.customCat : newProduct.cat;
                    addWarehouseStock({
                      name: newProduct.name || "Produk Tanpa Nama",
                      sku: newProduct.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
                      type: typeToSave,
                      qty: newProduct.qty || 0,
                      image: newProduct.image || null
                    });
                    showToast(`Produk ${newProduct.name || "Baru"} berhasil ditambahkan!`);
                    setAddModal(false);
                    setNewProduct({ name: "", sku: "", cat: "General", customCat: "", qty: 0, image: "" });
                  }}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >Tambah Produk</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '32px',
              right: '32px',
              background: '#52c41a',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              zIndex: 10000,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '20px' }}>✅</span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
