import pool from "../config/db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const sql = await fs.readFile(path.join(__dirname, "migrate.sql"), "utf-8");
  await pool.query(sql);
  console.log("✅ Migrasi tabel selesai");
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── 1. USERS ─────────────────────────────────────────────
    await client.query(`
      INSERT INTO users (email, pass, role, path, name, joined_since) VALUES
        ('admin@gmail.com',  'admin',  'admin',  '/admin',  'Super Admin',  '10 Januari 2025'),
        ('gudang@gmail.com', 'gudang', 'gudang', '/gudang', 'Admin Gudang', '10 Januari 2025'),
        ('toko@gmail.com',   'toko',   'toko',   '/toko',   'Admin Toko',   '10 Januari 2025'),
        ('driver@gmail.com', 'driver', 'driver', '/driver', 'Budi Santoso', '12 Januari 2024')
      ON CONFLICT (email) DO NOTHING
    `);

    // ── 2. PRODUCTS ──────────────────────────────────────────
    await client.query(`
      INSERT INTO products (name, sku, category, unit, rack, stock, price, status, active, sold, icon) VALUES
        ('Pipa PVC 1/2 Inch',    'PPI-001', 'Plumbing',        'Pcs', 'PLB-01', 450, 100000, 'Aman',    true, 180, '🚿'),
        ('Elbow PVC 1/2 Inch',   'ELB-001', 'Plumbing',        'Pcs', 'PLB-01', 320, 40000,  'Menipis', true, 150, '🔧'),
        ('Fitting T 1/2 Inch',   'FIT-001', 'Plumbing',        'Pcs', 'PLB-01', 120, 40000,  'Menipis', true, 120, '⚙️'),
        ('Lem PVC 100ml',        'LEM-001', 'Plumbing',        'Pcs', 'PLB-02', 85,  20000,  'Aman',    true, 100, '🧴'),
        ('Kabel NYM 3x1.5mm',   'KAB-001', 'Elektrikal',      'Mtr', 'ELK-01', 380, 50000,  'Aman',    true, 90,  '🔌'),
        ('Lampu LED 12W Putih',  'LAM-001', 'Elektrikal',      'Pcs', 'ELK-02', 250, 25000,  'Aman',    true, 45,  '💡'),
        ('Stop Kontak Arde',     'SKA-001', 'Elektrikal',      'Pcs', 'ELK-05', 80,  20000,  'Menipis', true, 120, '🔌'),
        ('Semen Portland 40kg',  'SEM-001', 'Bahan Bangunan',  'Zak', 'BAK-03', 45,  200000, 'Menipis', true, 10,  '🧱'),
        ('Cat Tembok Putih 5kg', 'CAT-001', 'Bahan Bangunan',  'Zak', 'BAK-03', 30,  80000,  'Aman',    true, 5,   '🎨'),
        ('Baut M8 x 40mm',      'BAU-001', 'Hardware',        'Pcs', 'HDW-01', 0,   1000,   'Habis',   false, 0,  '🔩')
      ON CONFLICT (sku) DO NOTHING
    `);

    // ── 3. STOCK REQUESTS ────────────────────────────────────
    await client.query(`
      INSERT INTO stock_requests (id, from_role, from_name, to_role, to_name, status, priority, driver_name) VALUES
        ('REQ-2025-0014', 'toko',  'Toko Utama',     'gudang', 'Gudang Pusat', 'Menunggu',    'Tinggi', NULL),
        ('REQ-2025-0013', 'toko',  'Toko Utama',     'gudang', 'Gudang Pusat', 'Disetujui',   'Normal', NULL),
        ('REQ-2025-0015', 'toko',  'Toko Sejahtera', 'gudang', 'Gudang Pusat', 'Siap Dikirim','Tinggi', NULL),
        ('REQ-2025-0016', 'toko',  'Toko Maju',      'gudang', 'Gudang Pusat', 'Mengirim',    'Normal', 'Budi Santoso'),
        ('REQ-2025-0017', 'toko',  'Toko Sejahtera', 'gudang', 'Gudang Pusat', 'Selesai',     'Normal', 'Budi Santoso')
      ON CONFLICT (id) DO NOTHING
    `);

    // Items untuk REQ-2025-0015
    await client.query(`
      INSERT INTO stock_request_items (request_id, sku, qty) VALUES
        ('REQ-2025-0015', 'PPI-001', 10),
        ('REQ-2025-0016', 'ELB-001', 5),
        ('REQ-2025-0017', 'KAB-001', 20)
      ON CONFLICT DO NOTHING
    `);

    // ── 4. DRIVER PROFILE ────────────────────────────────────
    const { rows: driverExists } = await client.query("SELECT id FROM driver_profile LIMIT 1");
    if (driverExists.length === 0) {
      await client.query(`
        INSERT INTO driver_profile (name, email, phone, vehicle, role, status, last_login, joined_at)
        VALUES ('Budi Santoso', 'budi@wms.com', '0812-3456-7890', 'Truk Box B 1234 GAD', 'Driver Utama', 'Online', '25 Mei 2025, 08:30', '12 Januari 2024')
      `);
    }

    // ── 5. TOKO ORDERS ───────────────────────────────────────
    await client.query(`
      INSERT INTO toko_orders (id, client, channel, date, items, total, payment, status) VALUES
        ('SO-2025-0056', 'Pelanggan Umum', 'Kasir Toko',  '24 Mei 2025, 10:15', '8 item',  1450000, 'Lunas',     'Selesai'),
        ('SO-2025-0055', 'Toko Maju',      'WhatsApp',    '24 Mei 2025, 09:40', '12 item', 980000,  'DP',        'Diproses'),
        ('SO-2025-0054', 'CV Sejahtera',   'Marketplace', '23 Mei 2025, 16:20', '15 item', 5620000, 'Belum Bayar','Dikemas'),
        ('SO-2025-0053', 'Kasir Toko',     'Kasir Toko',  '23 Mei 2025, 13:05', '6 item',  720000,  'Lunas',     'Diproses')
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 6. TOKO RECEIPTS ─────────────────────────────────────
    await client.query(`
      INSERT INTO toko_receipts (id, ref, source, date, items, value, status) VALUES
        ('IN-2025-0042', 'TR-2025-0031', 'Gudang Pusat',  '24 Mei 2025 09:15', '45 item', 12450000, 'Diterima'),
        ('IN-2025-0041', 'SO-2025-0054', 'Gudang Cabang', '23 Mei 2025 16:20', '30 item', 8250000,  'Proses')
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 7. TOKO DISPATCHES ───────────────────────────────────
    await client.query(`
      INSERT INTO toko_dispatches (id, ref, target, date, items, value, status) VALUES
        ('OUT-2025-0042', 'INV/KS/0524/042', 'Pelanggan - Toko Maju', '24 Mei 2025, 10:30', '25', 1750000, 'Dikeluarkan')
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 8. TOKO TRANSFERS ────────────────────────────────────
    await client.query(`
      INSERT INTO toko_transfers (id, ref, from_location, to_location, date, items, value, status) VALUES
        ('TRF-2025-0042', 'TF/GD/0524/042', 'Gudang Pusat',  'Toko Sejahtera', '24 Mei 2025, 10:15', '20 item', 2450000, 'Dikirim'),
        ('TRF-2025-0041', 'TF/CB/0524/041', 'Toko Cabang A', 'Toko Sejahtera', '24 Mei 2025, 08:40', '12 item', 980000,  'Selesai')
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 9. TOKO ADJUSTMENTS ──────────────────────────────────
    await client.query(`
      INSERT INTO toko_adjustments (id, ref, type, date, items, value, status) VALUES
        ('ADJ-2025-0012', 'OP/0524/012', 'Stock Opname', '24 Mei 2025, 11:30', '10 item', '-Rp 120.000', 'Selesai')
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 10. TOKO RETURNS ─────────────────────────────────────
    await client.query(`
      INSERT INTO toko_returns (id, ref, client, date, items, value, status) VALUES
        ('RET-2025-0008', 'SO-2025-0045', 'Pelanggan Umum', '24 Mei 2025, 14:15', '2 item', 'Rp 250.000', 'Diproses')
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 11. TOKO HISTORY ─────────────────────────────────────
    await client.query(`
      INSERT INTO toko_history (id, type, "user", description, date, status) VALUES
        ('LOG-2025-0156', 'Penjualan', 'Admin Toko', 'Transaksi penjualan #SO-2025-0056', '24 Mei 2025, 10:15', 'Selesai')
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 12. TOKO ACTIVITIES ──────────────────────────────────
    const { rows: actExists } = await client.query("SELECT id FROM toko_activities LIMIT 1");
    if (actExists.length === 0) {
      await client.query(`
        INSERT INTO toko_activities (type, text, "user", time, icon, icon_class) VALUES
          ('order',   'Pesanan penjualan #SO-2025-0056 telah dibuat', 'oleh Admin Toko', '10:30 WIB', '📝', 'activity-icon--purple'),
          ('payment', 'Pembayaran diterima untuk SO-2025-0055 sebesar Rp 500.000', 'oleh Kasir Toko', '09:42 WIB', '💰', 'activity-icon--green'),
          ('receive', 'Penerimaan barang dari Gudang Pusat', '#IN-2025-0042', '09:15 WIB', '📥', 'activity-icon--blue'),
          ('alert',   'Stok menipis: Pipa PVC 1/2 Inch', 'Stok tersisa 15 Pcs', 'Kemarin, 14:20', '⚠️', 'activity-icon--red')
      `);
    }

    // ── 13. TOKO SALES ───────────────────────────────────────
    const { rows: salesExists } = await client.query("SELECT id FROM toko_sales LIMIT 1");
    if (salesExists.length === 0) {
      await client.query(`
        INSERT INTO toko_sales (date, total) VALUES
          ('18 Mei', 2500000), ('20 Mei', 3800000),
          ('22 Mei', 4200000), ('24 Mei', 3450000)
      `);
      await client.query(`
        INSERT INTO toko_expenses (date, total) VALUES ('24 Mei', 1250000)
      `);
    }

    // ── 14. NOTIFICATIONS ────────────────────────────────────
    await client.query(`
      INSERT INTO notifications (id, type, title, message, time, is_read, target_roles) VALUES
        ('NTF-001', 'request_toko',  'Request Toko Baru', 'Ada permintaan barang baru dari Toko Sejahtera (REQ-2025-0015)', '10:30', false, ARRAY['admin','gudang']),
        ('NTF-002', 'shipping',      'Pesanan Dikirim',   'Pesanan REQ-2025-0016 sedang dikirim oleh Budi Santoso',          '11:15', false, ARRAY['toko','admin']),
        ('NTF-003', 'done',          'Barang Diterima',   'Permintaan REQ-2025-0017 telah selesai diterima',                 'Kemarin', true, ARRAY['gudang','admin'])
      ON CONFLICT (id) DO NOTHING
    `);

    // ── 15. USER SETTINGS ────────────────────────────────────
    const { rows: setExists } = await client.query("SELECT id FROM user_settings LIMIT 1");
    if (setExists.length === 0) {
      await client.query(`
        INSERT INTO user_settings (role, notif_stock, notif_requests) VALUES
          ('admin', true, true), ('gudang', true, true), ('toko', true, true), ('driver', true, false)
      `);
    }

    await client.query("COMMIT");
    console.log("✅ Seeder selesai — semua data awal berhasil dimasukkan");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeder gagal:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

(async () => {
  try {
    await runMigration();
    await seed();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
