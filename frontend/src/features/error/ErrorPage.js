import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useRouteError } from "react-router-dom";
import "./ErrorPage.css";

export default function ErrorPage({ code, title, message }) {
  const navigate = useNavigate();
  const error = useRouteError();
  const [showDetails, setShowDetails] = useState(false);

  // Fallback resolving: custom props > route errors > default 404
  const errorCode = code || error?.status || "404";
  const errorTitle = title || error?.statusText || (
    errorCode === 404 || errorCode === "404" 
      ? "Halaman Tidak Ditemukan" 
      : errorCode === 403 || errorCode === "403"
      ? "Akses Ditolak"
      : "Terjadi Kesalahan Sistem"
  );
  
  const errorDesc = message || error?.data || error?.message || (
    errorCode === 404 || errorCode === "404"
      ? "Maaf, halaman yang Anda tuju tidak dapat ditemukan di dalam sistem ReaStock WMS. Silakan periksa kembali URL Anda."
      : errorCode === 403 || errorCode === "403"
      ? "Anda tidak memiliki hak akses yang diperlukan untuk melihat halaman ini. Silakan hubungi Super Admin jika Anda rasa ini kesalahan."
      : "Terjadi gangguan internal pada server kami. Tim kami sedang berusaha memperbaikinya secepat mungkin."
  );

  const technicalDetail = error?.stack || (error?.message ? `${error.name}: ${error.message}` : "");
  const DEBUG_MODE = false;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const easing = [0.22, 1, 0.36, 1];

  return (
    <div className="reastock-error-container">
      {/* Decorative BG Blur Blobs */}
      <div className="error-blur-blob blob-orange"></div>
      <div className="error-blur-blob blob-yellow"></div>

      <motion.div 
        className="error-card"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: easing }}
      >
        <div className="error-illustration-section">
          {/* Custom SVG WMS Error Illustration */}
          <svg className="error-svg" viewBox="0 0 400 300" width="100%" height="240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shadows */}
            <ellipse cx="200" cy="250" rx="90" ry="15" fill="#e2e8f0" opacity="0.8" />
            <ellipse cx="140" cy="253" rx="40" ry="8" fill="#cbd5e1" opacity="0.6" />

            {/* Warehouse Rack Frame */}
            <path d="M100 80h10v170h-10zM290 80h10v170h-10z" fill="#94a3b8" />
            <path d="M100 110h200v8H100zM100 180h200v8H100z" fill="#64748b" />
            
            {/* Caution Stripes on Shelf bar */}
            <path d="M120 110l10 8h10l-10-8zm30 0l10 8h10l-10-8zm30 0l10 8h10l-10-8zm30 0l10 8h10l-10-8zm30 0l10 8h10l-10-8z" fill="#f59e0b" />
            <path d="M120 180l10 8h10l-10-8zm30 0l10 8h10l-10-8zm30 0l10 8h10l-10-8zm30 0l10 8h10l-10-8zm30 0l10 8h10l-10-8z" fill="#f59e0b" />

            {/* Normal Box on Bottom Shelf */}
            <rect x="210" y="195" width="55" height="55" rx="6" fill="#e2915a" />
            <path d="M210 215h55v6H210z" fill="#d37b40" />

            {/* Broken/Sad Box on Top Shelf */}
            <g className="bounce-box-animate">
              {/* Box body */}
              <rect x="135" y="125" width="55" height="55" rx="6" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
              {/* Tape */}
              <path d="M135 145h55v6H135z" fill="#d35400" />
              {/* Caution sign badge */}
              <path d="M162.5 133l12 20h-24z" fill="#f59e0b" />
              <circle cx="162.5" cy="148" r="1" fill="#fff" />
              <path d="M162.5 139v6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Sad eyes */}
              <circle cx="150" cy="162" r="2.5" fill="#334155" />
              <circle cx="175" cy="162" r="2.5" fill="#334155" />
              {/* Frown mouth */}
              <path d="M157 172a6 6 0 0111 0" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Broken Box Cracks */}
            <path d="M140 120l6 8-4 4" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />

            {/* Warnings Alert Shield Floating */}
            <g className="float-shield-animate">
              {/* Shield base */}
              <path d="M240 85c0-12 12-16 25-16s25 4 25 16c0 18-25 32-25 32s-25-14-25-32z" fill="#ef4444" />
              {/* Shield inner */}
              <path d="M245 87c0-10 10-13 20-13s20 3 20 13c0 15-20 27-20 27s-20-12-20-27z" fill="#dc2626" />
              {/* Exclamation point */}
              <rect x="263" y="79" width="4" height="12" rx="2" fill="#fff" />
              <circle cx="265" cy="98" r="2.5" fill="#fff" />
            </g>
          </svg>
        </div>

        <div className="error-text-section">
          <div className="error-badge">
            <span className="error-badge-code">Error {errorCode}</span>
          </div>

          <h1 className="error-title">{errorTitle}</h1>
          <p className="error-description">{errorDesc}</p>

          {/* Action buttons */}
          <div className="error-actions">
            <button className="btn-secondary" onClick={handleGoBack}>
              ← Kembali
            </button>
            <button className="btn-primary btn-home" onClick={handleGoHome}>
              Ke Beranda WMS
            </button>
          </div>

          {/* Technical Details Accordion */}
          {DEBUG_MODE && technicalDetail && (
            <div className="error-details-accordion">
              <button 
                className="accordion-trigger" 
                onClick={() => setShowDetails(!showDetails)}
              >
                <span>{showDetails ? "Sembunyikan" : "Tampilkan"} Detail Diagnostik</span>
                <span className={`accordion-icon ${showDetails ? "open" : ""}`}>▼</span>
              </button>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div 
                    className="accordion-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <pre className="error-log-box">
                      <code>{technicalDetail}</code>
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
