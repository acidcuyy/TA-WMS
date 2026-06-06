import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/common/Card";
import "../PageAdmin.css";
import "./ManajemenGudangAdmin.css";
import { 
  subscribeRequests, 
  subscribeBranches, 
  gudangDecideRequest, 
  createBranchAccount,
  deleteBranch 
} from "../../../services/wmsApi";

export default function ManajemenGudang() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);

  // Modal State
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [newBranch, setNewBranch] = useState({ name: "", type: "gudang", location: "" });

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setRequests(rows || []));
    const unsubBranch = subscribeBranches((rows) => {
      setBranches(rows || []);
    });
    return () => {
      unsubReq();
      unsubBranch();
    };
  }, []);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === "Menunggu").length;
    const shipping = requests.filter(r => r.status === "Mengirim").length;
    const done = requests.filter(r => r.status === "Selesai").length;
    return { total, pending, shipping, done };
  }, [requests]);

  // Proof Modal
  const [showProof, setShowProof] = useState(false);
  const [proofImg, setProofImg] = useState(null);

  const handleDecide = async (id, dec) => {
    await gudangDecideRequest(id, dec);
  };

  const handleAddBranch = async () => {
    if (!newBranch.name || !newBranch.location) return alert("Isi semua data!");
    await createBranchAccount(newBranch);
    setShowAddBranch(false);
    setNewBranch({ name: "", type: "gudang", location: "" });
  };

  const handleDeleteBranch = async () => {
    if (branchToDelete) {
      await deleteBranch(branchToDelete);
      setShowDeleteConfirm(false);
      setBranchToDelete(null);
    }
  };

  const openProof = (img) => {
    setProofImg(img);
    setShowProof(true);
  };

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mgAdmin__head">
        <div>
          <h1 className="mgAdmin__title">Monitoring Operasional Perusahaan</h1>
          <p className="mgAdmin__subtitle">
            Pantau seluruh alur request barang dari Toko ke Gudang secara realtime.
          </p>
        </div>
        <div className="mgAdmin__headRight">
          <span className="mgAdmin__badge mgAdmin__badge--live">
            <span className="mgAdmin__dot" />
            Live Monitoring
          </span>
        </div>
      </header>

      {/* STATS */}
      <div className="mgAdmin__stats">
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#e6f7ff', color: '#1890ff' }}>📑</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Total Request</p>
            <h3 className="mgAdmin__statValue">{stats.total}</h3>
            <p className="mgAdmin__statHint">Semua Cabang</p>
          </div>
        </Card>
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#fff7e6', color: '#fa8c16' }}>⏳</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Menunggu ACC</p>
            <h3 className="mgAdmin__statValue" style={{ color: '#fa8c16' }}>{stats.pending}</h3>
            <p className="mgAdmin__statHint">Perlu Perhatian</p>
          </div>
        </Card>
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#e6fffb', color: '#13c2c2' }}>🚚</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Sedang Dikirim</p>
            <h3 className="mgAdmin__statValue" style={{ color: '#13c2c2' }}>{stats.shipping}</h3>
            <p className="mgAdmin__statHint">Dalam Perjalanan</p>
          </div>
        </Card>
        <Card className="mgAdmin__statCard">
          <div className="mgAdmin__statIcon" style={{ background: '#f6ffed', color: '#52c41a' }}>✅</div>
          <div className="mgAdmin__statContent">
            <p className="mgAdmin__statLabel">Selesai</p>
            <h3 className="mgAdmin__statValue" style={{ color: '#52c41a' }}>{stats.done}</h3>
            <p className="mgAdmin__statHint">Berhasil Diterima</p>
          </div>
        </Card>
      </div>

      {/* BRANCHES MONITORING */}
      <div className="mgAdmin__grid" style={{ marginBottom: '30px' }}>
        <section className="mgAdmin__card" style={{ gridColumn: '1 / -1' }}>
          <div className="mgAdmin__cardHead">
            <h3><span>🏢</span> Daftar Cabang (Gudang & Toko)</h3>
            <button className="btn-upload" onClick={() => setShowAddBranch(true)}>+ Tambah Cabang</button>
          </div>
          <div className="mgAdmin__tableWrap">
            <table className="mgAdmin__table">
              <thead>
                <tr>
                  <th>ID Cabang</th>
                  <th>Nama Cabang</th>
                  <th>Tipe</th>
                  <th>Lokasi</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(b => (
                  <tr key={b.id}>
                    <td className="mgAdmin__mono">{b.id}</td>
                    <td><b>{b.name}</b></td>
                    <td><span className={`mgAdmin__pill ${b.type === 'gudang' ? 'mgAdmin__pill--success' : ''}`}>{b.type.toUpperCase()}</span></td>
                    <td>{b.location}</td>
                    <td><span className="mgAdmin__pill mgAdmin__pill--success">Aktif</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                        onClick={() => { setBranchToDelete(b.id); setShowDeleteConfirm(true); }}
                        title="Hapus Cabang"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ALL REQUEST MONITORING */}
      <section className="mgAdmin__card" style={{ width: '100%' }}>
        <div className="mgAdmin__cardHead">
          <h3><span>📑</span> Monitor Seluruh Alur Request</h3>
        </div>
        <div className="mgAdmin__tableWrap">
          <table className="mgAdmin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dari (Toko)</th>
                <th>Ke (Gudang)</th>
                <th>Item</th>
                <th>Status Alur</th>
                <th>Bukti Foto</th>
                <th>Aksi (Admin)</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Belum ada aktivitas request.</td></tr>
              ) : requests.map((r, i) => (
                <tr key={i}>
                  <td className="mgAdmin__mono">{r.id}</td>
                  <td><b>{r.fromName}</b></td>
                  <td>{r.toName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {r.items?.[0]?.code} <span className="mgAdmin__pill" style={{ fontSize: '10px' }}>{r.items?.[0]?.qty} Pcs</span>
                    </div>
                  </td>
                  <td>
                    <span className={`mgAdmin__pill status-${(r.status || "").toLowerCase()}`}>
                      ● {r.status || "Menunggu"}
                    </span>
                  </td>
                  <td>
                    {r.proofImage ? (
                      <span 
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textDecoration: 'underline' }}
                        onClick={() => openProof(r.proofImage)}
                      >
                        Lihat Bukti
                      </span>
                    ) : "-"}
                  </td>
                  <td>
                    {r.status === "Menunggu" && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="mgAdmin__btn mgAdmin__btn--primary" onClick={() => handleDecide(r.id, "Accepted")}>✓ ACC</button>
                        <button className="mgAdmin__btn" onClick={() => handleDecide(r.id, "Declined")}>✕ No</button>
                      </div>
                    )}
                    {r.status === "Mengirim" && <button className="btn-more" onClick={() => navigate(`/admin/pengiriman/${r.id}`)}>📍 Pantau</button>}
                    {r.status === "Selesai" && <span style={{ color: '#52c41a', fontSize: '12px' }}>✓ Berhasil</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL TAMBAH CABANG */}
      <AnimatePresence>
        {showAddBranch && (
          <div className="mgAdmin__modalOverlay" onClick={() => setShowAddBranch(false)}>
            <motion.div 
              className="mgAdmin__modal" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="mgAdmin__modalHead">
                <h3><span>🏢</span> Tambah Cabang Baru</h3>
                <button className="mgAdmin__modalClose" onClick={() => setShowAddBranch(false)}>✕</button>
              </div>
              <div className="mgAdmin__modalBody">
                <div className="mgAdmin__formGroup">
                  <label className="mgAdmin__formLabel">Nama Cabang</label>
                  <input 
                    className="mgAdmin__inputField" 
                    placeholder="Contoh: Gudang Surabaya" 
                    value={newBranch.name}
                    onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="mgAdmin__formGroup">
                  <label className="mgAdmin__formLabel">Tipe Cabang</label>
                  <select 
                    className="mgAdmin__inputField"
                    value={newBranch.type}
                    onChange={e => setNewBranch({ ...newBranch, type: e.target.value })}
                  >
                    <option value="gudang">🏢 GUDANG (Penyimpanan)</option>
                    <option value="toko">🏪 TOKO (Retail)</option>
                  </select>
                </div>
                <div className="mgAdmin__formGroup" style={{ marginBottom: 0 }}>
                  <label className="mgAdmin__formLabel">Lokasi / Kota</label>
                  <input 
                    className="mgAdmin__inputField" 
                    placeholder="Contoh: Surabaya, Jawa Timur" 
                    value={newBranch.location}
                    onChange={e => setNewBranch({ ...newBranch, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="mgAdmin__modalFooter">
                <button className="mgAdmin__btnAction mgAdmin__btnAction--cancel" onClick={() => setShowAddBranch(false)}>Batal</button>
                <button className="mgAdmin__btnAction mgAdmin__btnAction--save" onClick={handleAddBranch}>Simpan Cabang</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL LIHAT BUKTI */}
      <AnimatePresence>
        {showProof && (
          <div className="mgAdmin__modalOverlay" onClick={() => setShowProof(false)}>
            <motion.div 
              className="mgAdmin__modal" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="mgAdmin__modalHead">
                <h3><span>📸</span> Bukti Penerimaan Barang</h3>
                <button className="mgAdmin__modalClose" onClick={() => setShowProof(false)}>✕</button>
              </div>
              <div className="mgAdmin__modalBody" style={{ textAlign: 'center', background: '#f8fafc' }}>
                {proofImg ? (
                  <img src={proofImg} alt="Bukti Foto" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '4px solid white' }} />
                ) : (
                  <p style={{ color: '#888', padding: '40px' }}>Tidak ada foto bukti.</p>
                )}
              </div>
              <div className="mgAdmin__modalFooter">
                <button className="mgAdmin__btnAction mgAdmin__btnAction--save" style={{ width: '100%' }} onClick={() => setShowProof(false)}>Tutup</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL HAPUS CABANG CONFIRMATION */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="mgAdmin__modalOverlay" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div 
              className="mgAdmin__modal" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ maxWidth: '400px' }}
            >
              <div className="mgAdmin__modalHead">
                <h3><span>⚠️</span> Konfirmasi Hapus</h3>
                <button className="mgAdmin__modalClose" onClick={() => setShowDeleteConfirm(false)}>✕</button>
              </div>
              <div className="mgAdmin__modalBody" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '50px', marginBottom: '16px' }}>🗑️</div>
                <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800 }}>Hapus Cabang Ini?</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  Tindakan ini tidak dapat dibatalkan. Data cabang <b>{branchToDelete}</b> akan dihapus secara permanen dari sistem.
                </p>
              </div>
              <div className="mgAdmin__modalFooter">
                <button className="mgAdmin__btnAction mgAdmin__btnAction--cancel" onClick={() => setShowDeleteConfirm(false)}>Batal</button>
                <button 
                  className="mgAdmin__btnAction" 
                  style={{ background: '#ff4d4f', color: 'white', border: 'none' }} 
                  onClick={handleDeleteBranch}
                >
                  Ya, Hapus Cabang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
