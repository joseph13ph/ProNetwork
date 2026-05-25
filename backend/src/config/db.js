import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { env } from "./env.js";

const buildSqliteStoragePath = () => {
  if (env.dbStorage) {
    return env.dbStorage;
  }

  return path.resolve(process.cwd(), "backend", "data", "proconnect.sqlite");
};

const sqliteStorage = buildSqliteStoragePath();

if (env.dbDialect === "sqlite") {
  fs.mkdirSync(path.dirname(sqliteStorage), { recursive: true });
}

export const sequelize =
  env.dbDialect === "sqlite"
    ? new Sequelize({
        dialect: "sqlite",
        storage: sqliteStorage,
        logging: false
      })
    : new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
        host: env.dbHost,
        port: env.dbPort,
        dialect: "mysql",
        logging: false
      });
