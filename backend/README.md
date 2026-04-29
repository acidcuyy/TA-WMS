# WMS Backend

Backend sederhana untuk sistem Warehouse Management System (WMS) menggunakan Node.js dan Express.

## Fitur
- **Persistence**: Data disimpan dalam file JSON (`src/data/db.json`).
- **Authentication**: Login dengan role (Admin, Gudang, Toko).
- **Product Management**: CRUD data produk.
- **Stock Management**: Ringkasan stok dan riwayat permintaan stok.

## API Endpoints

### Auth
- `POST /api/auth/login` - Login user.

### Products
- `GET /api/products` - Ambil semua produk.
- `GET /api/products/:id` - Ambil detail produk.
- `POST /api/products` - Tambah produk baru.
- `PUT /api/products/:id` - Update data produk.
- `DELETE /api/products/:id` - Hapus produk.

### Stocks
- `GET /api/stocks/summary` - Ringkasan total stok.
- `GET /api/stocks/requests` - Ambil semua permintaan stok.
- `POST /api/stocks/requests` - Buat permintaan stok baru.
- `PUT /api/stocks/requests/:id` - Update status permintaan stok.

## Cara Menjalankan
1. Masuk ke folder `backend`.
2. Jalankan `npm install` (jika belum).
3. Jalankan `npm run dev`.
