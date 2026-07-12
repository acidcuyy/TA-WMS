import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getBranchUsers } from "../../services/wmsApi";
import "./Login.css";

import logo from "../../assets/images/logo.png";
import SplitText from "../../components/animations/SplitText";
import DotField from "../../components/animations/DotField";

export default function Login() {
  const nav = useNavigate();
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  // fade-out (tetap, jangan diubah)
  const [isLeaving, setIsLeaving] = useState(false);

  // ✅ controlled inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ error message (biar UX bagus)
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("reastock_saved_email");
    const savedPassword = localStorage.getItem("reastock_saved_password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const eLower = email.trim().toLowerCase();
    const p = password.trim();

    try {
      const { login } = await import("../../services/wmsApi");
      const data = await login(eLower, p);

      // Save credentials in sessionStorage
      sessionStorage.setItem("reastock_token", data.token);

      const user = data.user;
      let resolvedRole = "gudang";
      if (user.role.toUpperCase() === "ADMIN" || user.role.toUpperCase() === "SUPER_ADMIN") {
        resolvedRole = "admin";
      } else if (user.role.toUpperCase() === "DRIVER") {
        resolvedRole = "driver";
      } else if (user.branchType === "toko" || user.role.toUpperCase() === "TOKO") {
        resolvedRole = "toko";
      }

      sessionStorage.setItem("reastock_role", resolvedRole);
      sessionStorage.setItem("reastock_user_name", user.name || "User");
      sessionStorage.setItem("reastock_user_email", user.email || user.username);
      sessionStorage.setItem("reastock_user_joinDate", user.joinedAt || "10 Januari 2025");
      sessionStorage.setItem("reastock_company_id", user.companyId || "");

      if (user.branchId) {
        sessionStorage.setItem("reastock_branch_id", user.branchId);
        sessionStorage.setItem("reastock_branch_name", user.branchName || "");
      } else {
        sessionStorage.removeItem("reastock_branch_id");
        sessionStorage.removeItem("reastock_branch_name");
      }

      if (rememberMe) {
        localStorage.setItem("reastock_saved_email", eLower);
        localStorage.setItem("reastock_saved_password", p);
      } else {
        localStorage.removeItem("reastock_saved_email");
        localStorage.removeItem("reastock_saved_password");
      }

      // ✅ redirect (smooth transition)
      setIsLeaving(true);
      setTimeout(() => {
        nav(`/${resolvedRole}`);
      }, 420);

    } catch (err) {
      setError(err.message || "Username/Email atau password salah.");
    }
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
        <DotField
          dotRadius={1.8}
          dotSpacing={16}
          cursorRadius={250}
          bulgeStrength={40}
          gradientFrom="#a66e2d"
          gradientTo="#e67e22"
          glowColor="rgba(255, 255, 255, 0.2)"
        />
        <div className="brand-content">
          <div className="brand-logo-wrapper">
            <img src={logo} alt="ReaStock Logo" className="brand-logo" />
            <div className="brand-text-group">
              <SplitText
                tag="h1"
                text="ReaStock"
                className="brand-name"
                delay={300}
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                ease="back.out(2)"
                threshold={0.1}
                textAlign="left"
              />
              <SplitText
                tag="p"
                text="The Most Advance"
                className="brand-tagline"
                delay={500}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                ease="power2.out"
                threshold={0.1}
                textAlign="left"
              />
              <SplitText
                tag="p"
                text="Warehouse System is here"
                className="brand-tagline"
                delay={800}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                ease="power2.out"
                threshold={0.1}
                textAlign="left"
              />
              <button type="button" className="know-more-btn" onClick={() => nav("/register")}>
                Register Your Company <span>→</span>
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
            <SplitText
              tag="h2"
              text="Hello!"
              className="auth-form-title"
              delay={400}
              from={{ opacity: 0, x: 20 }}
              to={{ opacity: 1, x: 0 }}
              ease="power3.out"
              threshold={0.1}
              textAlign="left"
            />
            <SplitText
              tag="p"
              text="Sign in to Get Started"
              className="form-subtitle"
              delay={600}
              from={{ opacity: 0, y: 10 }}
              to={{ opacity: 1, y: 0 }}
              ease="power2.out"
              threshold={0.1}
              textAlign="left"
            />
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <input
                type="text"
                placeholder="Username / Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""))}
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
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#e67e22" }}
                />
                <span className="remember-text" style={{ fontSize: "14px", color: "var(--text, #1e293b)", userSelect: "none" }}>Remember me</span>
              </label>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
