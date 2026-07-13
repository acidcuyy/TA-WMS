import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  subscribeNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "../../services/wmsApi";
import "./NotificationSystem.css";

export default function NotificationSystem({ role }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastNotif, setLastNotif] = useState(null);
  const dropdownRef = useRef(null);
  const isFirstRender = useRef(true);
  const lastShownNotifId = useRef(null);

  useEffect(() => {
    const unsub = subscribeNotifications((all) => {
      // Filter by role
      const filtered = all.filter(n => 
        !n.targetRoles || n.targetRoles.includes(role.toLowerCase())
      );
      
      setNotifications(filtered);

      // Show toast for new unread notification
      if (isFirstRender.current) {
        if (filtered.length > 0) {
          lastShownNotifId.current = filtered[0].id;
        }
      } else if (filtered.length > 0) {
        const newest = filtered[0];
        if (!newest.isRead && newest.id !== lastShownNotifId.current) {
          setLastNotif(newest);
          setShowToast(true);
          lastShownNotifId.current = newest.id;
          setTimeout(() => setShowToast(false), 5000);
        }
      }
      isFirstRender.current = false;
    });

    return () => unsub();
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(role);
  };

  const handleNotifClick = (n) => {
    markNotificationAsRead(n.id);
    setIsOpen(false);
    
    const roleLower = role.toLowerCase();
    const base = `/${roleLower}`;

    // Extract ID from message, e.g. REQ-123456 or ADM-RST-12345
    const extractId = (msg) => {
      if (!msg) return null;
      // Match REQ-123456 or ADM-RST-123456 or TRF-123456
      const match = msg.match(/[A-Z]+(?:-[A-Z]+)*-\d+/i);
      return match ? match[0].toUpperCase() : null;
    };
    
    const relatedId = extractId(n.message);
    const msgLower = (n.message || "").toLowerCase();
    const titleLower = (n.title || "").toLowerCase();

    // Prioritize tracking/shipping notifications
    const isShippingRelated = 
      n.type === 'pickup' || 
      n.type === 'shipping' || 
      n.type === 'shipping_complete' || 
      n.type === 'received' ||
      titleLower.includes('pengiriman') || 
      msgLower.includes('dalam perjalanan');

    console.log("NOTIF CLICK DEBUG:", {
      role: roleLower, 
      type: n.type, 
      title: titleLower, 
      relatedId, 
      isShippingRelated
    });

    if (isShippingRelated) {
        if (roleLower === 'driver') {
          navigate(`${base}/tracking`);
        }
        else if (roleLower === 'toko') {
          const dest = relatedId ? `${base}/pengiriman/${relatedId}` : `${base}/request`;
          console.log("Navigating Toko to:", dest);
          navigate(dest);
        }
        else if (roleLower === 'gudang') {
          const dest = relatedId ? `${base}/pengiriman/${relatedId}` : `${base}/pengiriman`;
          console.log("Navigating Gudang to:", dest);
          navigate(dest);
        }
        else if (roleLower === 'admin') {
          const dest = relatedId ? `${base}/pengiriman/${relatedId}` : `${base}/requests`;
          console.log("Navigating Admin to:", dest);
          navigate(dest);
        }
        return;
    }

    switch(n.type) {
      // Requests from Toko
      case 'request_toko':
      case 'request_accepted':
      case 'request_declined':
        if (roleLower === 'toko') navigate(`${base}/request`, { state: { openRequestId: relatedId } });
        else navigate(`${base}/requests`, { state: { openRequestId: relatedId } });
        break;
        
      // Restock (Gudang -> Admin)
      case 'restock_new':
      case 'restock_accepted':
      case 'restock_done':
        navigate(`${base}/requests`, { state: { openRequestId: relatedId } });
        break;

      // Admin Restock (Admin -> Gudang)
      case 'admin_restock_new':
      case 'admin_restock_accepted':
      case 'admin_restock_done':
        if (roleLower === 'gudang') navigate(`${base}/orders`, { state: { openRequestId: relatedId } });
        else navigate(`${base}/requests`, { state: { openRequestId: relatedId } });
        break;

      // Reports
      case 'toko_report_new':
      case 'gudang_report_new':
        if (roleLower === 'admin') navigate(`${base}/laporan`);
        break;

      default:
        // Fallbacks for unmapped types
        if (n.type && n.type.includes('report')) {
          navigate(`${base}/laporan`);
        } else if (n.type && (n.type.includes('restock') || n.type.includes('request'))) {
          if (roleLower === 'toko') navigate(`${base}/request`, { state: { openRequestId: relatedId } });
          else navigate(`${base}/requests`, { state: { openRequestId: relatedId } });
        } else {
          navigate(base); // Dashboard fallback
        }
        break;
    }
  };

  return (
    <div className="notif-system" ref={dropdownRef}>
      {/* BELL ICON */}
      <button className="notif-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="notif-icon">🔔</span>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="notif-dropdown"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notif-dropdown__header">
              <h3>Notifikasi</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead}>Tandai semua dibaca</button>
              )}
            </div>

            <div className="notif-dropdown__list">
              {notifications.length === 0 ? (
                <div className="notif-empty">Tidak ada notifikasi</div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`notif-item ${!n.isRead ? 'notif-item--unread' : ''}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <div className="notif-item__icon">
                      {n.type === 'request_toko' ? '🛒' : 
                       n.type === 'shipping' ? '🚚' : 
                       n.type === 'done' ? '✅' : '📄'}
                    </div>
                    <div className="notif-item__content">
                      <div className="notif-item__title">{n.title}</div>
                      <div className="notif-item__message">{n.message}</div>
                      <div className="notif-item__time">{n.time}</div>
                    </div>
                    {!n.isRead && <div className="notif-item__dot"></div>}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && lastNotif && (
          <motion.div 
            className="notif-toast"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={() => {
              setShowToast(false);
              setIsOpen(true);
            }}
          >
            <div className="notif-toast__icon">🔔</div>
            <div className="notif-toast__content">
              <b>{lastNotif.title}</b>
              <p>{lastNotif.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
