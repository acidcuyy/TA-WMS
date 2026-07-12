import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const res = await pool.query('SELECT username, name, role, "companyId", "branchId" FROM "User"');
    console.table(res.rows);
    process.exit(0);
}
main();
