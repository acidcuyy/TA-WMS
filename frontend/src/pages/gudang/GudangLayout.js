import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";
import "./GudangLayout.css";

import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";
import avatarImg from "../../assets/images/stok.jpg"; // Placeholder avatar

import Sidebar from "../../components/layout/Sidebar";
import NotificationSystem from "../../components/layout/NotificationSystem";

export default function GudangLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentLogo = theme === "dark" ? logoSideDark : logoSideDefault;

  const handleLogout = () => {
    localStorage.removeItem("reastock_role");
    navigate("/login");
  };

  const menuItems = [
    {
      title: "GUDANG",
      items: [
        { label: "Dashboard", path: "/gudang", icon: "⊞" },
        { label: "Penerimaan Barang", path: "/gudang/penerimaan", icon: "⬇️" },
        { label: "Pengeluaran Barang", path: "/gudang/pengeluaran", icon: "⬆️" },
        { label: "Stok & Produk", path: "/gudang/stok", icon: "📦" },
        { label: "Request Masuk", path: "/gudang/requests", icon: "📥" },
        { label: "Buat Request", path: "/gudang/buat-request", icon: "📝" },
      ]
    }
  ];

  const bottomItems = [
    { label: "Pengaturan", path: "/gudang/settings", icon: "⚙" },
    { label: "Profile", path: "/gudang/profile", icon: "👤" },
  ];

  return (
    <div className="gudang-container">
      {/* SIDEBAR */}
      <Sidebar
        role="GUDANG"
        logo={currentLogo}
        menuItems={menuItems}
        bottomItems={bottomItems}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* MAIN AREA */}
      <main className="gudang-main">
        {/* TOPBAR */}
        <header className="gudang-topbar">
          <div className="topbar-left">
            <div className="location-selector">
              <div className="loc-icon">🏢</div>
              <div className="loc-info">
                <b>Gudang Pusat</b>
                <span>Gudang</span>
              </div>
              <span style={{ fontSize: '10px', color: '#888', marginLeft: '8px' }}>⌄</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              Online
            </div>

            <NotificationSystem role="GUDANG" />

            <div className="user-profile-top">
              <img src={avatarImg} alt="User" className="user-avatar" />
              <div className="user-info-text">
                <b>Admin Gudang</b>
                <span>Gudang Pusat</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="gudang-content">
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
