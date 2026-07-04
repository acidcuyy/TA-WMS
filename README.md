# ReaStock - Warehouse Management System (WMS)

**Judul Skripsi:** Rancang Bangun Aplikasi Sistem Informasi Gudang Berbasis Web dengan Pendekatan Inventory Control dan Pemantauan Analitik Terpusat
**Terjemahan Bahasa Inggris:** *Design and Development of a Web-Based Warehouse Information System Using an Inventory Control Approach and Centralized Analytical Monitoring*

---

## 📌 Deskripsi Proyek
ReaStock adalah sebuah aplikasi Sistem Informasi Gudang (Warehouse Management System / WMS) berbasis web modern yang dirancang untuk mengatasi permasalahan *blank spot* dalam rantai pasok (Supply Chain). Aplikasi ini berfokus pada manajemen stok terpusat yang menghubungkan berbagai *node* logistik (Admin, Gudang, Toko, dan Driver) dalam satu ekosistem yang saling terintegrasi secara *real-time*.

Dengan menggunakan pendekatan **Inventory Control**, sistem ini tidak hanya mencatat masuk-keluarnya barang, melainkan mengunci integritas stok melalui mekanisme persetujuan (Approval) berlapis, pemantauan pengiriman (*Tracking*), serta pelaporan komprehensif (*Analytics Dashboard*) untuk mencegah terjadinya *loss* atau *fraud* pada operasional gudang distribusi.

---

## 🚀 Fitur Utama (Core Features)
Aplikasi ini memiliki arsitektur *Multi-Role* yang disesuaikan dengan kebutuhan proses bisnis nyata di lapangan:

### 1. Dashboard Manajerial (Super Admin)
- **Pemantauan Analitik Terpusat**: Visualisasi data statistik stok gudang, performa toko, dan aktivitas driver secara *real-time*.
- **Manajemen Entitas**: Mengatur pendaftaran, pemindahan, dan pemblokiran akses (Role-Based Access Control) bagi Toko, Gudang, dan Driver.
- **Master Data Produk**: Sentralisasi SKU (Stock Keeping Unit), harga, dan kategori barang yang terhubung langsung ke seluruh gudang cabang.

### 2. Modul Gudang Utama (Warehouse Control)
- **Manajemen Permintaan (Request Management)**: Sistem *approval* otomatis dan manual terhadap permintaan suplai dari toko.
- **Penerimaan Barang & Quality Control**: Pencatatan masuknya barang ke dalam gudang beserta fitur unggah bukti (*Proof of Condition*) apabila terjadi kerusakan (*Bad Stock/Return*).
- **Penyesuaian Stok (Stock Opname)**: Perekaman historis penyesuaian (*Adjustment*) untuk menjaga tingkat keakuratan antara catatan sistem dan fisik di lapangan.

### 3. Modul Cabang Toko (Retail Control)
- **Pengajuan Restock Terpandu**: Antarmuka responsif bagi pengelola toko untuk meminta suplai barang dari Gudang Pusat.
- **Penerimaan Terverifikasi**: Validasi kondisi barang secara spesifik ketika barang tiba di toko dari driver pengirim.

### 4. Pelacakan Distribusi (Driver/Logistics)
- **Sistem Tracking Pengiriman**: Pencatatan status *real-time* posisi dan status paket (On Delivery, Arrived, Returned).
- **Pengunggahan Bukti (Proof of Delivery)**: Kewajiban driver untuk mengirimkan konfirmasi visual agar setiap barang yang berpindah tangan dapat dilacak pertanggungjawabannya.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

### Frontend (Client-Side)
- **React.js**: Library JavaScript utama untuk membangun antarmuka responsif (Single Page Application).
- **React Router DOM**: Untuk navigasi multi-role yang dinamis antar halaman (Admin, Gudang, Toko, Driver).
- **Framer Motion**: Integrasi *micro-animations* tingkat lanjut yang membuat pengalaman pengguna (UX) menjadi premium dan modern.
- **Lucide React & Phosphor Icons**: Sistem ikonografik vektor untuk UI.
- **Recharts / Chart.js**: Visualisasi data numerik ke dalam bentuk grafik interaktif (Dashboard Analytics).

### Maps & Tracking Technology (Logistics)
- **Leaflet.js & React-Leaflet**: Library peta interaktif *open-source* yang ringan.
- **OpenStreetMap (OSM)**: Penyedia data spasial dan basemap gratis yang menggantikan Google Maps.
- **Leaflet Routing Machine**: Algoritma kalkulasi jarak dan rute pengiriman barang (Routing) antar *node* pergudangan.
- **HTML5 Geolocation API**: Pengambilan titik koordinat koordinat presisi (GPS) secara langsung dari perangkat pengguna (Driver).

### Styling & UI Design
- **Vanilla CSS (Custom CSS Variables)**: Penggunaan *CSS murni* dengan desain Glassmorphism, efek bayangan dinamis (Dynamic Shadows), dan dukungan *Responsive Web Design* penuh untuk perangkat mobile (Mobile-First Approach). Tidak menggunakan *framework* tambahan sehingga aplikasi sangat ringan.

### Backend & Database (Konseptual / LocalStorage-based DB)
- **Simulated Relational NoSQL (ReaStock DB Engine)**: Untuk tujuan *prototyping* yang mulus tanpa server (Serverless Prototype), aplikasi ini menggunakan struktur relasional di *client-side storage* yang menyimulasikan fungsi *API Endpoints* sungguhan. Terdapat pemisahan entitas tabel terstruktur: Users, Products, Transactions, dan Deliveries.

---

## ⚙️ Cara Instalasi & Menjalankan (Installation & Setup)

Pastikan Anda sudah menginstal **Node.js** (Minimal v16+) dan **npm** (Node Package Manager).

1. Buka terminal atau *Command Prompt*.
2. Lakukan navigasi (pindah direktori) ke dalam folder `frontend`:
   ```bash
   cd frontend
   ```
3. Install semua *dependencies* (paket library) yang dibutuhkan:
   ```bash
   npm install
   ```
4. Jalankan aplikasi di lingkungan pengembangan (*development server*):
   ```bash
   npm start
   ```
5. Buka Browser (disarankan Google Chrome atau Mozilla Firefox) dan akses alamat:
   ```text
   http://localhost:3000
   ```

---

## 🔐 Petunjuk Login (Demo Accounts)
Untuk mencoba fitur-fitur, silakan pilih salah satu menu pendaftaran (Register) melalui halaman utama untuk membuat perusahaan mandiri, atau gunakan skenario data yang telah dibuat.

---
*Dibuat khusus untuk keperluan Tugas Akhir / Skripsi.*
*Dikembangkan oleh Hananta & Rekan.*
