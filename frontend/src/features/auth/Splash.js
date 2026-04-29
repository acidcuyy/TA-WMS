import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

import logo from "../../assets/images/logo.png";

export default function Splash() {
  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => nav("/login"), 4000); // ✅ 4 detik
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div className="splash">
      <img className="splash__logo" src={logo} alt="ReaStock" />

      {/* ✅ loader melingkar */}
      <div className="splash__spinnerWrap">
        <div className="splash__spinner" />
        <div className="splash__text">Loading...</div>
      </div>
    </div>
  );
}
