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

