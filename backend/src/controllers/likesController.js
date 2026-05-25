import { Like, Post, User, Notification } from "../models/index.js";
import { getIo } from "../utils/socketServer.js";

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.sub;

    const existing = await Like.findOne({ where: { postId, userId } });
    if (existing) {
      await existing.destroy();
      const count = await Like.count({ where: { postId } });
      return res.json({ ok: true, action: "unliked", likesCount: count });
    }

    const like = await Like.create({ postId, userId });
    const count = await Like.count({ where: { postId } });

    // create a notification for the post owner
    const post = await Post.findByPk(postId);
    if (post && post.userId && post.userId !== userId) {
      const notification = await Notification.create({
        userId: post.userId,
        actorId: userId,
        type: "like",
        entityId: postId,
        message: "Te gustó una publicación"
      });

      const io = getIo();
      if (io) {
        io.to(`user:${post.userId}`).emit("notification", notification);
      }
    }

    return res.status(201).json({ ok: true, action: "liked", likesCount: count, like });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error toggleLike", error);
    return res.status(500).json({ ok: false, message: "Error al procesar like" });
  }
};

export const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const count = await Like.count({ where: { postId } });
    return res.json({ ok: true, likesCount: count });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getLikes", error);
    return res.status(500).json({ ok: false, message: "Error al obtener likes" });
  }
};
