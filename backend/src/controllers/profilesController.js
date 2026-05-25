import { Profile, User } from "../models/index.js";

export const upsertProfile = async (req, res, next) => {
  try {
    const id_usuario = req.user.id_usuario ?? req.user.sub;
    const [profile, created] = await Profile.findOrCreate({
      where: { id_usuario },
      defaults: { id_usuario }
    });

    await profile.update(req.body);
    return res.status(created ? 201 : 200).json({ data: profile });
  } catch (error) {
    return next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      where: { id_usuario: req.params.userId },
      include: [{ model: User, as: "usuario", attributes: ["id_usuario", "nombre", "apellido", "email", "foto_perfil", "ubicacion"] }]
    });
    return res.status(200).json({ data: profile });
  } catch (error) {
    return next(error);
  }
};
