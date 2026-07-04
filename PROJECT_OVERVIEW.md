# ReaStock - Integrated Warehouse Management System (WMS)

## 📌 Apa itu ReaStock?
ReaStock adalah sebuah platform Sistem Informasi Gudang terpadu yang dirancang untuk mengatasi masalah *blind spot* pada rantai pasok (Supply Chain) di tingkat operasional. Aplikasi ini menghubungkan proses dari tingkat manajerial hingga eksekusi pengiriman di lapangan, memastikan transparansi penuh atas pergerakan barang.

Aplikasi ini dirancang dengan pendekatan *Multi-Tenant* (mendukung banyak entitas/perusahaan yang berbeda secara terisolasi) dan *Multi-Role* (mendukung banyak hak akses pengguna dengan fungsi yang berbeda-beda).

---

## 🏛️ Arsitektur Multi-Role
Sistem ini membagi penggunanya menjadi empat (*4*) pilar utama yang memiliki tanggung jawab spesifik:

### 1. Panel Admin (Manajerial & Master Data)
Admin bertindak sebagai otak dari seluruh operasional perusahaan.
- **Dashboard Analytics:** Memberikan visualisasi grafis secara *real-time* mengenai metrik stok, aktivitas pengiriman, dan permintaan barang.
- **Manajemen Entitas & User:** Pendaftaran akun baru, pemblokiran akses, dan manajemen data karyawan untuk Toko, Gudang, dan Driver.
- **Manajemen Produk (Master Data):** Sentralisasi pembuatan SKU produk, kategori, dan penetapan harga yang akan mengalir otomatis ke sistem Gudang dan Toko.

### 2. Panel Gudang (Warehouse Operations)
Gudang bertindak sebagai distributor utama yang menyimpan fisik barang.
- **Penerimaan Barang (Inbound):** Proses verifikasi barang masuk, termasuk dokumentasi (unggah foto) jika ada barang yang diterima dalam kondisi cacat.
- **Pemrosesan Request (Outbound):** Menyetujui atau menolak pengajuan stok yang diminta oleh Toko cabang. 
- **Penyesuaian Stok (Stock Opname):** Menyamakan stok fisik di lapangan dengan data pada sistem.
- **Pembuatan Surat Jalan:** Menugaskan kurir/driver tertentu untuk mengantarkan barang yang telah disetujui ke toko.

### 3. Panel Toko (Retail Operations)
Toko bertindak sebagai titik akhir (*end-point*) dari proses distribusi.
- **Pengajuan Restock:** Meminta suplai barang ke Gudang dengan antarmuka keranjang belanja yang intuitif.
- **Penerimaan Pengiriman:** Memverifikasi paket yang dikirim oleh Driver. Toko wajib melapor melalui sistem jika ada barang yang kurang atau rusak selama di perjalanan.
- **Monitoring Permintaan:** Memantau status pengajuan mereka (Menunggu Persetujuan, Sedang Dikirim, Selesai).

### 4. Panel Driver (Logistics & Tracking)
Driver bertanggung jawab atas keamanan barang selama masa transit.
- **Routing & Maps:** Mendapatkan arahan navigasi visual (peta) untuk menuju lokasi Toko tujuan.
- **Live Tracking System:** Memperbarui titik lokasi secara langsung menggunakan GPS (Geolocation API) agar Admin dan Toko bisa melacak posisi armada.
- **Proof of Delivery:** Mengunggah bukti serah terima (foto) setelah pesanan sampai di tangan Toko.

---

## 🚀 Fitur Unggulan (Technical Highlights)

1. **Simulasi Database Skala Penuh (Local DB Engine)**
   Sistem ini dirancang sangat cerdas dengan membangun mekanisme Database Relasional buatan di memori browser (*LocalStorage*). Aplikasi dapat menciptakan *tenant* perusahaan yang berbeda dengan data yang 100% terisolasi tanpa memerlukan server backend sungguhan.
2. **Animasi & Interaksi Premium (Micro-Animations)**
   Hampir setiap komponen (Tombol, Transisi Halaman, Kartu Data) dipersenjatai dengan animasi berbasis *Framer Motion* yang memberikan kesan dinamis, mulus, dan *high-end*.
3. **Peta & Pelacakan Berbasis Koordinat**
   Penggabungan *Leaflet.js* dan *OpenStreetMap (OSM)* memungkinkan aplikasi memvisualisasikan rute armada driver dan memantau koordinat logistik dalam satu layar.
4. **Proteksi & Validasi Tingkat Tinggi**
   Semua form penginputan dijaga ketat dengan *Regular Expression (RegEx)* pada level *keystroke*. Pengguna dihalangi secara fisik oleh sistem jika mencoba menginput karakter yang tidak semestinya (misal memasukkan huruf pada kolom nomor HP).
5. **Responsif Sepenuhnya (Mobile-Ready)**
   Setiap inci dari aplikasi ini dirancang dapat beradaptasi pada layar HP, tablet, maupun PC *desktop*, tanpa kendala elemen yang terpotong.

---

## 🛠️ Stack Teknologi (Tech Stack)

Aplikasi ini dibangun khusus di sisi *Frontend* (Client-Side) menggunakan ekosistem *Modern JavaScript*:

- **Framework/Library Utama:** React.js (v18+)
- **Routing:** React Router DOM (v6+)
- **UI & Animations:** Framer Motion, Vanilla CSS Variables
- **Icons & Graphics:** Lucide React, Phosphor Icons
- **Mapping & Geo-Services:** Leaflet.js, React-Leaflet, OpenStreetMap, HTML5 Geolocation API
- **Data Visualization:** Chart.js / Recharts
