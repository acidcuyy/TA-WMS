import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import Button from "../../components/common/Button";
import logo from "../../assets/images/logo.png";

export default function Login() {
  const nav = useNavigate();
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  // fade-out (tetap, jangan diubah)
  const [isLeaving, setIsLeaving] = useState(false);

  // ✅ controlled inputs
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");

  // ✅ error message (biar UX bagus)
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const eLower = email.trim().toLowerCase();
    const p = password.trim();

    // ✅ mapping kredensial -> role + tujuan
    const users = {
      "admin@gmail.com": { pass: "admin", role: "admin", path: "/admin" },
      "gudang@gmail.com": { pass: "gudang", role: "gudang", path: "/gudang" },
      "toko@gmail.com": { pass: "toko", role: "toko", path: "/toko" },
    };

    const user = users[eLower];

    if (!user || user.pass !== p) {
      setError("Email atau password salah.");
      return;
    }

    // ✅ simpan role untuk kebutuhan app (guard nanti / topbar, dll)
    localStorage.setItem("reastock_role", user.role);

    // trigger fade-out
    setIsLeaving(true);

    // pindah setelah animasi selesai (durasi kamu 0.42s)
    setTimeout(() => {
      nav(user.path);
    }, 420);
  };

  return (
    <motion.div
      className="reastock-login-container"
      initial={{ opacity: 1 }}
      animate={{
        opacity: isLeaving ? 0 : 1,
        filter: isLeaving ? "blur(6px)" : "blur(0px)",
      }}
      transition={{ duration: 0.42, ease: easing }}
    >
      {/* LEFT SECTION: BRANDING */}
      <motion.div 
        className="login-brand-section"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easing }}
      >
        <div className="brand-content">
          <div className="brand-logo-wrapper">
            <img src={logo} alt="ReaStock Logo" className="brand-logo" />
            <div className="brand-text-group">
              <h1 className="brand-name">ReaStock</h1>
              <p className="brand-tagline">The most popular Warehouse System is here.</p>
              <button className="know-more-btn">
                Know More <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT SECTION: FORM */}
      <motion.div 
        className="login-form-section"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easing }}
      >
        <div className="form-container">
          <header className="form-header">
            <h2 className="form-title">Hello!</h2>
            <p className="form-subtitle">Sign in to Get Started</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <input
                type="email"
                placeholder="Username / Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>

            {error && <div className="form-error-msg">{error}</div>}

            <button type="submit" className="login-submit-btn">
              Login
            </button>

            <div className="form-options">
              <span className="remember-text">Remember</span>
            </div>
          </form>

          <footer className="form-footer">
            Developed & Maintained By Soori Solutinns
          </footer>
        </div>
      </motion.div>
    </motion.div>
  );
}
