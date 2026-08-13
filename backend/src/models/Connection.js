import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Connection = sequelize.define(
  "Connection",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fromUserId: { type: DataTypes.BIGINT, allowNull: false },
    toUserId: { type: DataTypes.BIGINT, allowNull: false },
    pairKey: { type: DataTypes.STRING(64), allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending"
    }
  },
  { tableName: "conexiones", timestamps: true }
);

export default Connection;
