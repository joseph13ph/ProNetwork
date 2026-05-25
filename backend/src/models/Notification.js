import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false }, // recipient
    actorId: { type: DataTypes.BIGINT, allowNull: true }, // who caused it
    type: { type: DataTypes.STRING, allowNull: false },
    entityId: { type: DataTypes.INTEGER, allowNull: true },
    message: { type: DataTypes.STRING, allowNull: true },
    read: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { timestamps: true, tableName: "notifications" }
);

export default Notification;
