import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./Sidebar.css";

const Sidebar = ({ role, logo, menuItems, bottomItems, onLogoutClick }) => {
  const location = useLocation();

  return (
    <aside className="sidebar-component">
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
  );
};

export default Sidebar;
