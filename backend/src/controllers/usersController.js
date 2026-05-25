import { User } from "../models/index.js";

export const listUsers = async (_req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id_usuario", "nombre", "apellido", "email", "rol", "estado", "ubicacion", "foto_perfil"]
    });
    return res.status(200).json({ data: users });
  } catch (error) {
    return next(error);
  }
};
