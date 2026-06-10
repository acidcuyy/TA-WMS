import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminLayout.css";

import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";

import { useTheme } from "../../app/ThemeProvider";

import Sidebar from "../../components/layout/Sidebar";
import NotificationSystem from "../../components/layout/NotificationSystem";
import { subscribeNotifications, markMultipleNotificationsAsRead } from "../../services/wmsApi";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [period, setPeriod] = useState("Mingguan");

  const currentLogo = theme === "dark" ? logoSideDark : logoSideDefault;

  const handleLogout = () => {
    localStorage.removeItem("reastock_role");
    navigate("/login");
  };

  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    return subscribeNotifications(data => {
      setNotifications(data.filter(n => !n.isRead && n.targetRoles && n.targetRoles.includes("admin")));
    });
  }, []);

  const reqNotifications = notifications.filter(n => ["restock", "request_toko"].includes(n.type));
  const reqBadge = reqNotifications.length;

  useEffect(() => {
    if (location.pathname === "/admin/requests" && reqNotifications.length > 0) {
      markMultipleNotificationsAsRead(reqNotifications.map(n => n.id));
    }
  }, [location.pathname, reqNotifications]);

  const menuItems = [
    {
      title: "MAIN",
      items: [
        { label: "Dashboard", path: "/admin", icon: "⊞" },
        { label: "Restock Gudang", path: "/admin/stok-gudang", icon: "⛃" },
        { label: "Manajemen Gudang", path: "/admin/gudang", icon: "⌂" },
        { label: "Manajemen Toko", path: "/admin/toko", icon: "🛒" },
        { label: "Manajemen Produk", path: "/admin/produk", icon: "📦" },
        { label: "Request", path: "/admin/requests", icon: "🚚", badge: reqBadge },
      ]
    },
    {
      title: "LAPORAN & REGISTRASI",
      items: [
        { label: "Pendaftaran Entitas", path: "/admin/registrasi", icon: "📝" },
        { label: "Arsip Laporan", path: "/admin/laporan", icon: "📄" },
      ]
    }
  ];

  const bottomItems = [
    { label: "Profile", path: "/admin/profile", icon: "👤" },
    { label: "Pengaturan", path: "/admin/settings", icon: "⚙", hasArrow: true },
  ];

  const today = new Date();
  const pastDate = new Date(today);
  
  if (period === "Mingguan") {
    pastDate.setDate(today.getDate() - 6);
  } else if (period === "Bulanan") {
    pastDate.setMonth(today.getMonth() - 1);
  } else if (period === "Tahunan") {
    pastDate.setFullYear(today.getFullYear() - 1);
  }
  
  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };
  const dateStr = `${formatDate(pastDate)} - ${formatDate(today)}`;

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <Sidebar
        role="ADMIN"
        logo={currentLogo}
        menuItems={menuItems}
        bottomItems={bottomItems}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <div className="admin-badge">🛡️</div>
            <div className="admin-info">
              <span className="admin-name">Super Admin</span>
              <span className="admin-role">Administrator</span>
            </div>
          </div>

          <div className="admin-topbar__right">
            <div className="admin-topbar__controls">
              <div className="date-picker">{dateStr} 📅</div>
              <div className="search-box">
                <span>⌕</span>
                <input type="text" placeholder="Search..." />
              </div>
              <button className="filter-btn">⚙</button>
              <button className="export-btn">📤 Export</button>
            </div>

            <div className="status-indicator">
              <span className="status-dot"></span>
              System Online
            </div>

            <NotificationSystem role="ADMIN" />

            <div className="user-profile" onClick={() => navigate("/admin/profile")}>
              <div className="user-avatar">A</div>
            </div>
          </div>
        </header>

        <div className="admin-content" style={{ padding: "24px" }}>
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
              <Outlet context={{ period, setPeriod }} />
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

