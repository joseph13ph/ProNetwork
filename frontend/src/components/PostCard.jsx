import { motion } from "framer-motion";
import CommentList from "./CommentList";
import { Heart, Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { resolveAssetUrl } from "../utils/assets";
import { useAuth } from "../context/AuthContext";

const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(!!post.likedByUser);
  const [authorImageError, setAuthorImageError] = useState(false);
  const [postImageError, setPostImageError] = useState(false);
  const savedIds = JSON.parse(localStorage.getItem("proconnect_saved_posts") || "[]");
  const [saved, setSaved] = useState(savedIds.includes(post.id));
  const isOwner = Number(post.userId) === Number(user?.id_usuario);

  const handleToggleLike = async () => {
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      if (res.data.ok) {
        const nextLiked = res.data.action === "liked";
        setLiked(nextLiked);
        setLikesCount(res.data.likesCount ?? (nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1)));
      }
    } catch (error) {
      addToast(error.response?.data?.message || "No se pudo procesar el like", "error");
    }
  };

  const handleToggleSave = () => {
    const current = JSON.parse(localStorage.getItem("proconnect_saved_posts") || "[]");
    const nextSaved = current.includes(post.id) ? current.filter((item) => item !== post.id) : [...current, post.id];
    localStorage.setItem("proconnect_saved_posts", JSON.stringify(nextSaved));
    setSaved(!saved);
    addToast(saved ? "Publicación quitada de guardados" : "Publicación guardada", "info");
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`);
      addToast("Publicación eliminada", "info");
      if (onDelete) onDelete(post.id);
    } catch (error) {
      addToast(error.response?.data?.message || "No se pudo borrar la publicación", "error");
    }
  };

  return (
    <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass overflow-hidden rounded-xl2 shadow-soft">
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-3">
          <img
            src={!authorImageError && post.User?.foto_perfil ? resolveAssetUrl(post.User.foto_perfil) : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.User?.nombre || "U")}&background=8b5cf6&color=fff`}
            alt="avatar"
            className="h-12 w-12 rounded-2xl object-cover"
            onError={() => setAuthorImageError(true)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{post.User?.nombre} {post.User?.apellido}</h3>
              <span className="text-xs text-mediumGray">{post.User?.perfil?.titular || "Miembro"}</span>
            </div>
            <p className="text-sm text-mediumGray">Hace un momento</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7">{post.content}</p>
      </div>

      {post.image && !postImageError ? <img src={resolveAssetUrl(post.image)} alt="post" className="h-72 w-full object-cover" onError={() => setPostImageError(true)} /> : null}

      {post.Comments && post.Comments.length > 0 ? (
        <div className="border-t border-slate-200/70 bg-slate-100/70 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <CommentList comments={post.Comments} />
        </div>
      ) : null}

      <div className="flex justify-between border-t border-slate-200/70 p-4 text-sm text-mediumGray dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button onClick={handleToggleLike} className={`flex items-center gap-2 transition-colors ${liked ? "text-primary" : "hover:text-primary"}`}>
            <Heart size={16} fill={liked ? "#7c3aed" : "none"} />
            <span>{likesCount}</span>
          </button>
          <button onClick={() => onComment && onComment(post.id)} className="hover:text-primary transition-colors">Comentar</button>
        </div>
        <div className="flex items-center gap-3">
          {isOwner ? (
            <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 transition-colors hover:text-red-600">
              <Trash2 size={16} />
              <span className="hidden sm:inline">Borrar</span>
            </button>
          ) : null}
          <button onClick={handleToggleSave} className={`flex items-center gap-2 transition-colors ${saved ? "text-primary" : "hover:text-primary"}`}>
            <Bookmark size={16} fill={saved ? "#7c3aed" : "none"} />
            <span className="hidden sm:inline">{saved ? "Guardado" : "Guardar"}</span>
          </button>
          <button className="hover:text-primary transition-colors">Compartir</button>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
