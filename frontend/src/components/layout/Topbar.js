import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Topbar.css";

import logo from "../../assets/images/logo.png";
import logoLight from "../../assets/images/logoLight.png";

export default function Topbar({
  onScrollToFeatures,
  basePath = "/admin",
  avatarLetter = "A",
  showRequests = true,
}) {
  const nav = useNavigate();
  const location = useLocation();

  const homePath = basePath;
  const isHome =
    location.pathname === homePath || location.pathname === `${homePath}/`;

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  // logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme || "warm"
  );

  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpenProfile(false);
        setOpenNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setTheme(root.dataset.theme || "warm");
    updateTheme();

    const obs = new MutationObserver(() => updateTheme());
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const currentLogo = theme === "dark" ? logoLight : logo;

  const go = (path) => {
    setOpenProfile(false);
    setOpenNotif(false);
    nav(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("reastock_role");
    setShowLogoutConfirm(false);
    nav("/login");
  };

  const notifications = [
    {
      id: 1,
      title: "Stok menipis",
      desc: "BRG-002 tinggal 5 item (Gudang)",
      time: "Baru saja",
    },
    {
      id: 2,
      title: "Request masuk",
      desc: "REQ-014 dari Toko A membutuhkan 12 item",
      time: "10:12",
    },
    {
      id: 3,
      title: "Sinkronisasi",
      desc: "Data tersinkron otomatis (Realtime)",
      time: "09:40",
    },
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          {/* LEFT */}
          <button className="topbar__brand" onClick={() => go(homePath)}>
            <img className="topbar__brandLogo" src={currentLogo} alt="ReaStock" />
          </button>

          {/* CENTER */}
          <div className="topbar__right" ref={wrapRef}>
            {showRequests && (
              <button
                className="topbar__chip"
                onClick={() => go(`${basePath}/requests`)}
              >
                Request&apos;s
              </button>
            )}

            {isHome && (
              <button className="topbar__chip" onClick={onScrollToFeatures}>
                Features
              </button>
            )}

          {/* RIGHT */}
          <div className="topbar__left">
            <button className="topbar__iconBtn" onClick={() => go(homePath)}>
              ⌂
            </button>

            <div className="topbar__search">
              <span className="topbar__searchIcon">⌕</span>
              <input placeholder="Search..." />
            </div>
          </div>

            {/* NOTIFICATION TOGGLE */}
            <button
              className="topbar__chip"
              onClick={() => {
                setOpenProfile(false);
                setOpenNotif((v) => !v);
              }}
            >
              Notification
              <span className="topbar__badge">{notifications.length}</span>
            </button>

            {/* ✅ NOTIFICATION DROPDOWN (FIX) */}
            <div
              className={`topbar__menu topbar__menu--notif ${
                openNotif ? "is-open" : ""
              }`}
            >
              <div className="topbar__menuTitle">
                <span>Notifications</span>
                <button
                  className="topbar__menuAction"
                  type="button"
                  onClick={() => setOpenNotif(false)}
                >
                  Close
                </button>
              </div>

              <div className="topbar__notifList">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className="topbar__notifItem"
                    type="button"
                    onClick={() => setOpenNotif(false)}
                  >
                    <div className="topbar__notifTop">
                      <span className="topbar__notifTitle">{n.title}</span>
                      <span className="topbar__notifTime">{n.time}</span>
                    </div>
                    <div className="topbar__notifDesc">{n.desc}</div>
                  </button>
                ))}
              </div>

              <div className="topbar__menuDivider" />

              <button
                className="topbar__menuItemBtn"
                type="button"
                onClick={() => {
                  setOpenNotif(false);
                  // opsional: arahkan ke halaman notifikasi jika nanti kamu punya
                  // go(`${basePath}/notifications`);
                }}
              >
                Lihat semua notifikasi
              </button>
            </div>

            {/* AVATAR */}
            <button
              className={`topbar__avatar ${openProfile ? "is-open" : ""}`}
              onClick={() => {
                setOpenNotif(false);
                setOpenProfile((v) => !v);
              }}
            >
              {avatarLetter}
            </button>

            {/* PROFILE MENU */}
            <div className={`topbar__menu ${openProfile ? "is-open" : ""}`}>
              <button
                className="topbar__menuItemBtn"
                onClick={() => go(`${basePath}/profile`)}
              >
                Profile
              </button>
              <button
                className="topbar__menuItemBtn"
                onClick={() => go(`${basePath}/settings`)}
              >
                Settings
              </button>
              <div className="topbar__menuDivider" />
              <button
                className="topbar__menuItemBtn topbar__menuItemBtn--danger"
                onClick={() => {
                  setOpenProfile(false);
                  setOpenNotif(false);
                  setShowLogoutConfirm(true);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div className="logoutOverlay">
          <div className="logoutModal">
            <h3>Apakah anda yakin ingin logout?</h3>

            <div className="logoutActions">
              <button
                className="logoutBtn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="logoutBtn logoutBtn--danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}