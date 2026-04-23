import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import Splash from "../features/auth/Splash";
import Login from "../features/auth/Login";

// Admin
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProfileAdmin from "../pages/admin/ProfileAdmin";
import SettingsAdmin from "../pages/admin/SettingsAdmin";
import RequestsAdmin from "../pages/admin/RequestsAdmin";
import ManajemenStok from "../pages/admin/ManajemenStok";
import ManajemenGudang from "../pages/admin/ManajemenGudang";
import ManajemenToko from "../pages/admin/ManajemenToko";
import ManajemenProduk from "../pages/admin/ManajemenProduk";
import ManajemenOrder from "../pages/admin/ManajemenOrder";
import LaporanStok from "../pages/admin/LaporanStok";
import LaporanOrder from "../pages/admin/LaporanOrder";
import LaporanPergerakanStok from "../pages/admin/LaporanPergerakanStok";
import LaporanProduksi from "../pages/admin/LaporanProduksi";
import PenerimaanBarang from "../pages/gudang/PenerimaanBarang";

// Gudang
import GudangLayout from "../pages/gudang/GudangLayout";
import GudangDashboard from "../pages/gudang/GudangDashboard";
import RequestsGudang from "../pages/gudang/RequestsGudang";
import ProfileGudang from "../pages/gudang/ProfileGudang";
import SettingsGudang from "../pages/gudang/SettingsGudang";
import StokGudang from "../pages/gudang/StokGudang";
import PengirimanGudang from "../pages/gudang/PengirimanGudang";

// Toko
import TokoLayout from "../pages/toko/TokoLayout";
import TokoDashboard from "../pages/toko/TokoDashboard";
import RequestToko from "../pages/toko/RequestToko";
import StokToko from "../pages/toko/StokToko";
import RiwayatToko from "../pages/toko/RiwayatToko";
import ProfileToko from "../pages/toko/ProfileToko";
import SettingsToko from "../pages/toko/SettingsToko";
import PengirimanToko from "../pages/toko/PengirimanToko";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Splash /> },
      { path: "login", element: <Login /> },

      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "profile", element: <ProfileAdmin /> },
          { path: "settings", element: <SettingsAdmin /> },
          { path: "requests", element: <RequestsAdmin /> },

          { path: "stok-gudang", element: <ManajemenStok /> },
          { path: "gudang", element: <ManajemenGudang /> },
          { path: "toko", element: <ManajemenToko /> },
          { path: "produk", element: <ManajemenProduk /> },
          { path: "order", element: <ManajemenOrder /> },
          { path: "laporan-stok", element: <LaporanStok /> },
          { path: "laporan-order", element: <LaporanOrder /> },
          { path: "laporan-pergerakan", element: <LaporanPergerakanStok /> },
          { path: "laporan-produksi", element: <LaporanProduksi /> },
        ],
      },
    ],
  },

  {
    path: "gudang",
    element: <GudangLayout />,
    children: [
      { index: true, element: <GudangDashboard /> },
      { path: "penerimaan", element: <PenerimaanBarang /> },
      { path: "requests", element: <RequestsGudang /> },
      { path: "profile", element: <ProfileGudang /> },
      { path: "settings", element: <SettingsGudang /> },
      { path: "stok", element: <StokGudang /> },

      // ✅ Gudang pengiriman (benar)
      { path: "pengiriman", element: <PengirimanGudang /> },
      { path: "pengiriman/:id", element: <PengirimanGudang /> },

      // ✅ Alias FIX (karena URL kamu sempat /gudang/pengirim/REQ-xxx)
      { path: "pengirim", element: <PengirimanGudang /> },
      { path: "pengirim/:id", element: <PengirimanGudang /> },
    ],
  },

  {
    path: "toko",
    element: <TokoLayout />,
    children: [
      { index: true, element: <TokoDashboard /> },

      { path: "request", element: <RequestToko /> },
      { path: "requests", element: <RequestToko /> },

      { path: "stok", element: <StokToko /> },
      { path: "riwayat", element: <RiwayatToko /> },
      { path: "profile", element: <ProfileToko /> },
      { path: "settings", element: <SettingsToko /> },

      { path: "pengiriman/:id", element: <PengirimanToko /> },
    ],
  },
]);
