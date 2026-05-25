import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve .env relative to this script file (backend/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'proconnect_db'
};

async function run() {
  const conn = await mysql.createConnection({ ...config });
  try {
    console.log('Connected to DB', config.database);

    // inspect usuarios.id_usuario
    const [rows] = await conn.execute(
      `SELECT COLUMN_TYPE, COLUMN_KEY, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'id_usuario'`,
      [config.database]
    );

    const col = rows[0];
    console.log('usuarios.id_usuario column info:', col);

    const isUnsigned = col && col.COLUMN_TYPE && col.COLUMN_TYPE.toLowerCase().includes('unsigned');
    const userType = isUnsigned ? 'BIGINT UNSIGNED' : 'BIGINT';

    console.log('Using userId type:', userType);

    const createLikes = `
CREATE TABLE IF NOT EXISTS \`likes\` (
  \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
  \`userId\` ${userType} NOT NULL,
  \`postId\` INT NOT NULL,
  \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (\`userId\`),
  INDEX (\`postId\`),
  CONSTRAINT \`fk_likes_user\` FOREIGN KEY (\`userId\`) REFERENCES \`usuarios\` (\`id_usuario\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_likes_post\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
`;

    const createNotifications = `
CREATE TABLE IF NOT EXISTS \`notifications\` (
  \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
  \`userId\` ${userType} NOT NULL,
  \`actorId\` ${userType} NULL,
  \`type\` VARCHAR(100) NOT NULL,
  \`entityId\` INT NULL,
  \`message\` VARCHAR(255) NULL,
  \`read\` TINYINT(1) DEFAULT 0,
  \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (\`userId\`),
  CONSTRAINT \`fk_notifications_user\` FOREIGN KEY (\`userId\`) REFERENCES \`usuarios\` (\`id_usuario\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
`;

    console.log('Creating likes table...');
    await conn.execute(createLikes);
    console.log('likes table created or already exists');

    console.log('Creating notifications table...');
    await conn.execute(createNotifications);
    console.log('notifications table created or already exists');

    console.log('Done.');
  } catch (err) {
    console.error('Error creating tables', err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

run();
