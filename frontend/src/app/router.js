import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import Splash from "../features/auth/Splash";
import Login from "../features/auth/Login";

// Admin
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import ProfileAdmin from "../pages/admin/profileAdmin/ProfileAdmin";
import SettingsAdmin from "../pages/admin/settingsAdmin/SettingsAdmin";
import RequestsAdmin from "../pages/admin/requestAdmin/RequestsAdmin";
import ManajemenStok from "../pages/admin/manajemenStok/ManajemenStok";
import ManajemenGudang from "../pages/admin/manajemenGudang/ManajemenGudang";
import ManajemenToko from "../pages/admin/manajemenToko/ManajemenToko";
import ManajemenProduk from "../pages/admin/manajemenProduk/ManajemenProduk";
import ManajemenOrder from "../pages/admin/manajemenOrder/ManajemenOrder";
import LaporanStok from "../pages/admin/laporanStok/LaporanStok";
import LaporanOrder from "../pages/admin/laporanOrder/LaporanOrder";
import LaporanPergerakanStok from "../pages/admin/laporanPergerakanStok/LaporanPergerakanStok";
import LaporanProduksi from "../pages/admin/laporanProduksi/LaporanProduksi";
import PenerimaanBarang from "../pages/gudang/penerimaanBarang/PenerimaanBarang";

// Gudang
import GudangLayout from "../pages/gudang/GudangLayout";
import GudangDashboard from "../pages/gudang/dashboard/GudangDashboard";
import RequestsGudang from "../pages/gudang/requestGudang/RequestsGudang";
import ProfileGudang from "../pages/gudang/ProfileGudang";
import SettingsGudang from "../pages/gudang/settingsGudang/SettingsGudang";
import StokGudang from "../pages/gudang/stokGudang/StokGudang";
import PengirimanGudang from "../pages/gudang/PengirimanGudang";
import PengeluaranBarang from "../pages/gudang/pengeluaranBarang/PengeluaranBarang";
import TransferBarang from "../pages/gudang/transferBarang/TransferBarang";
import OrdersGudang from "../pages/gudang/ordersGudang/OrdersGudang";
import LaporanGudang from "../pages/gudang/laporanGudang/LaporanGudang";

// Toko
import TokoLayout from "../pages/toko/TokoLayout";
import TokoDashboard from "../pages/toko/dashboardToko/TokoDashboard";
import RequestToko from "../pages/toko/requestToko/RequestToko";
import StokToko from "../pages/toko/stokToko/StokToko";
import RiwayatToko from "../pages/toko/riwayatToko/RiwayatToko";
import ProfileToko from "../pages/toko/ProfileToko";
import SettingsToko from "../pages/toko/SettingsToko";
import PengirimanToko from "../pages/toko/PengirimanToko";
import PenerimaanBarangToko from "../pages/toko/penerimaanBarangToko/PenerimaanBarangToko";
import PengeluaranBarangToko from "../pages/toko/pengeluaranBarangToko/PengeluaranBarangToko";
import TransferBarangToko from "../pages/toko/transferBarangToko/TransferBarangToko";
import PenyesuaianStokToko from "../pages/toko/penyesuaianStokToko/PenyesuaianStokToko";
import PesananPenjualanToko from "../pages/toko/pesananPenjualanToko/PesananPenjualanToko";
import ReturPenjualanToko from "../pages/toko/returPenjualanToko/ReturPenjualanToko";

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
      { path: "pengeluaran", element: <PengeluaranBarang /> },
      { path: "transfer", element: <TransferBarang /> },
      { path: "requests", element: <RequestsGudang /> },
      { path: "orders", element: <OrdersGudang /> },
      { path: "profile", element: <ProfileGudang /> },
      { path: "settings", element: <SettingsGudang /> },
      { path: "laporan", element: <LaporanGudang /> },
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
      { path: "pesanan", element: <PesananPenjualanToko /> },

      { path: "stok", element: <StokToko /> },
      { path: "penerimaan", element: <PenerimaanBarangToko /> },
      { path: "pengeluaran", element: <PengeluaranBarangToko /> },
      { path: "transfer", element: <TransferBarangToko /> },
      { path: "adj", element: <PenyesuaianStokToko /> },
      { path: "retur", element: <ReturPenjualanToko /> },
      { path: "riwayat", element: <RiwayatToko /> },
      { path: "profile", element: <ProfileToko /> },
      { path: "settings", element: <SettingsToko /> },

      { path: "pengiriman/:id", element: <PengirimanToko /> },
    ],
  },
]);
