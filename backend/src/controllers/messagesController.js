import { Op } from "sequelize";
import { Message, User } from "../models/index.js";
import { getUserId } from "../utils/auth.js";
import { getIo } from "../utils/socketServer.js";

export const listMessages = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const withUserId = Number(req.query.with);

    if (!withUserId) {
      return res.status(400).json({ message: "Parametro 'with' requerido" });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { fromUserId: userId, toUserId: withUserId },
          { fromUserId: withUserId, toUserId: userId }
        ]
      },
      order: [["createdAt", "ASC"]]
    });

    return res.json({ data: messages });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { toUserId, content } = req.body;

    if (!toUserId || !content?.trim()) {
      return res.status(400).json({ message: "Destinatario y contenido son requeridos" });
    }

    const message = await Message.create({
      fromUserId: userId,
      toUserId,
      content: content.trim()
    });

    const io = getIo();
    if (io) {
      io.to(`user:${toUserId}`).emit("private-message", {
        content: message.content,
        fromUserId: userId,
        id: message.id,
        createdAt: message.createdAt
      });
    }

    return res.status(201).json({ data: message });
  } catch (error) {
    return res.status(500).json({ message: "Error al enviar mensaje" });
  }
};

export const listConversations = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id_usuario", "nombre", "apellido", "foto_perfil", "ubicacion"]
    });
    return res.json({ data: users });
  } catch (error) {
    return res.status(500).json({ message: "Error al listar usuarios" });
  }
};
