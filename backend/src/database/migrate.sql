-- ============================================================
-- MIGRASI DATABASE: reaStock WMS
-- PostgreSQL 14 | Laragon
-- ============================================================

-- 1. USERS (untuk login semua role)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  pass VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'gudang', 'toko', 'driver')),
  path VARCHAR(50),
  name VARCHAR(100),
  last_login TIMESTAMP,
  joined_since VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. PRODUCTS (katalog barang)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20),
  rack VARCHAR(50),
  stock INTEGER DEFAULT 0,
  price BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Aman' CHECK (status IN ('Aman', 'Menipis', 'Habis')),
  active BOOLEAN DEFAULT TRUE,
  image TEXT DEFAULT '',
  sold INTEGER DEFAULT 0,
  icon VARCHAR(10) DEFAULT '📦',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. STOCK REQUESTS (request toko -> gudang)
CREATE TABLE IF NOT EXISTS stock_requests (
  id VARCHAR(30) PRIMARY KEY,
  from_role VARCHAR(20),
  from_name VARCHAR(100),
  to_role VARCHAR(20),
  to_name VARCHAR(100),
  to_branch_id VARCHAR(30),
  note TEXT DEFAULT '',
  decision VARCHAR(20) CHECK (decision IN ('Accepted', 'Declined') OR decision IS NULL),
  status VARCHAR(30) DEFAULT 'Menunggu',
  driver_name VARCHAR(100),
  proof_image TEXT,
  priority VARCHAR(20) DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3a. STOCK REQUEST ITEMS (item per request)
CREATE TABLE IF NOT EXISTS stock_request_items (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(30) REFERENCES stock_requests(id) ON DELETE CASCADE,
  sku VARCHAR(50),
  qty INTEGER DEFAULT 0
);

-- 4. SHIPMENTS (tracking pengiriman)
CREATE TABLE IF NOT EXISTS shipments (
  id VARCHAR(30) PRIMARY KEY,
  request_id VARCHAR(30) REFERENCES stock_requests(id),
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,
  end_lat DOUBLE PRECISION,
  end_lng DOUBLE PRECISION,
  driver_lat DOUBLE PRECISION,
  driver_lng DOUBLE PRECISION,
  driver_name VARCHAR(100),
  started_at BIGINT,
  duration_ms BIGINT DEFAULT 1080000,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. NOTIFICATIONS (sistem notifikasi)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(30) PRIMARY KEY,
  type VARCHAR(50),
  title VARCHAR(200),
  message TEXT,
  time VARCHAR(20),
  is_read BOOLEAN DEFAULT FALSE,
  target_roles TEXT[],
  link VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. DRIVER PROFILE
CREATE TABLE IF NOT EXISTS driver_profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(30),
  vehicle VARCHAR(100),
  role VARCHAR(50) DEFAULT 'Driver Utama',
  status VARCHAR(20) DEFAULT 'Online',
  last_login VARCHAR(50),
  joined_at VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. TOKO ORDERS (pesanan penjualan)
CREATE TABLE IF NOT EXISTS toko_orders (
  id VARCHAR(30) PRIMARY KEY,
  client VARCHAR(100),
  channel VARCHAR(50),
  date VARCHAR(50),
  items VARCHAR(50),
  total BIGINT DEFAULT 0,
  payment VARCHAR(30),
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. TOKO RECEIPTS (penerimaan barang)
CREATE TABLE IF NOT EXISTS toko_receipts (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  source VARCHAR(100),
  date VARCHAR(50),
  items VARCHAR(50),
  value BIGINT DEFAULT 0,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. TOKO DISPATCHES (pengeluaran barang)
CREATE TABLE IF NOT EXISTS toko_dispatches (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  target VARCHAR(100),
  date VARCHAR(50),
  items VARCHAR(30),
  value BIGINT DEFAULT 0,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. TOKO TRANSFERS (transfer barang)
CREATE TABLE IF NOT EXISTS toko_transfers (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  date VARCHAR(50),
  items VARCHAR(30),
  value BIGINT DEFAULT 0,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. TOKO ADJUSTMENTS (penyesuaian stok)
CREATE TABLE IF NOT EXISTS toko_adjustments (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  type VARCHAR(50),
  date VARCHAR(50),
  items VARCHAR(30),
  value VARCHAR(30),
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. TOKO RETURNS (retur penjualan)
CREATE TABLE IF NOT EXISTS toko_returns (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  client VARCHAR(100),
  date VARCHAR(50),
  items VARCHAR(30),
  value VARCHAR(30),
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. TOKO HISTORY (log aktivitas)
CREATE TABLE IF NOT EXISTS toko_history (
  id VARCHAR(30) PRIMARY KEY,
  type VARCHAR(30),
  "user" VARCHAR(100),
  description TEXT,
  date VARCHAR(50),
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 14. TOKO ACTIVITIES (aktivitas terbaru)
CREATE TABLE IF NOT EXISTS toko_activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(30),
  text TEXT,
  "user" VARCHAR(100),
  time VARCHAR(30),
  icon VARCHAR(10),
  icon_class VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 15. TOKO SALES (data penjualan untuk grafik)
CREATE TABLE IF NOT EXISTS toko_sales (
  id SERIAL PRIMARY KEY,
  date VARCHAR(30),
  total BIGINT DEFAULT 0
);

-- 16. TOKO EXPENSES (data pengeluaran harian)
CREATE TABLE IF NOT EXISTS toko_expenses (
  id SERIAL PRIMARY KEY,
  date VARCHAR(30),
  total BIGINT DEFAULT 0
);

-- 17. GUDANG RECEIPTS (penerimaan barang gudang)
CREATE TABLE IF NOT EXISTS gudang_receipts (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  source VARCHAR(100),
  date VARCHAR(50),
  items INTEGER DEFAULT 0,
  value BIGINT DEFAULT 0,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 18. GUDANG DISPATCHES (pengeluaran barang gudang)
CREATE TABLE IF NOT EXISTS gudang_dispatches (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  target VARCHAR(100),
  date VARCHAR(50),
  items INTEGER DEFAULT 0,
  value BIGINT DEFAULT 0,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 19. GUDANG TRANSFERS (transfer barang gudang)
CREATE TABLE IF NOT EXISTS gudang_transfers (
  id VARCHAR(30) PRIMARY KEY,
  ref VARCHAR(30),
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  date VARCHAR(50),
  items INTEGER DEFAULT 0,
  value BIGINT DEFAULT 0,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 20. BRANCHES (cabang/toko)
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100),
  address TEXT,
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 21. USER SETTINGS (preferensi pengguna)
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20),
  notif_stock BOOLEAN DEFAULT TRUE,
  notif_requests BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 22. GUDANG ORDERS
CREATE TABLE IF NOT EXISTS gudang_orders (
  id VARCHAR(30) PRIMARY KEY,
  client VARCHAR(100),
  channel VARCHAR(50),
  date VARCHAR(50),
  items VARCHAR(50),
  total BIGINT DEFAULT 0,
  payment VARCHAR(30),
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);
