import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mosaic } from "react-loading-indicators";
import "./Splash.css";

import logo from "../../assets/images/logo.png";
import DotField from "../../components/animations/DotField";

export default function Splash() {
  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => nav("/login"), 4000); // ✅ 4 detik
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div className="splash">
      <DotField
        dotRadius={1.8}
        dotSpacing={16}
        cursorRadius={250}
        bulgeStrength={40}
        gradientFrom="#a66e2d"
        gradientTo="#e67e22"
        glowColor="rgba(255, 255, 255, 0.2)"
      />
      <img className="splash__logo" src={logo} alt="ReaStock" />

      {/* ✅ loader mosaic */}
      <div className="splash__spinnerWrap">
        <Mosaic color="#D48854" size="small" text="" textColor="" speedPlus={2} />
      </div>
    </div>
  );
}
