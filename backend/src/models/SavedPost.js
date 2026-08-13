import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const SavedPost = sequelize.define(
  "SavedPost",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    tableName: "publicaciones_guardadas",
    timestamps: true,
    indexes: [{ unique: true, fields: ["userId", "postId"] }]
  }
);

export default SavedPost;
