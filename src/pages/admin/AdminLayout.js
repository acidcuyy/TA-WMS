import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminLayout.css";

import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";

import { useTheme } from "../../app/ThemeProvider";

import Sidebar from "../../components/layout/Sidebar";

export default function AdminLayout() {
  const featuresRef = useRef(null);
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
      title: "MAIN",
      items: [
        { label: "Dashboard", path: "/admin", icon: "⊞" },
        { label: "Manajemen Stok Gudang", path: "/admin/stok-gudang", icon: "⛃" },
        { label: "Manajemen Gudang", path: "/admin/gudang", icon: "⌂" },
        { label: "Manajemen Toko", path: "/admin/toko", icon: "🛒" },
        { label: "Manajemen Produk", path: "/admin/produk", icon: "📦" },
        { label: "Manajemen Order", path: "/admin/order", icon: "🗒" },
        { label: "Request", path: "/admin/requests", icon: "🚚" },
      ]
    },
    {
      title: "LAPORAN",
      items: [
        { label: "Laporan Stok", path: "/admin/laporan-stok", icon: "🗒" },
        { label: "Laporan Order", path: "/admin/laporan-order", icon: "🗒" },
        { label: "Laporan Pergerakan Stok", path: "/admin/laporan-pergerakan", icon: "🗒" },
        { label: "Laporan Produksi", path: "/admin/laporan-produksi", icon: "🗒" },
      ]
    }
  ];

  const bottomItems = [
    { label: "Profile", path: "/admin/profile", icon: "👤" },
    { label: "Pengaturan", path: "/admin/settings", icon: "⚙", hasArrow: true },
  ];

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
        <Outlet context={{ featuresRef }} />
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

