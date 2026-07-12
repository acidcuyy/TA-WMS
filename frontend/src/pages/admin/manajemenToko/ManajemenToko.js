import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import "../PageAdmin.css";
import "./ManajemenTokoAdmin.css";
import {
  subscribeTokoReports,
  subscribeRequests,
  getShipment,
  gudangDecideRequest,
  subscribeBranches
} from "../../../services/wmsApi";

export default function ManajemenToko() {
  const navigate = useNavigate();

  // API State
  const [reports, setReports] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [tick, setTick] = useState(0);

  // Dummy Initial Fallback matching original UI (will be replaced by real data if any)


  useEffect(() => {
    const unsubReports = subscribeTokoReports((data) => {
      const mapped = data.map(r => {
        const d = new Date(r.date);
        const day = String(d.getDate()).padStart(2, "0");
        const monthYear = d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
        return {
          id: r.id,
          date: day,
          month: monthYear,
          tokoName: r.tokoName,
          type: r.type,
          desc: `Periode: ${r.period}`,
          status: r.status,
          fileData: r.fileData
        };
      });
      setReports(mapped);
    });

    const unsubRequests = subscribeRequests((data) => {
      setRequestsList(data || []);
    });

    const timer = setInterval(() => setTick((t) => t + 1), 1000);

    return () => {
      unsubReports();
      unsubRequests();
      clearInterval(timer);
    };
  }, []);

  const displayReports = reports.slice(0, 5);

  // Handler for Accept/Decline action
  const handleDecide = (id, decision) => {
    gudangDecideRequest(id, decision);
  };

  // Stats calculation from real database
  const summary = useMemo(() => {
    if (requestsList.length === 0) {
      return {
        tokoAktif: 0,
        transaksiHariIni: 0,
        pendingRestock: 0,
        estimasiOmzet: 0,
      };
    }

    const uniqueShops = new Set(requestsList.map(r => r.fromName)).size;
    const pendingCount = requestsList.filter(r => r.status === "Menunggu").length;

    // Transactions today
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayReqs = requestsList.filter(r => r.createdAt === todayStr);
    const totalTransactionsToday = todayReqs.length;

    const omzetToday = todayReqs.reduce((sum, r) => {
      const qty = (r.items || []).reduce((s, i) => s + i.qty, 0);
      return sum + (qty * 150000);
    }, 0);

    return {
      tokoAktif: uniqueShops || 0,
      transaksiHariIni: totalTransactionsToday || 0,
      pendingRestock: pendingCount,
      estimasiOmzet: omzetToday || 0
    };
  }, [requestsList]);

  // Shipments (live tracking database integration)
  const shipments = useMemo(() => {
    if (requestsList.length === 0) return [];

    const shippingReqs = requestsList.filter(
      r => r.status === "Mengirim" || r.status === "Pickup"
    );

    return shippingReqs.map(r => {
      const sh = r.shipment;
      let progressPercent = 0;
      let eta = "—";

      if (sh) {
        const elapsed = Date.now() - Number(sh.startedAt);
        const progress = Math.max(0, Math.min(1, elapsed / sh.durationMs));
        progressPercent = Math.round(progress * 100);
        eta = progressPercent >= 100 ? "Tiba di tujuan" : `${Math.ceil((sh.durationMs - elapsed) / 60000)} menit`;
      }

      return {
        id: r.id,
        to: r.fromName || "Toko",
        driver: r.driverName || "Driver",
        eta: eta,
        status: r.status === "Pickup" ? "Pickup" : progressPercent >= 100 ? "Tiba" : "Dalam perjalanan",
        progress: progressPercent,
        route: `Gudang → ${r.fromName || "Toko"}`
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestsList, tick]);

  // Transactions database integration
  const transactions = useMemo(() => {
    if (requestsList.length === 0) return [];

    return requestsList.map(r => {
      const totalQty = (r.items || []).reduce((sum, item) => sum + item.qty, 0);
      const itemName = r.items?.[0]?.name ? `${r.items[0].name} ` : "";

      let statusLabel = r.status;
      let trackingText = "—";

      if (r.status === "Menunggu") {
        statusLabel = "Pending";
        trackingText = "Menunggu persetujuan";
      } else if (r.status === "Memproses") {
        statusLabel = "Diproses";
        trackingText = "Sedang diproses gudang";
      } else if (r.status === "Siap Dikirim") {
        statusLabel = "Diproses";
        trackingText = "Siap dikirim - mencari driver";
      } else if (r.status === "Pickup") {
        statusLabel = "Diproses";
        trackingText = "Barang sedang dipickup driver";
      } else if (r.status === "Mengirim") {
        statusLabel = "Dalam perjalanan";
        const sh = r.shipment;
        if (sh) {
          const elapsed = Date.now() - Number(sh.startedAt);
          const progress = Math.max(0, Math.min(100, Math.round((elapsed / sh.durationMs) * 100)));
          if (progress >= 100) {
            trackingText = "Tiba di tujuan - menunggu konfirmasi";
          } else {
            trackingText = `Dalam perjalanan - ${progress}% - ETA: ${Math.ceil((sh.durationMs - elapsed) / 60000)} mnt`;
          }
        } else {
          trackingText = "Dalam perjalanan";
        }
      } else if (r.status === "Diterima Toko") {
        statusLabel = "Selesai";
        trackingText = "Telah diterima toko - menunggu konfirmasi driver";
      } else if (r.status === "Selesai") {
        statusLabel = "Selesai";
        trackingText = "Selesai";
      } else if (r.status === "Declined" || r.status === "Ditolak") {
        statusLabel = "Declined";
        trackingText = "Ditolak";
      }

      return {
        id: r.id,
        toko: r.fromName || "Toko",
        tanggal: r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—",
        tipe: "Pengiriman",
        item: `${itemName}(${totalQty} pcs)`,
        status: statusLabel,
        tracking: trackingText
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestsList, tick]);

  // Requests database integration
  const requests = useMemo(() => {
    if (requestsList.length === 0) return [];

    return requestsList.map(r => {
      const totalQty = (r.items || []).reduce((sum, item) => sum + item.qty, 0);
      const itemName = r.items?.[0]?.name ? `${r.items[0].name} ` : "";
      const priorityStr = r.priority ? `[${r.priority}] ` : "";

      let displayStatus = "Pending";
      if (r.status === "Declined" || r.status === "Ditolak") {
        displayStatus = "Declined";
      } else if (r.status === "Memproses" || r.status === "Siap Dikirim" || r.status === "Pickup") {
        displayStatus = "Accepted";
      } else if (r.status === "Mengirim") {
        displayStatus = "Dalam perjalanan";
      } else if (r.status === "Diterima Toko" || r.status === "Selesai") {
        displayStatus = "Selesai";
      }

      return {
        id: r.id,
        toko: r.fromName || "Toko",
        tanggal: r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—",
        item: `${itemName}(${totalQty} pcs)`,
        catatan: `${priorityStr}${r.note || "—"}`,
        status: displayStatus,
        rawStatus: r.status
      };
    });
  }, [requestsList]);

  // Modal State
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div className="pageAdmin stokAdm">
      {/* HEADER */}
      <header className="mtAdmin__head">
        <div>
          <h1 className="mtAdmin__title">Manajemen Toko</h1>
          <p className="mtAdmin__subtitle">
            Kelola operasional toko, transaksi gudang, request restock, dan pengiriman dalam satu dashboard.
          </p>
        </div>
        <div className="mtAdmin__headRight">
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
      <div className="mtAdmin__stats">
        <Card className="mtAdmin__statCard">
          <div className="mtAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>🏪</div>
          <div className="mtAdmin__statContent">
            <p className="mtAdmin__statLabel">Total Toko Aktif</p>
            <h3 className="mtAdmin__statValue">{summary.tokoAktif}</h3>
            <p className="mtAdmin__statHint">Toko terdaftar</p>
          </div>
        </Card>
        <Card className="mtAdmin__statCard">
          <div className="mtAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>🔄</div>
          <div className="mtAdmin__statContent">
            <p className="mtAdmin__statLabel">Transaksi Hari Ini</p>
            <h3 className="mtAdmin__statValue">{summary.transaksiHariIni}</h3>
            <p className="mtAdmin__statHint">Pengiriman + penerimaan</p>
          </div>
        </Card>
        <Card className="mtAdmin__statCard">
          <div className="mtAdmin__statIcon" style={{ background: '#fff8f3', color: '#e4915a' }}>📦</div>
          <div className="mtAdmin__statContent">
            <p className="mtAdmin__statLabel">Pending Restock</p>
            <h3 className="mtAdmin__statValue">{summary.pendingRestock}</h3>
            <p className="mtAdmin__statHint">Request restock yang aktif</p>
          </div>
        </Card>
      </div>



      {/* TABLES SECTION */}
      <div className="mtAdmin__grid">
        {/* TRANSAKSI */}
        <section className="mtAdmin__card">
          <div className="mtAdmin__cardHead">
            <h3>Data Transaksi Gudang → Toko</h3>
            <select className="stokAdm__heroBadge" style={{ border: '1px solid #eee', outline: 'none' }}>
              <option>Semua Status</option>
            </select>
          </div>
          <div className="mtAdmin__tableWrap">
            <table className="mtAdmin__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Toko</th>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td className="mtAdmin__mono">{t.id}</td>
                    <td>{t.toko}</td>
                    <td>{t.tanggal}</td>
                    <td>{t.tipe}</td>
                    <td>{t.item}</td>

                    <td>
                      <span className={`mtAdmin__pill ${t.status === 'Selesai' ? 'mtAdmin__pill--success' :
                        t.status === 'Diproses' || t.status === 'Dalam perjalanan' ? 'mtAdmin__pill--process' :
                          t.status === 'Declined' || t.status === 'Batal' ? 'mtAdmin__pill--warning' :
                            'mtAdmin__pill--pending'
                        }`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: '#888' }}>{t.tracking}</td>
                    <td><button className="btn-more">⋮</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>
              Menampilkan {transactions.length > 0 ? `1 - ${transactions.length} dari ${transactions.length}` : '0 - 0 dari 0'} data
            </span>
          </div>
        </section>

        {/* REQUEST */}
        <section className="mtAdmin__card">
          <div className="mtAdmin__cardHead">
            <h3>Request Toko → Gudang</h3>
            <div className="mgAdmin__pill" style={{ background: '#e4915a', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> Action: Accept / Decline
            </div>
          </div>
          <div className="mtAdmin__tableWrap">
            <table className="mtAdmin__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Toko</th>
                  <th>Tanggal</th>
                  <th>Item</th>
                  <th>Catatan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={i}>
                    <td className="mtAdmin__mono">{r.id}</td>
                    <td>{r.toko}</td>
                    <td>{r.tanggal}</td>
                    <td>{r.item}</td>
                    <td style={{ color: '#888' }}>{r.catatan}</td>
                    <td><span className={`mtAdmin__pill ${r.status === 'Accepted' ? 'mtAdmin__pill--success' : r.status === 'Declined' ? 'mtAdmin__pill--warning' : r.status === 'Pending' ? 'mtAdmin__pill--pending' : 'mtAdmin__pill--process'}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="mtAdmin__btn mgAdmin__btn--ghost"
                            style={{ background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e' }}
                            onClick={() => handleDecide(r.id, "Declined")}
                          >
                            Decline
                          </button>
                          <button
                            className="mtAdmin__btn mgAdmin__btn--primary"
                            style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }}
                            onClick={() => handleDecide(r.id, "Accepted")}
                          >
                            Accept
                          </button>
                        </div>
                      ) : <span style={{ color: '#888', fontSize: '20px' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-lihat-semua-link" style={{ textAlign: 'right', width: 'auto' }} onClick={() => navigate('/admin/requests')}>Lihat semua request</button>
          </div>
        </section>
      </div>

      {/* PDF PREVIEW MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <div className="mtAdmin-modal-overlay" onClick={() => setSelectedReport(null)}>
            <motion.div
              className="mtAdmin-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mtAdmin-modal-header">
                <div>
                  <h3>Preview: {selectedReport.type}</h3>
                  <p>{selectedReport.tokoName} • {selectedReport.desc}</p>
                </div>
                <button className="mtAdmin-modal-close" onClick={() => setSelectedReport(null)}>✕</button>
              </div>

              <div className="mtAdmin-modal-body">
                {selectedReport.fileData ? (
                  <iframe src={selectedReport.fileData} title="PDF Preview" />
                ) : (
                  <div className="mtAdmin-modal-empty">
                    <span style={{ fontSize: '48px', marginBottom: '16px' }}>📄</span>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>File Tidak Ditemukan</h3>
                    <p style={{ margin: 0 }}>Laporan ini tidak memiliki lampiran PDF.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
