import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "../components/common/ProtectedRoute";

import Splash from "../features/auth/Splash";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ErrorPage from "../features/error/ErrorPage";

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
import LaporanAdmin from "../pages/admin/laporanAdmin/LaporanAdmin";
import RegistrasiEntitas from "../pages/admin/registrasi/RegistrasiEntitas";
import ManajemenUser from "../pages/admin/manajemenUser/ManajemenUser";
import PenerimaanBarang from "../pages/gudang/penerimaanBarang/PenerimaanBarang";

// Gudang
import GudangLayout from "../pages/gudang/GudangLayout";
import GudangDashboard from "../pages/gudang/dashboard/GudangDashboard";
import RequestsGudang from "../pages/gudang/requestGudang/RequestsGudang";
import BuatRequestGudang from "../pages/gudang/buatRequestGudang/BuatRequestGudang";
import ProfileGudang from "../pages/gudang/ProfileGudang";
import SettingsGudang from "../pages/gudang/settingsGudang/SettingsGudang";
import StokGudang from "../pages/gudang/stokGudang/StokGudang";
import PengirimanGudang from "../pages/gudang/PengirimanGudang";
import PengeluaranBarang from "../pages/gudang/pengeluaranBarang/PengeluaranBarang";
import TransferBarang from "../pages/gudang/transferBarang/TransferBarang";
import OrdersGudang from "../pages/gudang/ordersGudang/OrdersGudang";


// Toko
import TokoLayout from "../pages/toko/TokoLayout";
import TokoDashboard from "../pages/toko/dashboardToko/TokoDashboard";
import RequestToko from "../pages/toko/requestToko/RequestToko";
import StokToko from "../pages/toko/stokToko/StokToko";

import ProfileToko from "../pages/toko/ProfileToko";
import SettingsToko from "../pages/toko/SettingsToko";
import PengirimanToko from "../pages/toko/PengirimanToko";
import PenerimaanBarangToko from "../pages/toko/penerimaanBarangToko/PenerimaanBarangToko";
import PengeluaranBarangToko from "../pages/toko/pengeluaranBarangToko/PengeluaranBarangToko";

// Driver
import DriverLayout from "../pages/driver/DriverLayout";
import DriverDashboard from "../pages/driver/dashboard/DriverDashboard";
import DriverTracking from "../pages/driver/tracking/DriverTracking";
import DriverHistory from "../pages/driver/history/DriverHistory";
import ProfileDriver from "../pages/driver/profile/ProfileDriver";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Splash /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      {
        path: "admin",
        element: <ProtectedRoute allowedRole="admin" />,
        children: [
          {
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
              { path: "laporan", element: <LaporanAdmin /> },
              { path: "registrasi", element: <RegistrasiEntitas /> },
              { path: "manajemen-user", element: <ManajemenUser /> },
              { path: "pengiriman/:id", element: <PengirimanGudang /> },
            ],
          },
        ],
      },

      {
        path: "driver",
        element: <ProtectedRoute allowedRole="driver" />,
        children: [
          {
            element: <DriverLayout />,
            children: [
              { index: true, element: <DriverDashboard /> },
              { path: "tracking", element: <DriverTracking /> },
              { path: "history", element: <DriverHistory /> },
              { path: "profile", element: <ProfileDriver /> },
            ],
          },
        ],
      },
    ],
  },

  {
    path: "gudang",
    element: <ProtectedRoute allowedRole="gudang" />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <GudangLayout />,
        children: [
          { index: true, element: <GudangDashboard /> },
          { path: "penerimaan", element: <PenerimaanBarang /> },
          { path: "pengeluaran", element: <PengeluaranBarang /> },
          { path: "transfer", element: <TransferBarang /> },
          { path: "requests", element: <RequestsGudang /> },
          { path: "buat-request", element: <BuatRequestGudang /> },
          { path: "orders", element: <OrdersGudang /> },
          { path: "profile", element: <ProfileGudang /> },
          { path: "settings", element: <SettingsGudang /> },

          { path: "stok", element: <StokGudang /> },

          // Gudang pengiriman
          { path: "pengiriman", element: <PengirimanGudang /> },
          { path: "pengiriman/:id", element: <PengirimanGudang /> },

          // Alias (backward compat)
          { path: "pengirim", element: <PengirimanGudang /> },
          { path: "pengirim/:id", element: <PengirimanGudang /> },
        ],
      },
    ],
  },

  {
    path: "toko",
    element: <ProtectedRoute allowedRole="toko" />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <TokoLayout />,
        children: [
          { index: true, element: <TokoDashboard /> },

          { path: "request", element: <RequestToko /> },

          { path: "stok", element: <StokToko /> },
          { path: "penerimaan", element: <PenerimaanBarangToko /> },
          { path: "pengeluaran", element: <PengeluaranBarangToko /> },

          { path: "profile", element: <ProfileToko /> },
          { path: "settings", element: <SettingsToko /> },

          { path: "pengiriman/:id", element: <PengirimanToko /> },
        ],
      },
    ],
  },
]);
