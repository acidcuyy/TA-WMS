# Rencana Integrasi Frontend-Backend (ReaStock - WMS)

Dokumen ini berisi analisis detail tentang arsitektur sistem, alur kerja (*workflows*) multi-role, tabel basis data (*database tables*), dan kolom-kolom (*fields*) yang digunakan secara lokal di sisi Frontend, serta rencana implementasi lengkap untuk memindahkannya ke Backend menggunakan **Node.js, Express.js, Prisma ORM, dan PostgreSQL**.

---

## 🏛️ Analisis Arsitektur & Multi-Role Workflow

Aplikasi ini menggunakan pola arsitektur **Client-Server** dengan pembagian pengguna berbasis peran (*Role-Based Access Control / RBAC*). Alur kerja utama dibagi menjadi 4 peran sebagai berikut:

### 1. Panel Admin (Manajerial & Master Data)
*   **Registrasi & Manajemen Entitas:** Admin mendaftarkan perusahaan (*company*) dan cabang-cabang (*branches*: Toko atau Gudang).
*   **Manajemen Karyawan/User:** Pendaftaran dan pengelolaan akun untuk staf Gudang, staf Toko, dan Driver.
*   **Manajemen Produk (Master Data):** Membuat data produk utama (SKU, nama, jenis, satuan, harga, gambar) yang menjadi acuan stok global.
*   **Aktivitas Restok Dua Arah (Admin ⇄ Gudang):**
    1.  **Permintaan Restok dari Gudang ke Admin (`RST`):** Gudang mengajukan request stok barang baru ke Admin. Admin menyetujui (`Accepted`) atau menolak (`Declined`) permohonan tersebut. Jika disetujui, Gudang memproses kedatangan barang dari supplier, mengunggah foto bukti penerimaan, dan mengonfirmasi jumlah barang bagus vs rusak (`qtyGood`/`qtyBad`). Setelah selesai, stok fisik Gudang bertambah otomatis.
    2.  **Permintaan Restok dari Admin ke Gudang (`ARST`):** Admin menginisiasi dan meminta Gudang untuk menerima stok baru dari supplier pilihan Admin. Gudang memverifikasi permohonan tersebut (`Diproses`), mencocokkan fisik barang datang dari supplier, mengunggah tiga jenis foto bukti (*checklist barang, resi driver, foto barang masuk*), dan mengonfirmasi kuantitas bagus vs rusak. Setelah selesai, stok fisik Gudang bertambah otomatis.
*   **Analytics & Laporan:** Memantau dasbor analitik dan mengunduh laporan aktivitas yang diunggah oleh Toko/Gudang.

### 2. Panel Gudang (Warehouse Operations)
*   **Inbound & Outbound Logistics:** Mengelola penerimaan stok dari supplier (restok dari Admin/Gudang) dan memproses pengiriman stok keluar menuju Toko cabang.
*   **Penerimaan Permintaan Toko (`REQ`):** Gudang meninjau, menyetujui, atau menolak permohonan stok dari Toko cabang. Jika disetujui, Gudang mengubah status ke `Memproses` dan menyiapkannya untuk diambil driver (status `Siap Dikirim`).
*   **Stock Opname:** Menyesuaikan stok gudang fisik dengan data sistem.

### 3. Panel Toko (Retail Operations)
*   **Pengajuan Permintaan Restock (Toko -> Gudang):** Toko memilih produk dari katalog dan mengajukan request ke Gudang Pusat dengan status awal `Menunggu`.
*   **Penerimaan Barang & Konfirmasi:** Toko memverifikasi kedatangan armada driver, mengonfirmasi jumlah barang bagus vs rusak (`qtyGood` / `qtyBad`), serta mengunggah foto bukti penerimaan. Begitu dikonfirmasi, stok toko bertambah dan stok gudang pengirim berkurang otomatis.
*   **Pencatatan Pengeluaran (Outflow):** Mencatat barang keluar toko (misal: Penjualan atau Barang Rusak) yang langsung memotong stok toko.
*   **Pelaporan:** Mengunggah laporan berkala (PDF/Excel) untuk ditinjau oleh Admin.

### 4. Panel Driver (Logistics & Tracking)
*   **Logistics Delivery:** Driver menerima tugas pengiriman yang siap dikirim, mengunggah bukti serah terima resi & cargo di Gudang, dan memulai rute transit (`Mengirim`).
*   **Live Tracking:** Geolocation API melacak koordinat GPS driver secara berkala (`lat`, `lng`) untuk divisualisasikan menggunakan Leaflet.js di peta Admin dan Toko.
*   **Penyelesaian Tugas:** Driver menyelesaikan tugas pengiriman setelah Toko melakukan konfirmasi penerimaan (status berubah ke `Selesai`).

---

## 🗄️ Rancangan Skema Database (Prisma ORM & PostgreSQL)

Berdasarkan analisis file `frontend/src/services/storageDb.js` dan model transaksi di `wmsApi.js`, skema database PostgreSQL akan dibagi secara spesifik untuk meminimalkan field bernilai kosong (*nullable fields*) serta memetakan 3 alur restok secara eksplisit:

### 1. Model Utama & Autentikasi

#### `Role` (Enum)
```prisma
enum Role {
  ADMIN
  SUPER_ADMIN
  TOKO
  DRIVER
  GUDANG
}
```

#### `User` (Akun Pengguna)
```prisma
model User {
  id             String   @id @default(uuid())
  email          String?  @unique
  username       String   @unique
  password       String
  name           String
  phone          String?
  role           Role     @default(GUDANG)
  companyId      String?  // Mengaitkan dengan perusahaan (multi-tenancy)
  branchId       String?  // Mengaitkan staf dengan Cabang Toko/Gudang tertentu
  title          String?  // Jabatan PIC Admin (misal: "Operational Manager")
  vehicle        String?  // Khusus Driver (misal: "Truck Hino B 1234 ABC")
  nomorSim       String?  // Khusus Driver
  alamatDomisili String?
  statusMitra    String?  // Khusus Driver (misal: "Mitra Tetap", "Kontrak")
  joinedAt       String?  // Format string YYYY-MM-DD
  createdAt      DateTime @default(now())

  // Relations
  branch         Branch?  @relation(fields: [branchId], references: [id], onDelete: SetNull)
}
```

#### `CompanyProfile` (Profil Legal Perusahaan)
```prisma
model CompanyProfile {
  id        String   @id @default(uuid())
  name      String   // Nama Perusahaan
  industry  String?  // Industri / Bidang Usaha
  nib       String?  // Nomor Induk Berusaha
  address   String?  // Alamat Kantor Pusat
  logo      String?  // base64 / URL logo
  document  String?  // base64 / URL dokumen legalitas
  createdAt DateTime @default(now())
}
```

#### `Branch` (Cabang Toko / Gudang)
```prisma
model Branch {
  id         String   @id @default(uuid())
  name       String
  type       String   // "gudang" | "toko"
  location   String?  // Alamat lengkap cabang
  phone      String?
  picName    String?  // Penanggung jawab cabang
  status     String   @default("Active")
  lat        Float?   // Titik Koordinat Lintang (rute maps)
  lng        Float?   // Titik Koordinat Bujur (rute maps)
  companyId  String?  // Multi-tenancy
  createdAt  DateTime @default(now())

  // Relations
  users                  User[]
  warehouseStocks        WarehouseStock[]
  tokoRequestsFrom       TokoRequest[]           @relation("RequestsFromBranch")
  tokoRequestsTo         TokoRequest[]           @relation("RequestsToBranch")
  restockToAdminRequests RestockToAdminRequest[]
  adminRestockRequests   AdminRestockRequest[]
  tokoReports            TokoReport[]
  tokoOutflows           TokoOutflow[]
}
```

#### `Product` (Master Data Produk Global)
```prisma
model Product {
  sku       String   @id // SKU unik dari Admin
  name      String
  category  String   // Kategori produk (e.g. "Makanan", "Elektronik")
  unit      String   @default("pcs")
  price     Float    @default(0)
  image     String?  // URL/base64 gambar
  companyId String?
  createdAt DateTime @default(now())

  // Relations
  warehouseStocks        WarehouseStock[]
  tokoRequestItems       TokoRequestItem[]
  restockToAdminItems    RestockToAdminItem[]
}
```

### 2. Manajemen Stok & Inventaris

#### `WarehouseStock` (Stok Riil per Cabang)
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

  @@unique([sku, branchId])
}
```

### 3. Modul Permintaan & Transaksi Restok (Tiga Alur Utama)

#### Alur A: `TokoRequest` & `TokoRequestItem` (Permintaan Toko -> Gudang: `REQ`)
```prisma
model TokoRequest {
  id                 String            @id // REQ-XXX
  fromBranchId       String            // Cabang Toko peminta
  fromName           String
  toBranchId         String            // Cabang Gudang penyuplai
  toName             String
  createdAt          String            // Tanggal YYYY-MM-DD
  satuan             String            @default("pcs")
  note               String?
  decision           String?           // "Accepted" | "Declined" | null
  status             String            // "Menunggu", "Memproses", "Siap Dikirim", "Pickup", "Mengirim", "Diterima Toko", "Selesai", "Declined"
  driverName         String?
  acceptedAt         String?           // ISO Timestamp driver ambil tugas
  shippingStartedAt  String?           // ISO Timestamp driver mulai jalan
  receivedAt         String?           // ISO Timestamp toko menerima
  completedAt        String?           // ISO Timestamp driver selesai tugas
  isExternalDriver   Boolean           @default(false)
  
  // Bukti Transaksi
  driverProofResi    String?           // base64 / URL resi
  driverProofFoto    String?           // base64 / URL foto barang
  receivedProofFoto  String?           // base64 / URL bukti penerimaan toko
  
  // Konfirmasi Penerimaan Fisik
  qtyGood            Int?
  qtyBad             Int?
  confirmationNotes  String?

  // Relations
  fromBranch         Branch            @relation("RequestsFromBranch", fields: [fromBranchId], references: [id])
  toBranch           Branch            @relation("RequestsToBranch", fields: [toBranchId], references: [id])
  items              TokoRequestItem[]
  shipment           Shipment?
}

model TokoRequestItem {
  id        String      @id @default(uuid())
  requestId String
  sku       String
  name      String
  qty       Int
  price     Float       @default(0)

  // Relations
  request   TokoRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  product   Product     @relation(fields: [sku], references: [sku])
}
```

#### Alur B: `RestockToAdminRequest` & `RestockToAdminItem` (Permintaan Gudang -> Admin: `RST`)
```prisma
model RestockToAdminRequest {
  id                 String               @id // RST-XXX
  fromBranchId       String               // Gudang peminta
  fromName           String
  toRole             String               @default("admin")
  toName             String               @default("Admin")
  createdAt          String               // Tanggal YYYY-MM-DD
  satuan             String               @default("pcs")
  note               String?
  supplier           String?
  decision           String?              // "Accepted" | "Declined" | null
  status             String               @default("Menunggu") // "Menunggu" | "Diproses" | "Selesai" | "Ditolak"
  proofImage         String?              // base64 / URL bukti restok diunggah Gudang saat selesai
  qtyGood            Int?
  qtyBad             Int?
  confirmationNotes  String?

  // Relations
  branch             Branch               @relation(fields: [fromBranchId], references: [id])
  items              RestockToAdminItem[]
}

model RestockToAdminItem {
  id        String                @id @default(uuid())
  requestId String
  sku       String
  name      String
  qty       Int

  // Relations
  request   RestockToAdminRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  product   Product               @relation(fields: [sku], references: [sku])
}
```

#### Alur C: `AdminRestockRequest` (Instruksi Restok Admin -> Gudang: `ARST`)
*Catatan: Model ini menyimpan data produk secara langsung (single-item) sesuai struktur mock frontend.*
```prisma
model AdminRestockRequest {
  id                  String   @id // ARST-XXX
  createdAt           String   // Tanggal YYYY-MM-DD
  cabangGudangId      String   // Gudang penerima
  cabangGudangNama    String
  kodeBarang          String   // SKU produk
  namaBarang          String
  jenisBarang         String
  jumlah              Int
  satuan              String   @default("pcs")
  supplier            String?
  prioritas           String   @default("Normal") // "Low" | "Normal" | "High"
  catatan             String?
  status              String   @default("Pending") // "Pending" | "Diproses" | "Selesai"
  completedAt         String?  // Tanggal selesai YYYY-MM-DD
  
  // Bukti Fisik Inbound di Gudang
  proofCheckBarang    String?  // base64 / URL lembar checklist barang
  proofResiDriver     String?  // base64 / URL resi logistik supplier
  proofPemasukanBarang String? // base64 / URL barang masuk gudang
  
  // Verifikasi Kuantitas Gudang
  qtyGood             Int?
  qtyBad              Int?
  confirmationNotes   String?

  // Relations
  branch              Branch   @relation(fields: [cabangGudangId], references: [id])
}
```

### 4. Pelacakan Logistik & GPS Driver

#### `Shipment` (Pelacakan Aktif Driver)
```prisma
model Shipment {
  id             String      @id @default(uuid())
  requestId      String      @unique // Terkait dengan TokoRequest.id
  startAddress   String
  endAddress     String
  startLat       Float
  startLng       Float
  endLat         Float
  endLng         Float
  startedAt      BigInt      // Epoch ms timestamp (Date.now())
  durationMs     Int         // Estimasi durasi transit
  driverLat      Float
  driverLng      Float
  driverIsLive   Boolean     @default(false)
  driverName     String
  driverProgress Float       @default(0)

  // Relations
  request        TokoRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
}
```

### 5. Laporan, Pengeluaran Toko, & Notifikasi

#### `TokoReport` (Laporan Keuangan & Stok Cabang)
```prisma
model TokoReport {
  id          String   @id // RPT-XXX atau RPT-GDG-XXX
  tokoId      String   // Cabang pengunggah
  tokoName    String
  type        String   // "Laporan Harian" | "Laporan Mingguan" | "Laporan Bulanan"
  period      String   // Periode laporan (e.g. "Mei 2025")
  date        String   // Tanggal YYYY-MM-DD
  format      String   // "PDF" | "Excel"
  fileData    String?  // base64 / URL file
  status      String   @default("Tersedia")
  author      String   // Pengunggah
  branchType  String   @default("toko") // "toko" | "gudang"

  // Relations
  branch      Branch   @relation(fields: [tokoId], references: [id])
}
```

#### `TokoOutflow` & `TokoOutflowItem` (Pencatatan Stok Keluar Toko)
```prisma
model TokoOutflow {
  id        String            @id // OUT-XXX
  tokoId    String
  tokoName  String
  totalQty  Int
  tujuan    String            // e.g. "Pelanggan", "Retur"
  jenis     String            // e.g. "Penjualan", "Pemusnahan"
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

#### `Notification` (Notifikasi Lintas Role)
```prisma
model Notification {
  id          String   @id // NTF-XXX
  type        String   // Tipe event notif
  title       String
  message     String
  time        String   // Format HH:MM
  isRead      Boolean  @default(false)
  targetRoles String   // Di-serialize sebagai comma-separated string, e.g. "admin,gudang"
  link        String?  // Rute redirect di frontend
  companyId   String?
  createdAt   DateTime @default(now())
}
```

---

## 🛠️ Rencana Langkah Integrasi & Pengembangan

Integrasi backend akan dibagi menjadi beberapa fase terencana berikut:

### Fase 1: Setup Database & Prisma Migrations
1.  Perbarui file [schema.prisma](file:///c:/Users/Taso/Documents/KULIAH/SEMESTER%208/Proyek%20TA/TA-WMS/backend/prisma/schema.prisma) dengan seluruh model database di atas.
2.  Hubungkan variabel `DATABASE_URL` di schema datasource dan jalankan server PostgreSQL lokal.
    > [!IMPORTANT]
    > **Kredensial Database PostgreSQL Lokal (Khusus Proyek WMS):**
    > - **Host:** `localhost`
    > - **Port:** `5432`
    > - **Username:** `postgres`
    > - **Password:** `root`
    > - **Database:** `warehouse`
    > - **Format URL Koneksi (.env):** `postgresql://postgres:root@localhost:5432/warehouse`
3.  Jalankan perintah migrasi CLI:
    ```bash
    npx prisma migrate dev --name init_wms_schema
    ```
4.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```

### Fase 2: Pembangunan REST API Backend (Express.js)
Buat modul API di bawah `backend/src/modules/` berikut validasi Zod dan proteksi otorisasi JWT untuk peran tertentu:
*   **`/api/auth`**: `POST /register`, `POST /login` (mengembalikan token JWT beserta `companyId` dan hak akses detail).
*   **`/api/branches`**: CRUD data cabang gudang & toko (diakses Admin).
*   **`/api/users`**: CRUD data staf cabang & driver (diakses Admin).
*   **`/api/products`**: CRUD master SKU produk (diakses Admin).
*   **`/api/stocks`**:
    *   `GET /`: Mengambil stok berdasarkan `branchId`.
    *   `POST /`: Membuat entri stok baru (Stock Opname).
    *   `PUT /:sku`: Memperbarui kuantitas stok cabang secara langsung.
*   **`/api/requests`** (Toko ⇄ Gudang):
    *   `POST /`: Membuat request baru dari Toko (`Menunggu`).
    *   `PATCH /:id/decide`: Gudang menyetujui (`Memproses`) atau menolak request Toko.
    *   `PATCH /:id/dispatch`: Gudang menandai barang siap dikirim (`Siap Dikirim`) atau dikirim via kurir eksternal.
    *   `PATCH /:id/confirm`: Toko memverifikasi fisik barang dan menyelesaikan transaksi. *Penting: Perubahan stok gudang dan toko dilakukan secara atomik menggunakan Prisma Transaction (`$transaction`).*
*   **`/api/restock-admin`** (Gudang ⇄ Admin):
    *   `POST /`: Gudang mengajukan restok ke Admin (`RST`).
    *   `PATCH /:id/decide`: Admin menyetujui (`Diproses`) atau menolak request.
    *   `PATCH /:id/complete`: Gudang mengunggah bukti dan menyelesaikan transaksi (stok gudang bertambah otomatis).
*   **`/api/admin-restock`** (Admin ⇄ Gudang):
    *   `POST /`: Admin menginstruksikan restok ke Gudang (`ARST`).
    *   `PATCH /:id/accept`: Gudang menerima dan memproses request (`Diproses`).
    *   `PATCH /:id/complete`: Gudang mengunggah tiga foto bukti penerimaan dan menyelesaikan transaksi (stok gudang bertambah otomatis).
*   **`/api/driver`**:
    *   `PATCH /accept/:requestId`: Driver menyetujui tugas pengiriman (`Pickup`).
    *   `PATCH /pickup/:requestId`: Driver mengunggah bukti pickup dan mengubah status ke `Mengirim` serta menginisiasi rute tracking.
    *   `PATCH /location/:requestId`: Mengupdate koordinat GPS real-time driver (`lat`, `lng`).
    *   `PATCH /complete/:requestId`: Menyelesaikan pengiriman logistik.
*   **`/api/reports`**: Mengelola file PDF/Excel laporan Toko & Gudang.
*   **`/api/outflows`**: Mencatat pengeluaran stok internal toko (`OUT`).
*   **`/api/notifications`**: Menandai notifikasi telah dibaca (`isRead: true`).

### Fase 3: Refaktor Service API di Frontend (`wmsApi.js`)
*   Ganti semua database operasi lokal di [wmsApi.js](file:///c:/Users/Taso/Documents/KULIAH%20SEMESTER%208%20Proyek%20TA%20TA-WMS/frontend/src/services/wmsApi.js) dengan HTTP request `fetch` atau `axios` menuju endpoint Backend API yang baru.
*   Sisipkan token JWT dari `sessionStorage.getItem("reastock_token")` di header otorisasi untuk seluruh API calls.

---

## 🚦 Rencana Verifikasi

### Pengujian Database
*   Verifikasi pembuatan skema tabel di PostgreSQL menggunakan CLI `npx prisma studio`.

### Pengujian End-to-End Transaksi Restok Gudang & Admin
1.  **Gudang -> Admin (`RST`):** Buat request restok di panel Gudang, buka panel Admin untuk menyetujuinya, lalu selesaikan di panel Gudang dengan upload gambar. Pastikan stok gudang bertambah.
2.  **Admin -> Gudang (`ARST`):** Buat request restok di panel Admin, terima dan selesaikan di panel Gudang dengan mengunggah 3 foto bukti. Pastikan stok gudang bertambah.
