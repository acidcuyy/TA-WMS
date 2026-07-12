// src/hooks/usePWAInstall.js
// Hook untuk mendeteksi dan memicu install prompt PWA (Android/Chrome)
// iOS tidak support beforeinstallprompt, ditangani secara terpisah

import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Deteksi iOS
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Deteksi mode standalone (sudah terinstall)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    // Tangkap event beforeinstallprompt (Chrome/Android)
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Event saat app berhasil terinstall
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Fungsi trigger install (Android/Chrome)
  const triggerInstall = async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
    return outcome === "accepted";
  };

  // Apakah bisa menampilkan tombol install
  const canInstall = !isInstalled && (!!installPrompt || isIOS);

  return {
    canInstall,
    isInstalled,
    isIOS,
    isStandalone,
    triggerInstall,
    hasNativePrompt: !!installPrompt,
  };
}
