import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";
import Sidebar from "../../components/layout/Sidebar";
import NotificationSystem from "../../components/layout/NotificationSystem";
import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";
import avatarImg from "../../assets/images/stok.jpg";
import "./DriverLayout.css";

export default function DriverLayout() {
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
      title: "DRIVER MENU",
      items: [
        { label: "Dashboard", path: "/driver", icon: "⊞" },
        { label: "Pengiriman Aktif", path: "/driver/tracking", icon: "🚚" },
        { label: "Riwayat Pengiriman", path: "/driver/history", icon: "📋" },
      ]
    }
  ];

  const bottomItems = [
    { label: "Profile", path: "/driver/profile", icon: "👤" },
  ];

  return (
    <div className="driver-container">
      <Sidebar
        role="DRIVER"
        logo={currentLogo}
        menuItems={menuItems}
        bottomItems={bottomItems}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      <main className="driver-main">
        <header className="driver-topbar">
          <div className="topbar-left">
            <div className="location-selector">
              <div className="loc-icon">🚚</div>
              <div className="loc-info">
                <b>Driver Standby</b>
                <span>Sistem Transportasi</span>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              Online
            </div>

            <NotificationSystem role="DRIVER" />

            <div className="user-profile-top">
              <img src={avatarImg} alt="User" className="user-avatar" />
              <div className="user-info-text">
                <b>Budi Santoso</b>
                <span>Driver Utama</span>
              </div>
            </div>
          </div>
        </header>

        <div className="driver-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ height: "100%", width: "100%" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

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
              <div className="modal-icon">⚠️</div>
              <h3>Keluar Aplikasi</h3>
              <p>Apakah anda yakin ingin keluar?</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
