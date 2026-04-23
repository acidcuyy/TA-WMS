import React from "react";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import "./LaporanGudang.css";

export default function LaporanGudang() {
  const reports = [
    {
      title: "Laporan Stok",
      desc: "Ringkasan jumlah stok, nilai aset, dan status ketersediaan barang.",
      icon: "📦",
      color: "#1890ff",
      bg: "#e6f7ff",
      stats: [
        { label: "Total SKU", val: "3.245" },
        { label: "Nilai Aset", val: "Rp 2.45M" },
      ],
    },
    {
      title: "Laporan Pergerakan",
      desc: "Histori barang masuk, keluar, dan transfer antar lokasi.",
      icon: "⇄",
      color: "#fa8c16",
      bg: "#fff7e6",
      stats: [
        { label: "Masuk (Bln)", val: "1.250" },
        { label: "Keluar (Bln)", val: "980" },
      ],
    },
    {
      title: "Laporan Order",
      desc: "Analisis pemenuhan order pelanggan dan efisiensi picking.",
      icon: "🗒",
      color: "#52c41a",
      bg: "#f6ffed",
      stats: [
        { label: "Order Selesai", val: "450" },
        { label: "Avg. Lead Time", val: "45 Min" },
      ],
    },
    {
      title: "Laporan Produksi",
      desc: "Data konversi bahan baku menjadi barang jadi (jika ada).",
      icon: "🛠",
      color: "#722ed1",
      bg: "#f9f0ff",
      stats: [
        { label: "Batch Aktif", val: "12" },
        { label: "Yield Rate", val: "99.2%" },
      ],
    },
  ];

  return (
    <div className="lpGudang">
      <header className="lpGudang__head">
        <div>
          <h1 className="lpGudang__title">Laporan Gudang</h1>
          <p className="lpGudang__subtitle">Analisis data mendalam untuk mengoptimalkan operasional gudang Anda.</p>
        </div>
        <button className="logout-btn" style={{ width: 'auto', padding: '12px 24px', background: '#f86c14', color: 'white' }}>
          📄 Export Semua (PDF)
        </button>
      </header>

      <div className="lpGudang__grid">
        {reports.map((r, i) => (
          <motion.div
            key={i}
            className="lpGudang__card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="lpGudang__cardHead">
              <div className="lpGudang__cardIcon" style={{ background: r.bg, color: r.color }}>{r.icon}</div>
              <div className="lpGudang__cardInfo">
                <h3 className="lpGudang__cardTitle">{r.title}</h3>
                <p className="lpGudang__cardDesc">{r.desc}</p>
              </div>
            </div>

            <div className="lpGudang__cardBody">
              {r.stats.map((s, idx) => (
                <div key={idx} className="lpGudang__statItem">
                  <span className="lpGudang__statLabel">{s.label}</span>
                  <span className="lpGudang__statVal">{s.val}</span>
                </div>
              ))}
            </div>

            <button className="lpGudang__btn">
              <span>📊</span> Lihat Detail Laporan
            </button>
          </motion.div>
        ))}
      </div>

      <section className="lpGudang__featured">
         <Card style={{ padding: '32px', background: 'linear-gradient(135deg, #1890ff, #096dd9)', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>E-mail Report Otomatis</h2>
                  <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: '14px' }}>Dapatkan ringkasan harian operasional gudang langsung ke inbox Anda.</p>
               </div>
               <button style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'white', color: '#1890ff', fontWeight: 700, cursor: 'pointer' }}>
                  Konfigurasi Sekarang
               </button>
            </div>
         </Card>
      </section>
    </div>
  );
}
