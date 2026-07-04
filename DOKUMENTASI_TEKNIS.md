# Dokumentasi Teknis - Sistem Informasi Gudang (WMS)

Dokumen ini memuat detail teknis dari arsitektur keseluruhan aplikasi, meliputi tumpukan teknologi (Tech Stack) yang digunakan pada sisi Frontend, Backend, dan Database.

---

## 🏗️ Arsitektur Sistem Secara Keseluruhan

Sistem ini dibangun menggunakan pola arsitektur **Client-Server** dengan memisahkan secara tegas antara sisi klien (Frontend) dan antarmuka pemrograman aplikasi (Backend API). Aplikasi ini mengusung hierarki **Multi-Role** dan **Multi-Tier** yang menjembatani operasional antara Gudang Pusat dan Toko Retail.

---

## 🎨 Sisi Klien (Frontend)
Bagian antarmuka pengguna dibangun sebagai *Single Page Application* (SPA) modern yang cepat dan sangat interaktif.

**Tech Stack Frontend:**
- **Core Framework:** React.js (v18)
- **Routing & Navigasi:** React Router DOM (Mendukung proteksi rute berdasarkan Role pengguna).
- **Animasi & Transisi:** Framer Motion (Memberikan pengalaman visual/UX kelas premium dengan *micro-interactions* pada komponen UI).
- **Styling:** Vanilla CSS (Pendekatan murni tanpa framework tambahan dengan CSS Variables / Custom Properties) agar aplikasi sangat ringan, dipadukan dengan konsep antarmuka *Glassmorphism*.
- **Visualisasi Data:** Recharts / Chart.js (Untuk merender grafik analitik interaktif di halaman Dashboard Admin).
- **Pemetaan & Logistik:** Leaflet.js, React-Leaflet, dan OpenStreetMap untuk integrasi fitur peta dan Geolocation API (pengambilan koordinat GPS real-time).

---

## ⚙️ Sisi Server (Backend)
Backend dibangun menggunakan lingkungan *runtime* JavaScript di sisi server yang cepat, non-blocking, dan RESTful.

**Tech Stack Backend:**
- **Runtime Environment:** Node.js (v20+)
- **Web Framework:** Express.js (v5)
- **Object-Relational Mapping (ORM):** Prisma ORM (Sebagai jembatan komunikasi modern antara Node.js dan Database).
- **Autentikasi & Keamanan:** 
  - **JSON Web Token (JWT)** untuk autentikasi *stateless*.
  - **Bcrypt.js** untuk fungsi enkripsi (hashing) *password*.
  - **Helmet.js** untuk mengamankan HTTP headers.
- **Validasi Data:** Zod (Untuk memvalidasi skema data yang dikirim oleh klien sebelum masuk ke database).
- **Logging:** Winston & Morgan (Untuk memonitor aktivitas API dan mencetak log error secara sistematis).

---

## 🗄️ Basis Data (Database)
Database menggunakan sistem manajemen basis data relasional (RDBMS) yang sangat andal untuk mengelola transaksi logistik yang kompleks.

**Tech Stack Database:**
- **Database Engine:** PostgreSQL
- **Konektor / Driver:** Node-Postgres (`pg`)

**Struktur Inti Database (Entity Relationship):**
1. **Tabel Entitas & Pengguna (RBAC):** Tabel khusus yang memisahkan status entitas (Apakah dia Perusahaan, Gudang Cabang, Toko, atau Driver) serta kredensial login (Users).
2. **Tabel Produk (Master Data):** Menyimpan master stok, harga, dan SKU barang.
3. **Tabel Inventaris (Inventory):** Menyimpan jumlah riil stok yang berada di Gudang vs Toko.
4. **Tabel Transaksi (Orders/Requests):** Mencatat seluruh aktivitas permintaan barang (Request) dari Toko ke Gudang beserta riwayat status persetujuannya (Pending, Approved, Rejected).
5. **Tabel Logistik (Deliveries):** Memuat data Surat Jalan pengiriman, nama pengemudi (driver), serta bukti serah terima barang (Proof of Delivery / Proof of Condition).

---

## 🔒 Mekanisme Keamanan Tambahan
- **Keystroke Regex Validation:** Pada sisi frontend, form input dilindungi dengan validasi RegEx *real-time* yang langsung memblokir ketikan karakter ilegal (misalnya: mengetik huruf di form NIB/Nomor HP, atau mengetik angka di form Nama).
- **Role-Based Protection:** Setiap token JWT memiliki injeksi `role`. Backend akan menolak (*Unauthorized 403*) apabila entitas Toko mencoba mengakses Endpoint API milik Gudang, dan sebaliknya.
