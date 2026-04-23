import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./PageAdmin.css";
import "./ManajemenStokAdmin.css";

const LS_KEY_GUDANG_NOTIF = "reastock_notifications_gudang_v1";

export default function ManajemenStok() {
  const summary = useMemo(() => {
    return {
      totalPerusahaan: 2104,
      stokGudang: 1860,
      stokToko: 244,
    };
  }, []);

  const [requests, setRequests] = useState([
    {
      id: "ADD-001",
      tanggal: "02 Feb 2026, 09:12",
      barang: "BRG-002 (Lampu LED)",
      kategori: "Elektronik",
      jumlah: 50,
      catatan: "Tambah stok untuk promo akhir pekan",
      status: "Selesai",
    },
    {
      id: "ADD-002",
      tanggal: "02 Feb 2026, 14:30",
      barang: "BRG-010 (Kabel 10m)",
      kategori: "Elektronik",
      jumlah: 20,
      catatan: "Restock rutin",
      status: "Pending",
    },
    {
      id: "ADD-003",
      tanggal: "03 Feb 2026, 10:05",
      barang: "BRG-017 (Kran Air)",
      kategori: "Plumbing",
      jumlah: 15,
      catatan: "Permintaan owner",
      status: "Pending",
    },
  ]);

  const [openForm, setOpenForm] = useState(false);
  const [sentBanner, setSentBanner] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    kodeBarang: "",
    namaBarang: "",
    kategori: "Elektronik",
    jumlah: "",
    satuan: "pcs",
    supplier: "",
    prioritas: "Normal",
    catatan: "",
  });

  const resetForm = () => {
    setForm({
      kodeBarang: "",
      namaBarang: "",
      kategori: "Elektronik",
      jumlah: "",
      satuan: "pcs",
      supplier: "",
      prioritas: "Normal",
      catatan: "",
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.kodeBarang || !form.namaBarang || !form.jumlah) {
      setToast("Mohon lengkapi data utama.");
      return;
    }

    const newReq = {
      id: `ADD-${String(requests.length + 1).padStart(3, "0")}`,
      tanggal: new Date().toLocaleString("id-ID", { day: "2d", month: "short", year: "numeric", hour: "2d", minute: "2d" }),
      barang: `${form.kodeBarang} (${form.namaBarang})`,
      kategori: form.kategori,
      jumlah: Number(form.jumlah),
      catatan: form.catatan || "Restock rutin",
      status: "Pending",
    };

    setRequests([newReq, ...requests]);
    setOpenForm(false);
    resetForm();
    setSentBanner("Request penambahan stok berhasil dikirim.");
    setTimeout(() => setSentBanner(""), 3000);
  };

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="stokAdm__hero">
        <div>
          <h1 className="stokAdm__title">Manajemen Stok Gudang</h1>
          <p className="stokAdm__subtitle">
            Monitoring stok perusahaan dan permintaan penambahan stok gudang.
          </p>
        </div>
        <div className="stokAdm__heroBadge">
          <span className="user-icon">👤</span> Admin / Owner <span className="chevron">⌄</span>
        </div>
      </header>

      {sentBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="stokAdm__banner"
        >
          <span className="stokAdm__bannerDot" />
          {sentBanner}
        </motion.div>
      )}

      {/* TOP SECTION: SUMMARY & ACTIONS */}
      <div className="stokAdm__topGrid">
        <section className="stokAdm__panel">
          <div className="stokAdm__panelHead">
            <div>
              <h2>Ringkasan Stok</h2>
              <p>● Real-time (dummy)</p>
            </div>
          </div>

          <div className="stokAdm__cards">
            <div className="stokAdm__metric">
              <div className="stokAdm__metricIcon" style={{ color: "#e4915a", background: "#fff8f3" }}>📦</div>
              <p className="stokAdm__metricLabel">Total Stok Perusahaan</p>
              <h3 className="stokAdm__metricValue">{summary.totalPerusahaan.toLocaleString("id-ID")}</h3>
              <p className="stokAdm__metricSub">Gudang + Toko</p>
            </div>

            <div className="stokAdm__metric">
              <div className="stokAdm__metricIcon" style={{ color: "#4a90e2", background: "#f0f7ff" }}>🏬</div>
              <p className="stokAdm__metricLabel">Stok Tersedia di Gudang</p>
              <h3 className="stokAdm__metricValue">{summary.stokGudang.toLocaleString("id-ID")}</h3>
              <p className="stokAdm__metricSub">Siap distribusi</p>
            </div>

            <div className="stokAdm__metric">
              <div className="stokAdm__metricIcon" style={{ color: "#52c41a", background: "#f6ffed" }}>🏪</div>
              <p className="stokAdm__metricLabel">Stok Tersedia di Toko</p>
              <h3 className="stokAdm__metricValue">{summary.stokToko.toLocaleString("id-ID")}</h3>
              <p className="stokAdm__metricSub">Siap jual</p>
            </div>
          </div>
        </section>

        <aside className="stokAdm__panel">
          <div className="stokAdm__panelHead">
            <div>
              <h2>Aksi</h2>
              <p>Kelola permintaan stok gudang</p>
            </div>
          </div>

          <div className="stokAdm__actionButtons">
            <button className="stokAdm__primaryBtn" onClick={() => setOpenForm(true)}>
              + Tambah Stok Gudang
            </button>
            <button className="stokAdm__ghostBtn" disabled>
              <span className="icon">📤</span> Import (Coming Soon)
            </button>
          </div>

          <div className="stokAdm__note">
            <span className="info-icon">ℹ️</span>
            <p>Saat ini pengiriman request penambahan stok disimulasikan dan disimpan ke <b>localStorage</b> untuk notifikasi gudang.</p>
          </div>
        </aside>
      </div>

      {/* TABLE SECTION */}
      <section className="stokAdm__panel stokAdm__tablePanel">
        <div className="stokAdm__panelHead">
          <div>
            <h2>Riwayat Request Penambahan Stok ke Gudang</h2>
            <p>Status akan berubah setelah gudang melakukan konfirmasi (dummy).</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#888', fontWeight: '600' }}>Total: {requests.length}</span>
            <div className="date-filter">
              📅 Semua Waktu <span className="chevron">⌄</span>
            </div>
          </div>
        </div>

        <div className="stokAdm__tableWrap">
          <table className="stokAdm__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Barang</th>
                <th>Jumlah</th>
                <th>Catatan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="stokAdm__id">{r.id}</td>
                  <td>{r.tanggal}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {r.barang}
                      <span className="tag-kategori">{r.kategori}</span>
                    </div>
                  </td>
                  <td className="stokAdm__qty">{r.jumlah}</td>
                  <td>{r.catatan}</td>
                  <td>
                    <span className={`stokAdm__status stokAdm__status--${r.status.toLowerCase()}`}>
                      ● {r.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-more">⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="table-footer">
          <div className="rows-per-page">
            Rows per page: <select><option>10</option></select>
          </div>
          <div className="pagination">
            <span>Menampilkan 1 - {requests.length} dari {requests.length}</span>
            <div className="page-controls">
              <button disabled>⟨</button>
              <button className="active">1</button>
              <button disabled>⟩</button>
            </div>
          </div>
        </footer>
      </section>

      {/* MODAL FORM */}
      {openForm && (
        <div className="stokAdm__overlay" onClick={() => setOpenForm(false)}>
          <motion.div 
            className="stokAdm__modal" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="stokAdm__modalHead">
              <div>
                <h3>Form Penambahan Stok Gudang</h3>
                <p>Lengkapi data barang yang ingin ditambahkan ke gudang.</p>
              </div>
              <button className="stokAdm__closeBtn" onClick={() => setOpenForm(false)}>×</button>
            </div>
            <form onSubmit={handleSend} className="stokAdm__form">
              <div className="stokAdm__formGrid">
                <div className="stokAdm__field">
                  <span>Kode Barang</span>
                  <input placeholder="contoh: BRG-021" value={form.kodeBarang} onChange={(e) => setForm({...form, kodeBarang: e.target.value})} />
                </div>
                <div className="stokAdm__field">
                  <span>Nama Barang</span>
                  <input placeholder="contoh: Pipa 1/2 inch" value={form.namaBarang} onChange={(e) => setForm({...form, namaBarang: e.target.value})} />
                </div>
                <div className="stokAdm__field">
                  <span>Kategori</span>
                  <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})}>
                    <option>Elektronik</option>
                    <option>Plumbing</option>
                    <option>Peralatan</option>
                  </select>
                </div>
                <div className="stokAdm__field">
                  <span>Jumlah</span>
                  <input type="number" placeholder="50" value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} />
                </div>
              </div>
              <div className="stokAdm__formActions">
                <button type="button" className="stokAdm__ghostBtn" onClick={resetForm}>Clear</button>
                <button type="submit" className="stokAdm__primaryBtn">Send Request</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}