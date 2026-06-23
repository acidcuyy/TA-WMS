import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ logo, role, menuItems, bottomItems, onLogoutClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Tutup menu mobile ketika pindah halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Ambil maksimal 4 item pertama untuk ditampilkan di bottom bar ala Shopee
  const allMainItems = menuItems.reduce((acc, group) => [...acc, ...group.items], []);
  const mobileBottomItems = allMainItems.slice(0, 4);

  return (
    <>
      {/* =========================================
          1. DESKTOP SIDEBAR 
          ========================================= */}
      <aside className="sidebar-component desktop-only">
        <div className="sidebar-header">
          <img src={logo} alt="ReaStock" className="sidebar-logo" />
        </div>

        {role && <div className="sidebar-role-label">{role.toUpperCase()}</div>}

        <nav className="sidebar-nav">
          {menuItems.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              {group.title && <div className="nav-group-title">{group.title}</div>}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/${role.toLowerCase()}`}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          {bottomItems && bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.hasArrow && <span className="nav-arrow">›</span>}
            </NavLink>
          ))}

          <button onClick={onLogoutClick} className="logout-btn">
            <span className="nav-icon">↪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================================
          2. MOBILE BOTTOM NAV (SHOPEE STYLE)
          ========================================= */}
      <nav className="mobile-bottom-nav">
        {mobileBottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === `/${role.toLowerCase()}`}
            className={({ isActive }) => `m-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="m-nav-icon">
              {item.icon}
              {item.badge > 0 && <span className="m-nav-badge">{item.badge}</span>}
            </span>
            <span className="m-nav-label">{item.label}</span>
          </NavLink>
        ))}
        {/* Tombol Menu Tambahan */}
        <button 
          className={`m-nav-item btn-menu-mobile ${isMobileMenuOpen ? "active" : ""}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="m-nav-icon">☰</span>
          <span className="m-nav-label">Menu</span>
        </button>
      </nav>

      {/* =========================================
          3. MOBILE OVERLAY FULL MENU
          ========================================= */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <div className="m-menu-header">
            <img src={logo} alt="ReaStock" className="m-menu-logo" />
            <button className="m-close-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
          </div>
          
          <div className="m-menu-scroll">
            {role && <div className="m-role-label">{role.toUpperCase()}</div>}
            
            {menuItems.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                {group.title && <div className="m-group-title">{group.title}</div>}
                <div className="m-group-items">
                  {group.items.map((item) => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `m-full-nav-item ${isActive ? "active" : ""}`}>
                      <span className="m-full-icon">{item.icon}</span>
                      <span className="m-full-label">{item.label}</span>
                      {item.badge > 0 && <span className="m-full-badge">{item.badge}</span>}
                    </NavLink>
                  ))}
                </div>
              </React.Fragment>
            ))}

            <div className="m-footer-items">
              {bottomItems && bottomItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `m-full-nav-item ${isActive ? "active" : ""}`}>
                  <span className="m-full-icon">{item.icon}</span>
                  <span className="m-full-label">{item.label}</span>
                </NavLink>
              ))}
              <button onClick={onLogoutClick} className="m-logout-btn">
                <span className="m-full-icon">↪</span>
                <span className="m-full-label">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


