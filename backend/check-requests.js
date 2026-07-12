import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const res = await pool.query(`SELECT id, status, "fromBranchId", "toBranchId", "fromName", "toName", "createdAt" FROM "TokoRequest" ORDER BY "createdAt" DESC LIMIT 5`);
    console.table(res.rows);
    process.exit(0);
}
main();
