import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";
import "./GudangLayout.css";

import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";
import avatarImg from "../../assets/images/stok.jpg"; // Placeholder avatar

import Sidebar from "../../components/layout/Sidebar";
import NotificationSystem from "../../components/layout/NotificationSystem";
import { subscribeNotifications, markMultipleNotificationsAsRead } from "../../services/wmsApi";

export default function GudangLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const branchName = sessionStorage.getItem("reastock_branch_name") || "Gudang Pusat";
  const userName = sessionStorage.getItem("reastock_user_name") || "Admin Gudang";

  const currentLogo = theme === "dark" ? logoSideDark : logoSideDefault;

  const handleLogout = () => {
    sessionStorage.removeItem("reastock_role");
    navigate("/login");
  };

  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    return subscribeNotifications(data => {
      setNotifications(data.filter(n => !n.isRead && n.targetRoles && n.targetRoles.includes("gudang")));
    });
  }, []);

  const reqMasukNotifications = notifications.filter(n => ["request_received", "request_toko", "received", "done"].includes(n.type));
  const penerimaanNotifications = notifications.filter(n => ["restock", "restock_accepted", "restock_declined", "restock_done"].includes(n.type));

  const reqMasukBadge = reqMasukNotifications.length;
  const penerimaanBadge = penerimaanNotifications.length;

  useEffect(() => {
    if (location.pathname === "/gudang/requests" && reqMasukNotifications.length > 0) {
      markMultipleNotificationsAsRead(reqMasukNotifications.map(n => n.id));
    } else if (location.pathname === "/gudang/penerimaan" && penerimaanNotifications.length > 0) {
      markMultipleNotificationsAsRead(penerimaanNotifications.map(n => n.id));
    }
  }, [location.pathname, reqMasukNotifications, penerimaanNotifications]);

  const menuItems = [
    {
      title: "GUDANG",
      items: [
        { label: "Dashboard", path: "/gudang", icon: "⊞" },
        { label: "Penerimaan Barang", path: "/gudang/penerimaan", icon: "⬇️", badge: penerimaanBadge },
        { label: "Pengeluaran Barang", path: "/gudang/pengeluaran", icon: "⬆️" },
        { label: "Stok & Produk", path: "/gudang/stok", icon: "📦" },
        { label: "Request Masuk", path: "/gudang/requests", icon: "📥", badge: reqMasukBadge },
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
                <b>{branchName}</b>
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
                <b>{userName}</b>
                <span>{branchName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="gudang-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%", height: "100%" }}
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
