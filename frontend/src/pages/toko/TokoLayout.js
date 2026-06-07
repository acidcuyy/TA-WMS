import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TokoLayout.css";
import { useTheme } from "../../app/ThemeProvider";
import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";

import Sidebar from "../../components/layout/Sidebar";
import NotificationSystem from "../../components/layout/NotificationSystem";

export default function TokoLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentLogo = theme === "dark" ? logoSideDark : logoSideDefault;

  const handleLogout = () => {
    localStorage.removeItem("reastock_role");
    navigate("/login");
  };

  const menuItems = [
    {
      title: "TOKO",
      items: [
        { label: "Dashboard", path: "/toko", icon: "⊞" },
        { label: "Stok & Produk", path: "/toko/stok", icon: "📦" },
        { label: "Penerimaan Barang", path: "/toko/penerimaan", icon: "📥" },
        { label: "Pengeluaran Barang", path: "/toko/pengeluaran", icon: "📤" },
        { label: "Transfer Barang", path: "/toko/transfer", icon: "⇄" },
        { label: "Penyesuaian Stok", path: "/toko/adj", icon: "⚖" },
        { label: "Pesanan Penjualan", path: "/toko/pesanan", icon: "🛒" },
        { label: "Request", path: "/toko/request", icon: "📝" },
        { label: "Retur Penjualan", path: "/toko/retur", icon: "↩" },
      ]
    }
  ];

  const bottomItems = [
    { label: "Pengaturan", path: "/toko/settings", icon: "⚙" },
    { label: "Profil", path: "/toko/profile", icon: "👤" },
  ];

  return (
    <div className="toko-layout">
      {/* SIDEBAR */}
      <Sidebar
        role="TOKO"
        logo={currentLogo}
        menuItems={menuItems}
        bottomItems={bottomItems}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* MAIN CONTENT */}
      <main className="toko-main">
        {/* TOPBAR */}
        <header className="toko-topbar">
          <div className="toko-topbar__left">
            <div className="store-badge">🏪</div>
            <div className="store-info">
              <span className="store-name">Toko Sejahtera</span>
              <span className="store-role">Toko</span>
            </div>
            <div style={{ marginLeft: "8px", fontSize: "10px", color: "#94a3b8" }}>▼</div>
          </div>

          <div className="toko-topbar__right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              Online
            </div>

            <NotificationSystem role="TOKO" />

            <div className="user-profile" onClick={() => navigate("/toko/profile")}>
              <div className="user-info">
                <span className="user-name">Admin Toko</span>
                <span className="user-detail">Toko Sejahtera</span>
              </div>
              <div className="user-avatar">
                <div style={{ width: "100%", height: "100%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                  👤
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="toko-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ 
                duration: 0.35, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              style={{ height: "100%", width: "100%" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="logout-overlay" style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
          }} onClick={() => setShowLogoutModal(false)}>
            <motion.div
              className="logout-modal"
              style={{
                background: "var(--surface, #fff)", padding: "32px", borderRadius: "24px", maxWidth: "360px", width: "90%",
                textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div style={{ width: "72px", height: "72px", background: "#fff1f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 20px" }}>⚠️</div>
              <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 700, color: "var(--text, #1e293b)" }}>Keluar Aplikasi</h3>
              <p style={{ margin: "0 0 24px", color: "var(--muted, #64748b)", fontSize: "14px" }}>Apakah anda yakin ingin keluar?</p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button style={{
                  flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid var(--border, #e2e8f0)",
                  background: "transparent", color: "var(--text, #1e293b)", fontWeight: 600, cursor: "pointer"
                }} onClick={() => setShowLogoutModal(false)}>Batal</button>
                <button style={{
                  flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                  background: "#ff4d4f", color: "white", fontWeight: 600, cursor: "pointer"
                }} onClick={handleLogout}>Logout</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
