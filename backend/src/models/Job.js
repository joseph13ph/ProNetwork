import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Job = sequelize.define(
  "Job",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING(140), allowNull: false },
    empresa: { type: DataTypes.STRING(120), allowNull: false },
    modalidad: {
      type: DataTypes.ENUM("presencial", "remoto", "hibrido"),
      defaultValue: "hibrido"
    },
    ubicacion: { type: DataTypes.STRING(120), allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    habilidades: { type: DataTypes.TEXT, allowNull: true },
    reclutadorId: { type: DataTypes.BIGINT, allowNull: true }
  },
  { tableName: "empleos", timestamps: true }
);
