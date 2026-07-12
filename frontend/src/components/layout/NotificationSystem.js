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
    
    // Simple routing based on role and type
    const base = `/${role.toLowerCase()}`;
    if (n.type === 'request_toko' || n.type === 'request_accepted' || n.type === 'request_declined') {
      navigate(`${base}/requests`);
    } else if (n.type === 'shipping') {
      navigate(`${base}/requests`); // Or specific shipping page if available
    } else if (n.type === 'restock_new' || n.type === 'restock_accepted') {
      navigate(`${base}/requests`);
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
