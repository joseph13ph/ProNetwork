import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define(
  "User",
  {
    id_usuario: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    foto_perfil: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM("usuario", "reclutador", "administrador"),
      allowNull: false,
      defaultValue: "usuario"
    },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo", "bloqueado"),
      defaultValue: "activo"
    }
  },
  {
    tableName: "usuarios",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion"
  }
);
