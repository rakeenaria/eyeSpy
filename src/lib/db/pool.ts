import mysql, { type Pool } from 'mysql2/promise';

const globalForDb = globalThis as unknown as {
  eyeSpyPool?: Pool;
};

export function getDbPool(): Pool {
  if (!globalForDb.eyeSpyPool) {
    globalForDb.eyeSpyPool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'eyeSpy',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      dateStrings: true,
    });
  }
  return globalForDb.eyeSpyPool;
}
