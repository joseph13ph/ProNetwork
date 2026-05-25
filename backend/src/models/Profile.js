import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./User.js";

export const Profile = sequelize.define(
  "Profile",
  {
    id_perfil: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: false,
      references: {
        model: User,
        key: "id_usuario"
      }
    },
    titular: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    habilidades: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experiencia: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    educacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cv_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    tableName: "perfiles",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion"
  }
);

User.hasOne(Profile, { foreignKey: "id_usuario", as: "perfil" });
Profile.belongsTo(User, { foreignKey: "id_usuario", as: "usuario" });
