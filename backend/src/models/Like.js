import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Like = sequelize.define(
  "Like",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false }
  },
  { timestamps: true, tableName: "likes" }
);

export default Like;
