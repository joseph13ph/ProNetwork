import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function run() {
  const conn = await mysql.createConnection(config);
  try {
    const [rows] = await conn.execute('SELECT id_usuario, email, password_hash FROM usuarios WHERE email = ?', ['ana@proconnect.dev']);
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}

run();
