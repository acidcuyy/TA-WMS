import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    await pool.query(`UPDATE "TokoRequest" SET "driverName" = 'Taso' WHERE "driverName" = 'Driver'`);
    console.log("Updated bad requests.");
    process.exit(0);
}
main();
