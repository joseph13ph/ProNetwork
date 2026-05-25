import { Notification } from "../models/index.js";
import { getUserId } from "../utils/auth.js";

export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: getUserId(req.user) },
      order: [["createdAt", "DESC"]]
    });
    return res.json({ data: notifications });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listNotifications", error);
    return res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification || Number(notification.userId) !== Number(getUserId(req.user))) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }
    notification.read = true;
    await notification.save();
    return res.json({ ok: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error markRead", error);
    return res.status(500).json({ message: "Error al marcar leída" });
  }
};
