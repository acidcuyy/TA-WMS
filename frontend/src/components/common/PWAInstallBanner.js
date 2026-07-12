// src/components/common/PWAInstallBanner.js
// Banner install PWA untuk Android (native prompt) dan iOS (petunjuk manual)

import { useState, useEffect } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import "./PWAInstallBanner.css";

export default function PWAInstallBanner() {
  const { canInstall, isIOS, isStandalone, triggerInstall, hasNativePrompt } =
    usePWAInstall();

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Jangan tampilkan jika sudah dismiss sebelumnya (ingat selama session)
    const wasDismissed = sessionStorage.getItem("pwa_banner_dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Tampilkan banner setelah 3 detik agar tidak langsung mengagetkan
    if (canInstall && !isStandalone) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isStandalone]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("pwa_banner_dismissed", "1");
  };

  const handleInstall = async () => {
    if (isIOS) return; // iOS: hanya tampilkan instruksi
    setInstalling(true);
    await triggerInstall();
    setInstalling(false);
    setVisible(false);
  };

  if (!visible || dismissed || isStandalone) return null;

  return (
    <div className="pwa-banner" role="dialog" aria-label="Install aplikasi">
      <div className="pwa-banner__inner">
        {/* Icon */}
        <div className="pwa-banner__icon">
          <img src="/logo192.png" alt="ReaStock" />
        </div>

        {/* Content */}
        <div className="pwa-banner__content">
          <p className="pwa-banner__title">
            {isIOS ? "Tambahkan ke Homescreen" : "Install Aplikasi"}
          </p>
          <p className="pwa-banner__desc">
            {isIOS
              ? "Buka ReaStock langsung dari homescreen seperti app native"
              : "Install ReaStock di perangkat Anda untuk akses lebih cepat"}
          </p>

          {/* Petunjuk khusus iOS */}
          {isIOS && (
            <div className="pwa-ios-steps">
              <div className="pwa-ios-step">
                <span className="step-num">1</span>
                <span>
                  Tap ikon{" "}
                  <strong>
                    Share{" "}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </strong>{" "}
                  di bawah layar Safari
                </span>
              </div>
              <div className="pwa-ios-step">
                <span className="step-num">2</span>
                <span>
                  Pilih <strong>"Add to Home Screen"</strong>
                </span>
              </div>
              <div className="pwa-ios-step">
                <span className="step-num">3</span>
                <span>
                  Tap <strong>"Add"</strong> di pojok kanan atas
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pwa-banner__actions">
          {!isIOS && hasNativePrompt && (
            <button
              className="pwa-btn pwa-btn--install"
              onClick={handleInstall}
              disabled={installing}
            >
              {installing ? "⏳" : "⬇️"} {installing ? "Menginstall..." : "Install"}
            </button>
          )}
          <button className="pwa-btn pwa-btn--dismiss" onClick={handleDismiss}>
            {isIOS ? "Tutup" : "Nanti"}
          </button>
        </div>
      </div>
    </div>
  );
}
