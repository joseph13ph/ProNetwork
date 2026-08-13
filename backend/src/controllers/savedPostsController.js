import { SavedPost } from "../models/index.js";
import { getUserId } from "../utils/auth.js";

export const listSavedPosts = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const saved = await SavedPost.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]]
    });

    return res.json({ data: saved.map((item) => item.postId) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listSavedPosts", error);
    return res.status(500).json({ message: "Error al obtener guardados" });
  }
};

export const toggleSavedPost = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const postId = Number(req.params.postId);

    const existing = await SavedPost.findOne({ where: { userId, postId } });
    if (existing) {
      await existing.destroy();
      return res.json({ ok: true, action: "unsaved", postId });
    }

    await SavedPost.create({ userId, postId });
    return res.status(201).json({ ok: true, action: "saved", postId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error toggleSavedPost", error);
    return res.status(500).json({ message: "Error al guardar publicación" });
  }
};
