import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jobId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.BIGINT, allowNull: false },
    estado: {
      type: DataTypes.ENUM("enviada", "en_revision", "rechazada", "aceptada"),
      defaultValue: "enviada"
    }
  },
  { tableName: "aplicaciones", timestamps: true }
);
