import React, { useEffect, useState, useMemo } from "react";
import Card from "../../../components/common/Card";
import { subscribeRequests, subscribeDriverProfile } from "../../../services/wmsApi";

export default function DriverHistory() {
  const [allReq, setAllReq] = useState([]);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const unsubReq = subscribeRequests((rows) => setAllReq(rows || []));
    const unsubProfile = subscribeDriverProfile((data) => setProfile(data || {}));
    
    return () => {
      unsubReq();
      unsubProfile();
    };
  }, []);

  const history = useMemo(() => {
    return allReq.filter(r => r.status === "Selesai" && r.driverName === profile.name);
  }, [allReq, profile.name]);

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Riwayat Pengiriman</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
            <p>Belum ada riwayat pengiriman yang selesai.</p>
          </div>
        ) : history.map((h, i) => (
          <Card key={i} style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#f6ffed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✅</div>
              <div>
                <b style={{ fontSize: '16px', display: 'block' }}>{h.id}</b>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{h.toName || "Gudang"} → {h.fromName || "Toko"}</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <b style={{ fontSize: '14px', display: 'block' }}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</b>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Status: Selesai</span>
            </div>
            
            <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Detail</button>
          </Card>
        ))}
      </div>
    </div>
  );
}
