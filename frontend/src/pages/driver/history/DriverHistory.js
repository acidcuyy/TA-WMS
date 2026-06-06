import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../../components/common/Card";
import { subscribeRequests, subscribeDriverProfile } from "../../../services/wmsApi";
import "./DriverHistory.css";

export default function DriverHistory() {
  const [allReq, setAllReq] = useState([]);
  const [profile, setProfile] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all"); // "all", "today", "week", "month"
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubProfile = subscribeDriverProfile((data) => setProfile(data || {}));
    
    return () => {
      unsubReq();
      unsubProfile();
    };
  }, []);

  // Filter requests that are finished ("Selesai") and belong to this driver
  const driverHistory = useMemo(() => {
    return allReq.filter(r => r.status === "Selesai" && r.driverName === profile.name);
  }, [allReq, profile.name]);

  // Apply search & period filter
  const filteredHistory = useMemo(() => {
    return driverHistory.filter(h => {
      // 1. Search term match
      const idMatch = h.id.toLowerCase().includes(searchTerm.toLowerCase());
      const shopMatch = (h.fromName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const warehouseMatch = (h.toName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchSearch = idMatch || shopMatch || warehouseMatch;

      if (!matchSearch) return false;

      // 2. Period match
      if (filterPeriod === "all") return true;
      if (!h.completedAt) return false;

      const completedDate = new Date(h.completedAt);
      const now = new Date();
      
      if (filterPeriod === "today") {
        return completedDate.toDateString() === now.toDateString();
      }
      
      if (filterPeriod === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return completedDate >= oneWeekAgo;
      }
      
      if (filterPeriod === "month") {
        return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [driverHistory, searchTerm, filterPeriod]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = driverHistory.length;
    
    const now = new Date();
    const thisMonthCount = driverHistory.filter(h => {
      if (!h.completedAt) return false;
      const completedDate = new Date(h.completedAt);
      return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      thisMonth: thisMonthCount,
      rating: total > 0 ? "4.9 ★" : "-"
    };
  }, [driverHistory]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }) + " WIB";
    } catch {
      return "";
    }
  };

  const calculateDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return "-";
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const diffMs = e - s;
      const diffMins = Math.round(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} Menit`;
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hrs} Jam ${mins} Menit`;
    } catch {
      return "-";
    }
  };

  return (
    <div className="dhistory">
      {/* Header */}
      <div className="dhistory__head">
        <div>
          <h1 className="dhistory__title">Riwayat Tugas</h1>
          <p className="dhistory__subtitle">Daftar seluruh tugas pengiriman yang telah Anda selesaikan</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="dhistory__stats">
        <div className="dhistory__stat-card">
          <div className="dhistory__stat-icon">📦</div>
          <div className="dhistory__stat-info">
            <span className="dhistory__stat-value">{stats.total}</span>
            <span className="dhistory__stat-label">Total Selesai</span>
          </div>
        </div>
        <div className="dhistory__stat-card">
          <div className="dhistory__stat-icon">📅</div>
          <div className="dhistory__stat-info">
            <span className="dhistory__stat-value">{stats.thisMonth}</span>
            <span className="dhistory__stat-label">Bulan Ini</span>
          </div>
        </div>
        <div className="dhistory__stat-card">
          <div className="dhistory__stat-icon">⭐</div>
          <div className="dhistory__stat-info">
            <span className="dhistory__stat-value">{stats.rating}</span>
            <span className="dhistory__stat-label">Rating Driver</span>
          </div>
        </div>
      </div>

      {/* Toolbar (Filters) */}
      <div className="dhistory__toolbar">
        <div className="dhistory__search-wrapper">
          <span className="dhistory__search-icon">🔍</span>
          <input
            type="text"
            className="dhistory__search-input"
            placeholder="Cari ID, Gudang, atau Toko..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="dhistory__filter-select"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
        >
          <option value="all">Semua Waktu</option>
          <option value="today">Hari Ini</option>
          <option value="week">7 Hari Terakhir</option>
          <option value="month">Bulan Ini</option>
        </select>
      </div>

      {/* History List */}
      <div className="dhistory__list">
        {filteredHistory.length === 0 ? (
          <div className="dhistory__empty">
            <div className="dhistory__empty-icon">📦</div>
            <h3>Tidak Ada Riwayat</h3>
            <p>Belum ada riwayat pengiriman selesai yang sesuai dengan pencarian Anda.</p>
          </div>
        ) : (
          filteredHistory.map((h) => (
            <Card key={h.id} className="dhistory__card">
              <div className="dhistory__left">
                <div className="dhistory__icon-wrapper">✓</div>
                <div className="dhistory__info-main">
                  <span className="dhistory__id">{h.id}</span>
                  <span className="dhistory__route">
                    {h.toName || "Gudang"}
                    <span className="dhistory__arrow">→</span>
                    {h.fromName || "Toko"}
                  </span>
                </div>
              </div>
              
              <div className="dhistory__meta">
                <div className="dhistory__time-info">
                  <span className="dhistory__date">{formatDate(h.completedAt)}</span>
                  <span className="dhistory__completed-time">Selesai {formatTime(h.completedAt)}</span>
                </div>
                
                <button
                  className="dhistory__btn-detail"
                  onClick={() => setSelectedRequest(h)}
                >
                  Detail 📄
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="dhistory-modal-overlay" onClick={() => setSelectedRequest(null)}>
            <motion.div
              className="dhistory-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="dhistory-modal__header">
                <div className="dhistory-modal__title-sec">
                  <h3>Detail Tugas Pengiriman</h3>
                  <span>ID Pengiriman: {selectedRequest.id}</span>
                </div>
                <button
                  className="dhistory-modal__close-btn"
                  onClick={() => setSelectedRequest(null)}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="dhistory-modal__body">
                {/* Route Card */}
                <div>
                  <span className="dhistory-modal__section-title">Informasi Rute</span>
                  <div className="dhistory-modal__route-card">
                    <div className="dhistory-modal__route-row">
                      <span className="dhistory-modal__route-icon">🏬</span>
                      <div className="dhistory-modal__route-text">
                        <span className="dhistory-modal__route-label">Gudang Asal</span>
                        <span className="dhistory-modal__route-val">{selectedRequest.toName || "Gudang Pusat"}</span>
                      </div>
                    </div>
                    <div style={{ width: 2, height: 16, background: "var(--border-color)", marginLeft: 8 }} />
                    <div className="dhistory-modal__route-row">
                      <span className="dhistory-modal__route-icon">🏪</span>
                      <div className="dhistory-modal__route-text">
                        <span className="dhistory-modal__route-label">Tujuan Toko</span>
                        <span className="dhistory-modal__route-val">{selectedRequest.fromName || "Cabang Toko"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <span className="dhistory-modal__section-title">Timeline Pengiriman</span>
                  <div className="dhistory-modal__timeline">
                    <div className="dhistory-modal__tl-item">
                      <div className="dhistory-modal__tl-marker">📋</div>
                      <div className="dhistory-modal__tl-content">
                        <div>
                          <span className="dhistory-modal__tl-title">Tugas Diambil</span>
                          <span className="dhistory-modal__tl-desc">Driver menerima tugas</span>
                        </div>
                        <span className="dhistory-modal__tl-time">{formatTime(selectedRequest.acceptedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="dhistory-modal__tl-item">
                      <div className="dhistory-modal__tl-marker">🚚</div>
                      <div className="dhistory-modal__tl-content">
                        <div>
                          <span className="dhistory-modal__tl-title">Pengiriman Dimulai</span>
                          <span className="dhistory-modal__tl-desc">Bukti pickup diunggah, driver berangkat</span>
                        </div>
                        <span className="dhistory-modal__tl-time">{formatTime(selectedRequest.shippingStartedAt)}</span>
                      </div>
                    </div>

                    <div className="dhistory-modal__tl-item">
                      <div className="dhistory-modal__tl-marker">📥</div>
                      <div className="dhistory-modal__tl-content">
                        <div>
                          <span className="dhistory-modal__tl-title">Diterima Toko</span>
                          <span className="dhistory-modal__tl-desc">Toko mengonfirmasi penerimaan barang</span>
                        </div>
                        <span className="dhistory-modal__tl-time">{formatTime(selectedRequest.receivedAt)}</span>
                      </div>
                    </div>

                    <div className="dhistory-modal__tl-item">
                      <div className="dhistory-modal__tl-marker">✅</div>
                      <div className="dhistory-modal__tl-content">
                        <div>
                          <span className="dhistory-modal__tl-title">Pengiriman Selesai</span>
                          <span className="dhistory-modal__tl-desc">
                            Total Durasi: {calculateDuration(selectedRequest.shippingStartedAt, selectedRequest.completedAt)}
                          </span>
                        </div>
                        <span className="dhistory-modal__tl-time">{formatTime(selectedRequest.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <span className="dhistory-modal__section-title">Barang Yang Dikirim</span>
                  <div style={{ border: "1px solid var(--border-color)", borderRadius: 12, overflow: "hidden", background: "var(--bg-2)" }}>
                    <table className="dhistory-modal__table">
                      <thead>
                        <tr>
                          <th>Nama Barang / SKU</th>
                          <th style={{ textAlign: "right" }}>Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRequest.items && selectedRequest.items.length > 0 ? (
                          selectedRequest.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.sku}</td>
                              <td style={{ textAlign: "right", fontWeight: 700 }}>{item.qty} pcs</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                              Tidak ada data barang
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Proofs / Evidences */}
                <div>
                  <span className="dhistory-modal__section-title">Bukti Pengiriman</span>
                  <div className="dhistory-modal__proofs">
                    {/* Pickup Proof */}
                    <div className="dhistory-modal__proof-box">
                      <span className="dhistory-modal__proof-title">1. Bukti Pengambilan (Resi & Barang)</span>
                      {selectedRequest.driverProof?.foto ? (
                        <img
                          src={selectedRequest.driverProof.foto}
                          alt="Bukti Pickup"
                          className="dhistory-modal__proof-img"
                        />
                      ) : (
                        <div className="dhistory-modal__proof-placeholder">Tidak ada foto bukti pickup</div>
                      )}
                    </div>

                    {/* Delivery / Signature Proof */}
                    <div className="dhistory-modal__proof-box">
                      <span className="dhistory-modal__proof-title">2. Bukti Penerimaan Toko (Tanda Tangan)</span>
                      {selectedRequest.proofImage ? (
                        <img
                          src={selectedRequest.proofImage}
                          alt="Bukti Penerimaan"
                          className="dhistory-modal__proof-img"
                        />
                      ) : (
                        <div className="dhistory-modal__proof-placeholder">Tidak ada bukti tanda tangan</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
