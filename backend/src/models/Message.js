import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Message = sequelize.define(
  "Message",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fromUserId: { type: DataTypes.BIGINT, allowNull: false },
    toUserId: { type: DataTypes.BIGINT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    leido: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: "mensajes_directos", timestamps: true }
);
