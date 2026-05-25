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
    const [likes] = await conn.execute("SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = 'likes'", [config.database]);
    const [notifs] = await conn.execute("SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = 'notifications'", [config.database]);
    console.log('likes exists:', likes[0].c > 0);
    console.log('notifications exists:', notifs[0].c > 0);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}

run();
