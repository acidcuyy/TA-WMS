import Card from "../../../components/common/Card";

export default function DriverHistory() {
  const history = [
    { id: "REQ-2026-042", from: "Gudang Barat", to: "Toko B", status: "Selesai", date: "03 Mei 2026", distance: "12.5 km", time: "45 min" },
    { id: "REQ-2026-041", from: "Gudang Timur", to: "Toko C", status: "Selesai", date: "02 Mei 2026", distance: "24.0 km", time: "1h 20min" },
    { id: "REQ-2026-040", from: "Gudang Pusat", to: "Gudang Selatan", status: "Selesai", date: "02 Mei 2026", distance: "8.2 km", time: "30 min" },
    { id: "REQ-2026-039", from: "Gudang Utara", to: "Toko D", status: "Selesai", date: "01 Mei 2026", distance: "15.7 km", time: "55 min" },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Riwayat Pengiriman</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.map((h, i) => (
          <Card key={i} style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#f6ffed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✅</div>
              <div>
                <b style={{ fontSize: '16px', display: 'block' }}>{h.id}</b>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{h.from} → {h.to}</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <b style={{ fontSize: '14px', display: 'block' }}>{h.date}</b>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{h.distance} • {h.time}</span>
            </div>
            
            <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Detail</button>
          </Card>
        ))}
      </div>
    </div>
  );
}
