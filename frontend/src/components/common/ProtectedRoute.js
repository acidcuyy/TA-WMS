import { Navigate, Outlet } from "react-router-dom";

/**
 * Route guard — cek apakah user sudah login dan punya role yang sesuai.
 *
 * @param {string} allowedRole - Role yang boleh mengakses route ini ("admin" | "gudang" | "toko" | "driver")
 *
 * Behavior:
 * - Belum login (tidak ada reastock_role di localStorage) → redirect ke /login
 * - Sudah login tapi role tidak sesuai → redirect ke dashboard role yang benar
 * - Sudah login dan role sesuai → render child routes (Outlet)
 */
export default function ProtectedRoute({ allowedRole }) {
  const currentRole = localStorage.getItem("reastock_role");

  // Belum login → ke halaman login
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  // Sudah login tapi role tidak sesuai → arahkan ke dashboard role-nya
  if (currentRole !== allowedRole) {
    const rolePaths = {
      admin: "/admin",
      gudang: "/gudang",
      toko: "/toko",
      driver: "/driver",
    };
    const correctPath = rolePaths[currentRole] || "/login";
    return <Navigate to={correctPath} replace />;
  }

  // Role sesuai → render halaman
  return <Outlet />;
}
