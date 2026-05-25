import mysql from "mysql2/promise";
import { env } from "./env.js";

export const initDatabase = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      password: env.dbPassword,
      multipleStatements: false
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } catch (error) {
    if (error?.code === "ER_ACCESS_DENIED_ERROR") {
      const friendlyError = new Error(
        "No se pudo conectar a MySQL. Configura DB_USER y DB_PASSWORD en backend/.env con un usuario valido"
      );
      friendlyError.status = 500;
      throw friendlyError;
    }

    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};