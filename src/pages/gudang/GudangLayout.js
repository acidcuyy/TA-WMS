import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";
import "./GudangLayout.css";

import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";
import avatarImg from "../../assets/images/stok.jpg"; // Placeholder avatar

import Sidebar from "../../components/layout/Sidebar";

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
        { label: "Transfer Barang", path: "/gudang/transfer", icon: "⇄" },
        { label: "Stok & Produk", path: "/gudang/stok", icon: "📦" },
        { label: "Request Masuk", path: "/gudang/requests", icon: "📥" },
        { label: "Order Masuk", path: "/gudang/orders", icon: "🗒" },
      ]
    },
    {
      title: "LAPORAN",
      items: [
        { label: "Laporan", path: "/gudang/laporan", icon: "🗒" },
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

            <div className="notification-btn">
              🔔
              <span className="notification-badge">5</span>
            </div>

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
          <Outlet />
        </div>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="logout-overlay" onClick={() => setShowLogoutModal(false)}>
            <motion.div
              className="logout-modal"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="logout-modal__icon">⚠️</div>
              <h3>Keluar Aplikasi</h3>
              <p>Apakah anda yakin ingin keluar?</p>

              <div className="logout-modal__actions">
                <button className="btn-batal" onClick={() => setShowLogoutModal(false)}>Batal</button>
                <button className="btn-confirm-logout" onClick={handleLogout}>Logout</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
