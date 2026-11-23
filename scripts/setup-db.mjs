import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

async function ensureColumns(conn, database) {
  const checks = [
    {
      table: 'laporan_kejahatan',
      column: 'sumber_referensi',
      ddl: 'ALTER TABLE `laporan_kejahatan` ADD COLUMN `sumber_referensi` VARCHAR(255) DEFAULT NULL AFTER `pelapor`',
    },
    {
      table: 'laporan_kejahatan',
      column: 'cctv_camera_id',
      ddl: 'ALTER TABLE `laporan_kejahatan` ADD COLUMN `cctv_camera_id` VARCHAR(64) DEFAULT NULL AFTER `sumber_referensi`',
    },
  ];

  for (const item of checks) {
    const [rows] = await conn.query(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [database, item.table, item.column]
    );
    if (Number(rows[0]?.cnt ?? 0) === 0) {
      await conn.query(item.ddl);
      console.log(`+ Added column ${item.table}.${item.column}`);
    }
  }
}

async function main() {
  loadEnv();

  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'eyeSpy';

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  try {
    const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'database/schema.sql'), 'utf8');
    await conn.query(schemaSql);
    console.log('✓ Applied database/schema.sql');

    await conn.query(`USE \`${database}\``);
    await ensureColumns(conn, database);

    const seedSql = fs.readFileSync(
      path.resolve(process.cwd(), 'database/seed-real-diy-2024-2026.sql'),
      'utf8'
    );
    await conn.query(seedSql);
    console.log('✓ Applied database/seed-real-diy-2024-2026.sql');

    const [[counts]] = await conn.query(`
      SELECT
        (SELECT COUNT(*) FROM tempat) AS tempat_count,
        (SELECT COUNT(*) FROM jenis_kejahatan) AS jenis_count,
        (SELECT COUNT(*) FROM laporan_kejahatan) AS laporan_count,
        (SELECT COUNT(*) FROM statistik_polda_diy) AS stat_polda_count,
        (SELECT COUNT(*) FROM statistik_wilayah) AS stat_wilayah_count,
        (SELECT COUNT(*) FROM cctv_camera) AS cctv_count
    `);
    console.log('✓ Verification counts:', counts);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
