# Rencana Integrasi Frontend-Backend (ReaStock - WMS)

Dokumen ini berisi analisis detail tentang arsitektur sistem, alur kerja (*workflows*), tabel basis data (*database tables*), dan kolom-kolom (*fields*) yang saat ini digunakan secara lokal di sisi Frontend, serta rencana implementasi lengkap untuk memindahkannya ke Backend menggunakan **Node.js, Express.js, Prisma ORM, dan PostgreSQL**.

---

## 🏛️ Analisis Arsitektur & Multi-Role Workflow

Aplikasi ini menggunakan pola arsitektur **Client-Server** dengan pembagian pengguna berbasis peran (*Role-Based Access Control / RBAC*). Alur kerja utama dibagi menjadi 4 peran sebagai berikut:

### 1. Panel Admin (Manajerial & Master Data)
*   **Registrasi & Manajemen Entitas:** Admin mendaftarkan perusahaan (*company*) dan cabang-cabang (*branches*: Toko atau Gudang).
*   **Manajemen Karyawan/User:** Pendaftaran dan pengelolaan akun untuk staf Gudang, staf Toko, dan Driver.
*   **Manajemen Produk (Master Data):** Membuat data produk utama (SKU, nama, jenis, satuan, harga, gambar) yang menjadi acuan stok global.
*   **Inisiasi Restock Gudang (Admin -> Gudang):** Admin mengajukan instruksi restok barang dari supplier ke Gudang tertentu (`adminRestockToGudang` / `ARST`).
*   **Analytics & Laporan:** Memantau dasbor analitik dan mengunduh laporan aktivitas yang diunggah oleh Toko/Gudang.

### 2. Panel Gudang (Warehouse Operations)
*   **Inbound (Penerimaan Stok):**
    *   Menerima dan memproses perintah restok dari Admin (`adminRestockToGudang`). Gudang memverifikasi jumlah barang datang (bagus vs rusak) dan mengunggah foto bukti (*check barang, resi driver, pemasukan barang*).
    *   Dapat mengajukan permohonan restok mandiri ke Admin (`restockToAdmin` / `RST`).
*   **Outbound (Pemrosesan Permintaan Toko):**
    *   Menerima, menyetujui (`Accepted`), atau menolak (`Declined`) permintaan restok dari Toko (`requests` / `REQ`).
    *   Jika disetujui, status berubah menjadi `Memproses`, lalu Gudang menyiapkannya untuk dikirim (status `Siap Dikirim`).
*   **Manajemen Stok (Stock Opname):** Menyesuaikan stok gudang fisik dengan database.

### 3. Panel Toko (Retail Operations)
*   **Pengajuan Permintaan Restock (Toko -> Gudang):** Toko memilih produk dari katalog dan mengajukan request ke Gudang Pusat dengan status awal `Menunggu`.
*   **Penerimaan Barang & Konfirmasi:** Toko memverifikasi kedatangan armada driver, mengonfirmasi jumlah barang bagus vs rusak (`qtyGood` / `qtyBad`), serta mengunggah foto bukti penerimaan. Begitu dikonfirmasi, stok toko bertambah dan stok gudang pengirim berkurang otomatis.
*   **Pencatatan Pengeluaran (Outflow):** Mencatat barang keluar toko (misal: Penjualan atau Barang Rusak) yang langsung memotong stok toko.
*   **Pelaporan:** Mengunggah laporan berkala (PDF/Excel) untuk ditinjau oleh Admin.

### 4. Panel Driver (Logistics & Tracking)
*   **Pengambilan Tugas (Accept Job):** Driver memilih pengiriman dengan status `Siap Dikirim` (status berubah ke `Pickup`).
*   **Upload Bukti Pickup:** Driver mengambil barang di Gudang, mengunggah foto barang & resi, lalu memulai perjalanan (status berubah ke `Mengirim` dan membuat data `Shipment`).
*   **Live Tracking:** Selama perjalanan, GPS pada perangkat Driver secara real-time mengirimkan koordinat ke server (`driver.lat`, `driver.lng`) yang divisualisasikan menggunakan Leaflet.js di panel Toko dan Admin.
*   **Penyelesaian Tugas:** Driver menyelesaikan tugas pengiriman setelah Toko melakukan konfirmasi penerimaan (status berubah ke `Selesai`).

---

## 🗄️ Rancangan Skema Database (Prisma ORM & PostgreSQL)

Berdasarkan implementasi database simulasi di `frontend/src/services/storageDb.js` dan model transaksi di `wmsApi.js`, berikut rancangan model database PostgreSQL menggunakan Prisma ORM.

### 1. Model Utama & Autentikasi

#### `Role` (Enum)
Pilihan peran pengguna di sistem:
*   `ADMIN`
*   `SUPER_ADMIN`
*   `TOKO`
*   `DRIVER`
*   `GUDANG`

#### `User`
Data profil pengguna dan kredensial login.
```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  name           String
  username       String   @unique
  password       String
  phone          String?
  role           Role     @default(GUDANG)
  companyId      String?  // Multi-tenancy identifier
  branchId       String?  // Mengaitkan staf dengan Cabang Toko/Gudang tertentu
  vehicle        String?  // Khusus Driver (misal: "Truck Hino B 1234 ABC")
  nomorSim       String?  // Khusus Driver
  alamatDomisili String?
  statusMitra    String?  // Khusus Driver (misal: "Kontrak", "Tetap")
  joinedAt       String?  // Tanggal bergabung format string YYYY-MM-DD
  createdAt      DateTime @default(now())

  // Relations
  branch         Branch?  @relation(fields: [branchId], references: [id], onDelete: SetNull)
}
```

#### `Branch` (Cabang Toko / Gudang)
Daftar entitas fisik (Gudang Distribusi & Toko Cabang).
```prisma
model Branch {
  id         String   @id @default(uuid())
  name       String
  type       String   // "gudang" | "toko"
  location   String?  // Alamat lengkap
  phone      String?
  picName    String?  // Penanggung jawab cabang
  status     String   @default("Active")
  lat        Float?   // Titik Koordinat Lintang (untuk rute peta)
  lng        Float?   // Titik Koordinat Bujur (untuk rute peta)
  companyId  String?  // Multi-tenancy identifier
  createdAt  DateTime @default(now())

  // Relations
  users            User[]
  warehouseStocks  WarehouseStock[]
  requestsFrom     Request[]        @relation("RequestsFromBranch")
  requestsTo       Request[]        @relation("RequestsToBranch")
  adminRestocks    AdminRestock[]
  tokoReports      TokoReport[]
  tokoOutflows     TokoOutflow[]
}
```

#### `Product` (Master Data Produk)
Daftar produk global yang dikelola oleh Admin.
```prisma
model Product {
  sku       String   @id // SKU unik sebagai primary key
  name      String
  category  String   // Jenis/kategori produk (e.g. "Makanan", "Elektronik")
  unit      String   @default("pcs")
  price     Float    @default(0)
  image     String?  // Menyimpan file path/URL gambar produk
  companyId String?
  createdAt DateTime @default(now())

  // Relations
  warehouseStocks  WarehouseStock[]
  requestItems     RequestItem[]
}
```

### 2. Manajemen Stok & Inventaris

#### `WarehouseStock` (Stok Riil Cabang)
Menyimpan jumlah stok fisik suatu barang per cabang (Toko / Gudang).
```prisma
model WarehouseStock {
  id        String   @id @default(uuid())
  sku       String
  qty       Int      @default(0)
  minQty    Int      @default(0)
  branchId  String
  addedAt   DateTime @default(now())

  // Relations
  product   Product  @relation(fields: [sku], references: [sku], onDelete: Cascade)
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)

  @@unique([sku, branchId]) // Kombinasi SKU + Cabang harus unik
}
```

### 3. Modul Permintaan & Transaksi Restok

#### `Request` (Permintaan Toko -> Gudang ATAU Gudang -> Admin)
Mencatat alur pergerakan request barang serta data serah terima logistik.
```prisma
model Request {
  id                 String        @id // ID Transaksi (REQ-XXX atau RST-XXX)
  fromRole           String        // "toko" | "gudang"
  fromName           String
  fromBranchId       String
  toRole             String        // "gudang" | "admin"
  toBranchId         String
  toName             String
  createdAt          String        // Tanggal format YYYY-MM-DD
  satuan             String        @default("pcs")
  note               String?
  decision           String?       // "Accepted" | "Declined" | null
  status             String        // "Menunggu" | "Memproses" | "Siap Dikirim" | "Pickup" | "Mengirim" | "Diterima Toko" | "Selesai" | "Declined" | "Ditolak"
  driverName         String?
  acceptedAt         String?       // ISO Timestamp (saat Driver ambil tugas)
  shippingStartedAt  String?       // ISO Timestamp (saat Driver upload bukti pickup)
  receivedAt         String?       // ISO Timestamp (saat Toko menerima paket)
  completedAt        String?       // ISO Timestamp (saat Driver menyelesaikan tugas)
  isExternalDriver   Boolean       @default(false)
  
  // Bukti Transaksi
  driverProofResi    String?       // base64 / URL foto resi pickup driver
  driverProofFoto    String?       // base64 / URL foto barang pickup driver
  receivedProofFoto  String?       // base64 / URL foto bukti penerimaan toko
  
  // Konfirmasi Penerimaan (qtyGood + qtyBad = Total Qty dikirim)
  qtyGood            Int?
  qtyBad             Int?
  confirmationNotes  String?

  // Relations
  fromBranch         Branch        @relation("RequestsFromBranch", fields: [fromBranchId], references: [id])
  toBranch           Branch        @relation("RequestsToBranch", fields: [toBranchId], references: [id])
  items              RequestItem[]
  shipment           Shipment?
}
```

#### `RequestItem`
Detail barang beserta jumlah yang diminta di dalam satu Request.
```prisma
model RequestItem {
  id        String   @id @default(uuid())
  requestId String
  sku       String
  name      String
  qty       Int
  price     Float    @default(0)

  // Relations
  request   Request  @relation(fields: [requestId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [sku], references: [sku])
}
```

#### `AdminRestock` (Admin -> Gudang Restock)
Mencatat perintah restok dari supplier ke Gudang Pusat yang diinisiasi oleh Admin.
```prisma
model AdminRestock {
  id                  String   @id // ID Transaksi (ARST-XXX)
  createdAt           String   // Tanggal format YYYY-MM-DD
  cabangGudangId      String
  cabangGudangNama    String
  kodeBarang          String
  namaBarang          String
  jenisBarang         String
  jumlah              Int
  satuan              String   @default("pcs")
  supplier            String?
  prioritas           String   @default("Normal") // "Low" | "Normal" | "High"
  catatan             String?
  status              String   @default("Pending") // "Pending" | "Diproses" | "Selesai"
  completedAt         String?  // Tanggal selesai format YYYY-MM-DD
  
  // Bukti Penerimaan Gudang
  proofCheckBarang    String?  // base64 / URL foto lembar checklist barang
  proofResiDriver     String?  // base64 / URL foto resi pengiriman supplier
  proofPemasukanBarang String? // base64 / URL foto barang masuk gudang
  
  // Konfirmasi Fisik Gudang
  qtyGood             Int?
  qtyBad              Int?
  confirmationNotes   String?

  // Relations
  branch              Branch   @relation(fields: [cabangGudangId], references: [id])
}
```

### 4. Pelacakan Logistik & GPS Driver

#### `Shipment`
Mencatat koordinat GPS dan status transit aktif untuk visualisasi maps.
```prisma
model Shipment {
  id             String   @id @default(uuid())
  requestId      String   @unique
  startAddress   String
  endAddress     String
  startLat       Float
  startLng       Float
  endLat         Float
  endLng         Float
  startedAt      BigInt   // Epoch ms timestamp (Date.now())
  durationMs     Int      // Estimasi durasi perjalanan
  driverLat      Float
  driverLng      Float
  driverIsLive   Boolean  @default(false)
  driverName     String
  driverProgress Float    @default(0)

  // Relations
  request        Request  @relation(fields: [requestId], references: [id], onDelete: Cascade)
}
```

### 5. Laporan, Pengeluaran Toko & Notifikasi

#### `TokoReport` (Laporan Toko/Gudang -> Admin)
Mencatat dokumen laporan bulanan/mingguan/harian.
```prisma
model TokoReport {
  id          String   @id // ID Laporan (RPT-XXX atau RPT-GDG-XXX)
  tokoId      String   // Cabang asal
  tokoName    String
  type        String   // "Laporan Harian" | "Laporan Mingguan" | "Laporan Bulanan"
  period      String   // Periode laporan (e.g. "Mei 2025")
  date        String   // Tanggal format YYYY-MM-DD
  format      String   // "PDF" | "Excel"
  fileData    String?  // File base64 atau URL unduh
  status      String   @default("Tersedia")
  author      String   // Pengunggah laporan
  branchType  String   @default("toko") // "toko" | "gudang"

  // Relations
  branch      Branch   @relation(fields: [tokoId], references: [id])
}
```

#### `TokoOutflow` (Pengeluaran Toko Cabang)
Mencatat pengurangan stok toko akibat penjualan atau kerusakan produk di tempat.
```prisma
model TokoOutflow {
  id        String            @id // ID Pengeluaran (OUT-XXX)
  tokoId    String
  tokoName  String
  totalQty  Int
  tujuan    String            // Tujuan (e.g. "Pelanggan", "Retur Barang Rusak")
  jenis     String            // Jenis pengeluaran (e.g. "Penjualan", "Pemusnahan")
  catatan   String?
  status    String            @default("Selesai")
  createdAt DateTime          @default(now())

  // Relations
  branch    Branch            @relation(fields: [tokoId], references: [id])
  items     TokoOutflowItem[]
}

model TokoOutflowItem {
  id        String      @id @default(uuid())
  outflowId String
  sku       String
  name      String
  qty       Int

  // Relations
  outflow   TokoOutflow @relation(fields: [outflowId], references: [id], onDelete: Cascade)
}
```

#### `Notification`
Sistem notifikasi real-time terdistribusi berdasarkan role.
```prisma
model Notification {
  id          String   @id
  type        String   // "request_toko", "shipping_ready", "received", dll.
  title       String
  message     String
  time        String   // Jam format HH:MM
  isRead      Boolean  @default(false)
  targetRoles String   // Disimpan sebagai JSON array string / dipisahkan koma, misal: "admin,gudang"
  link        String?  // Rute pengalihan di frontend (e.g. "/requests")
  companyId   String?
  createdAt   DateTime @default(now())
}
```

---

## 🛠️ Rencana Langkah Integrasi & Pengembangan

Integrasi backend akan dibagi menjadi beberapa fase terencana berikut:

### Fase 1: Setup Database & Prisma Migrations
1.  Perbarui file [schema.prisma](file:///c:/Users/Taso/Documents/KULIAH/SEMESTER%208/Proyek%20TA/TA-WMS/backend/prisma/schema.prisma) dengan seluruh model database di atas.
2.  Tambahkan variabel `DATABASE_URL` di schema datasource dan pastikan server PostgreSQL lokal berjalan di port 5432.
3.  Jalankan migrasi database menggunakan CLI:
    ```bash
    npx prisma migrate dev --name init_wms_schema
    ```
4.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```

### Fase 2: Pembangunan REST API Backend (Express.js)
Buat modul endpoint di bawah direktori `backend/src/modules/` berikut validasi skema data menggunakan **Zod** dan proteksi rute JWT:

*   **`/api/auth`**: `POST /register`, `POST /login` (menyertakan payload token, detail data user, cabang, dan `companyId`).
*   **`/api/branches`**: CRUD data Cabang Toko & Gudang (diakses oleh Admin).
*   **`/api/users`**: CRUD manajemen data karyawan gudang/toko/driver (diakses oleh Admin).
*   **`/api/products`**: CRUD master data SKU produk (diakses oleh Admin).
*   **`/api/stocks`**:
    *   `GET /`: Mengambil stok barang berdasarkan filter `branchId`.
    *   `POST /`: Stock opname / tambah stok manual.
    *   `PUT /:sku`: Mengedit jumlah stok.
*   **`/api/requests`**:
    *   `GET /`: Mengambil daftar requests.
    *   `POST /`: Membuat request baru (Toko -> Gudang atau Gudang -> Admin).
    *   `PATCH /:id/decide`: Persetujuan/penolakan dari Gudang/Admin.
    *   `PATCH /:id/dispatch`: Gudang menandai barang siap dikirim / dikirim kurir eksternal.
    *   `PATCH /:id/confirm`: Konfirmasi penerimaan oleh Toko (mengubah kuantitas stok gudang & toko secara atomik dalam database transaction).
*   **`/api/driver`**:
    *   `PATCH /accept/:requestId`: Driver mengambil tugas logistik.
    *   `PATCH /pickup/:requestId`: Driver mengunggah bukti pickup (resi + foto) dan memulai pengiriman.
    *   `PATCH /location/:requestId`: Mengupdate titik koordinat realtime driver (`lat`, `lng`).
    *   `PATCH /complete/:requestId`: Driver menyelesaikan tugas logistik setelah barang diterima toko.
*   **`/api/reports`**: Mengunggah file laporan PDF/Excel dan mengambil daftar laporan.
*   **`/api/outflows`**: Membuat pencatatan pengeluaran toko mandiri.
*   **`/api/notifications`**: Menandai notifikasi telah dibaca (`isRead: true`).

### Fase 3: Pembuatan Middleware Keamanan & Hak Akses
*   Buat file `auth.middleware.js` untuk mengekstrak token JWT di Header: `Authorization: Bearer <token>`.
*   Buat helper middleware `authorizeRoles("ADMIN", "GUDANG", "TOKO", "DRIVER")` untuk memblokir akses endpoint lintas peran.

### Fase 4: Refaktor wmsApi.js di Frontend
*   Ubah file [wmsApi.js](file:///c:/Users/Taso/Documents/KULIAH%20SEMESTER%208%20Proyek%20TA%20TA-WMS/frontend/src/services/wmsApi.js) dari membaca/menulis data ke `localStorage` (`dbUpdate`/`dbLoad`), menjadi memanggil HTTP endpoint menggunakan `fetch` atau `axios`.
*   Contoh perubahan integrasi:
    ```javascript
    // DAHULU (storageDb.js / Local)
    export function getRequests() {
      return dbLoad().requests || [];
    }

    // SEKARANG (REST API Backend)
    export async function getRequests() {
      const response = await fetch(`${API_URL}/requests`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("reastock_token")}`
        }
      });
      const resData = await response.json();
      return resData.data;
    }
    ```
*   Pastikan token JWT disimpan di `sessionStorage` (atau cookie aman) setelah login berhasil untuk disisipkan pada setiap HTTP Header request.

---

## 🚦 Rencana Verifikasi

### Pengujian Otomatis
*   Menjalankan unit test endpoint backend menggunakan **Supertest** atau manual via Postman / Insomnia Client.
*   Menjalankan Prisma studio untuk memverifikasi konsistensi perubahan stok saat transaksi diselesaikan:
    ```bash
    npx prisma studio
    ```

### Pengujian Manual & E2E
1.  **Skenario Restock Gudang (Admin -> Gudang):**
    *   Admin membuat instruksi restok.
    *   Gudang menerima instruksi tersebut, mengunggah bukti, lalu menyelesaikannya.
    *   Verifikasi apakah stok di `WarehouseStock` untuk Gudang tersebut bertambah.
2.  **Skenario Transaksi Toko (Toko -> Gudang -> Driver -> Toko):**
    *   Toko meminta barang.
    *   Gudang menyetujui dan memproses.
    *   Driver mengambil tugas, mengunggah bukti pickup.
    *   Driver memperbarui posisi (simulasiGPS) -> pastikan peta pada panel Toko bergeser.
    *   Toko menyelesaikan penerimaan -> verifikasi stok gudang berkurang dan stok toko bertambah.
3.  **Pengujian Multi-Tenant:**
    *   Pastikan data antara `companyId` yang berbeda tidak saling bocor.
