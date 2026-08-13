import { Post, Comment, User, Profile, Like, Notification, SavedPost } from "../models/index.js";
import { getIo } from "../utils/socketServer.js";
import { getUserId } from "../utils/auth.js";

export const getFeed = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["nombre", "apellido", "foto_perfil"],
          include: [{ model: Profile, as: "perfil", attributes: ["titular", "biografia", "habilidades"] }]
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ["nombre", "apellido", "foto_perfil"] }]
        },
        {
          model: Like
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const savedPosts = await SavedPost.findAll({ where: { userId: currentUserId } });
    const savedPostIds = new Set(savedPosts.map((item) => Number(item.postId)));

    // Map likes count and whether current user liked or saved each post
    const mapped = posts.map((p) => {
      const likesCount = p.Likes ? p.Likes.length : 0;
      const likedByUser = !!(p.Likes && p.Likes.some((l) => Number(l.userId) === Number(currentUserId)));
      const plain = p.toJSON();
      return { ...plain, likesCount, likedByUser, savedByUser: savedPostIds.has(Number(p.id)) };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el feed" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const normalizedContent = typeof content === "string" ? content.trim() : "";
    const normalizedImage = typeof image === "string" ? image.trim() : "";

    if (!normalizedContent && !normalizedImage) {
      return res.status(400).json({ message: "Debes publicar texto o una imagen" });
    }

    const newPost = await Post.create({
      content: normalizedContent || " ",
      image: normalizedImage || null,
      userId: getUserId(req.user)
    });

    const postWithUser = await Post.findByPk(newPost.id, {
      include: [
        {
          model: User,
          attributes: ["nombre", "apellido", "foto_perfil"],
          include: [{ model: Profile, as: "perfil", attributes: ["titular", "biografia", "habilidades"] }]
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ["nombre", "apellido", "foto_perfil"] }]
        }
      ]
    });

    res.status(201).json(postWithUser);
  } catch (error) {
    res.status(500).json({ message: "Error al crear publicacion" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = getUserId(req.user);
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    if (Number(post.userId) !== Number(currentUserId)) {
      return res.status(403).json({ message: "No puedes borrar esta publicación" });
    }

    await post.destroy();
    return res.status(200).json({ ok: true, id: Number(postId) });
  } catch (error) {
    return res.status(500).json({ message: "Error al borrar publicación" });
  }
};

export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "El comentario no puede estar vacío" });
    }

    const comment = await Comment.create({
      content,
      postId,
      userId: getUserId(req.user)
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ["nombre", "apellido", "foto_perfil"] }]
    });

    // create notification for post owner if different
    const post = await Post.findByPk(postId);
    const currentUserId = getUserId(req.user);
    if (post && post.userId && Number(post.userId) !== Number(currentUserId)) {
      const notification = await Notification.create({
        userId: post.userId,
        actorId: currentUserId,
        type: "comment",
        entityId: post.id,
        message: "Comentaron tu publicación"
      });

      const io = getIo();
      if (io) io.to(`user:${post.userId}`).emit("notification", notification);
    }

    res.status(201).json(commentWithUser);
  } catch (error) {
    res.status(500).json({ message: "Error al comentar" });
  }
};
