import { Notification, User } from "../models/index.js";
import { getUserId } from "../utils/auth.js";
import { getIo } from "../utils/socketServer.js";
import { createConnectionRequest, listConnectionsForUser, respondConnectionRequest } from "../services/connectionsService.js";

const hydrateUserDirectory = async (requests, currentUserId) => {
  const ids = new Set();
  requests.forEach((item) => {
    ids.add(Number(item.fromUserId));
    ids.add(Number(item.toUserId));
  });

  ids.delete(Number(currentUserId));
  if (ids.size === 0) return {};

  const users = await User.findAll({
    where: { id_usuario: Array.from(ids) },
    attributes: ["id_usuario", "nombre", "apellido", "email", "foto_perfil"]
  });

  const directory = {};
  users.forEach((item) => {
    directory[item.id_usuario] = item;
  });
  return directory;
};

export const listConnections = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const data = await listConnectionsForUser(currentUserId);
    const all = [...data.sent, ...data.received, ...data.accepted];
    const userDirectory = await hydrateUserDirectory(all, currentUserId);

    return res.json({ data: { ...data, userDirectory } });
  } catch (error) {
    return res.status(500).json({ message: "Error al listar conexiones" });
  }
};

export const requestConnection = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const toUserId = Number(req.body.toUserId);
    if (!toUserId) {
      return res.status(400).json({ message: "toUserId es requerido" });
    }

    const result = await createConnectionRequest({ fromUserId: currentUserId, toUserId });
    if (!result.ok) {
      if (result.reason === "SELF_REQUEST") return res.status(400).json({ message: "No puedes conectarte contigo mismo" });
      if (result.reason === "ALREADY_PENDING") return res.status(409).json({ message: "Ya existe una solicitud pendiente" });
      if (result.reason === "ALREADY_CONNECTED") return res.status(409).json({ message: "Ya están conectados" });
      return res.status(400).json({ message: "No fue posible crear la solicitud" });
    }

    return res.status(201).json({ message: "Solicitud enviada", data: result.request });
  } catch (error) {
    return res.status(500).json({ message: "Error al enviar solicitud" });
  }
};

export const acceptConnection = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const result = await respondConnectionRequest({ requestId: req.params.requestId, userId: currentUserId, action: "accept" });

    if (!result.ok) {
      if (result.reason === "NOT_FOUND") return res.status(404).json({ message: "Solicitud no encontrada" });
      if (result.reason === "FORBIDDEN") return res.status(403).json({ message: "No puedes aceptar esta solicitud" });
      if (result.reason === "ALREADY_RESOLVED") return res.status(409).json({ message: "La solicitud ya fue resuelta" });
      return res.status(400).json({ message: "No fue posible aceptar la solicitud" });
    }

    const notification = await Notification.create({
      userId: result.request.fromUserId,
      actorId: currentUserId,
      type: "connection_accept",
      entityId: result.request.id,
      message: "Tu solicitud de conexión fue aceptada"
    });

    const io = getIo();
    if (io) {
      io.to(`user:${result.request.fromUserId}`).emit("notification", notification);
    }

    return res.status(200).json({ message: "Conexión aceptada", data: result.request });
  } catch (error) {
    return res.status(500).json({ message: "Error al aceptar conexión" });
  }
};

export const rejectConnection = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const result = await respondConnectionRequest({ requestId: req.params.requestId, userId: currentUserId, action: "reject" });

    if (!result.ok) {
      if (result.reason === "NOT_FOUND") return res.status(404).json({ message: "Solicitud no encontrada" });
      if (result.reason === "FORBIDDEN") return res.status(403).json({ message: "No puedes rechazar esta solicitud" });
      if (result.reason === "ALREADY_RESOLVED") return res.status(409).json({ message: "La solicitud ya fue resuelta" });
      return res.status(400).json({ message: "No fue posible rechazar la solicitud" });
    }

    return res.status(200).json({ message: "Solicitud rechazada", data: result.request });
  } catch (error) {
    return res.status(500).json({ message: "Error al rechazar conexión" });
  }
};
