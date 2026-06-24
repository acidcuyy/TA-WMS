import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { ThemeProvider } from "./app/ThemeProvider";

import "./styles/tokens.css";
import "./styles/globals.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

/* ── Registrasi Service Worker (PWA) ── */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("[PWA] Service Worker terdaftar:", registration.scope);

        // Cek update SW secara berkala
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[PWA] Update tersedia — akan aktif saat reload.");
            }
          };
        };
      })
      .catch((err) => {
        console.warn("[PWA] Gagal mendaftarkan Service Worker:", err);
      });
  });
}

