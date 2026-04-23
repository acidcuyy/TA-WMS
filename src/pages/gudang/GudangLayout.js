import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../app/ThemeProvider";
import "./GudangLayout.css";

import logoSideDark from "../../assets/images/LogoSide_dark.png";
import logoSideDefault from "../../assets/images/LogoSide_default.png";
import avatarImg from "../../assets/images/stok.jpg"; // Placeholder avatar

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
    { label: "Dashboard", path: "/gudang", icon: "⊞", group: "GUDANG" },
    { label: "Penerimaan Barang", path: "/gudang/penerimaan", icon: "⬇️", group: "GUDANG" },
    { label: "Pengeluaran Barang", path: "/gudang/pengeluaran", icon: "⬆️", group: "GUDANG" },
    { label: "Transfer Barang", path: "/gudang/transfer", icon: "⇄", group: "GUDANG" },
    { label: "Stok & Produk", path: "/gudang/stok", icon: "📦", group: "GUDANG" },
    { label: "Request Masuk", path: "/gudang/requests", icon: "📥", group: "GUDANG" },
    { label: "Order Masuk", path: "/gudang/orders", icon: "🗒", group: "GUDANG" },
    
    { label: "Laporan", path: "/gudang/laporan", icon: "🗒", group: "LAPORAN" },
  ];

  return (
    <div className="gudang-container">
      {/* SIDEBAR */}
      <aside className="gudang-sidebar">
        <div className="sidebar-header">
          <img src={currentLogo} alt="ReaStock" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">GUDANG</div>
          {menuItems.filter(item => item.group === "GUDANG").map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
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
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/gudang/settings" className="nav-item">
            <span className="nav-icon">⚙</span> <span>Pengaturan</span>
          </Link>
          <Link to="/gudang/profile" className="nav-item">
            <span className="nav-icon">👤</span> <span>Profile</span>
          </Link>
          <button onClick={() => setShowLogoutModal(true)} className="logout-btn">
             Logout
          </button>
        </div>
      </aside>

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
