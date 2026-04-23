import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminLayout.css";

import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";

import { useTheme } from "../../app/ThemeProvider";

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
    { label: "Dashboard", path: "/admin", icon: "⊞", group: "MAIN" },
    { label: "Manajemen Stok Gudang", path: "/admin/stok-gudang", icon: "⛃", group: "MAIN" },
    { label: "Manajemen Gudang", path: "/admin/gudang", icon: "⌂", group: "MAIN" },
    { label: "Manajemen Toko", path: "/admin/toko", icon: "🛒", group: "MAIN" },
    { label: "Manajemen Produk", path: "/admin/produk", icon: "📦", group: "MAIN" },
    { label: "Manajemen Order", path: "/admin/order", icon: "🗒", group: "MAIN" },
    { label: "Request", path: "/admin/requests", icon: "🚚", group: "MAIN" },
    
    { label: "Laporan Stok", path: "/admin/laporan-stok", icon: "🗒", group: "LAPORAN" },
    { label: "Laporan Order", path: "/admin/laporan-order", icon: "🗒", group: "LAPORAN" },
    { label: "Laporan Pergerakan Stok", path: "/admin/laporan-pergerakan", icon: "🗒", group: "LAPORAN" },
    { label: "Laporan Produksi", path: "/admin/laporan-produksi", icon: "🗒", group: "LAPORAN" },
  ];

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={currentLogo} alt="ReaStock" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">MAIN</div>
          {menuItems.filter(item => item.group === "MAIN").map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="nav-group">LAPORAN</div>
          {menuItems.filter(item => item.group === "LAPORAN").map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin/profile" className="nav-item">
            <span className="nav-icon">👤</span> Profile
          </Link>
          <Link to="/admin/settings" className="nav-item">
            <span className="nav-icon">⚙</span> Setting <span className="nav-arrow">›</span>
          </Link>
          <button onClick={() => setShowLogoutModal(true)} className="logout-btn">
             Logout
          </button>
        </div>
      </aside>

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

