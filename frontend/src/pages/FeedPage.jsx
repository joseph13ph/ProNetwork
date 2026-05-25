import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import PostCard from "../components/PostCard";

const FeedPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const assetBaseUrl = useMemo(() => (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, ""), []);

  const fetchFeed = async () => {
    try {
      const response = await api.get("/posts/feed");
      setPosts(response.data);
    } catch (error) {
      console.error("Error cargando el feed", error);
      addToast(error.response?.data?.message || "Error cargando el feed", "error");
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }

    const nextPreview = URL.createObjectURL(imageFile);
    setImagePreview(nextPreview);

    return () => URL.revokeObjectURL(nextPreview);
  }, [imageFile]);

  const getPostImageSrc = (postImage) => {
    if (!postImage) return null;
    if (postImage.startsWith("http")) return postImage;
    return `${assetBaseUrl}${postImage.startsWith("/") ? "" : "/"}${postImage}`;
  };

  const getAvatarSrc = (profile) => {
    if (profile?.foto_perfil) {
      return getPostImageSrc(profile.foto_perfil);
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(`${profile?.nombre || "P"} ${profile?.apellido || ""}`)}&background=8b5cf6&color=fff&bold=true`;
  };

  const handlePublish = async () => {
    if (!content.trim() && !imageFile) {
      addToast("Debes escribir algo o adjuntar una imagen", "error");
      return;
    }

    try {
      let uploadedImage = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResponse = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedImage = uploadResponse.data.path || (uploadResponse.data.file ? `/uploads/${uploadResponse.data.file}` : "");
      }

      const response = await api.post("/posts", {
        content,
        image: uploadedImage
      });

      setPosts((currentPosts) => [response.data, ...currentPosts]);
      setContent("");
      setImageFile(null);
    } catch (error) {
      console.error("Error publicando", error);
      addToast(error.response?.data?.message || "Hubo un error al publicar", "error");
    }
  };

  const handleComment = async (postId) => {
    const commentContent = prompt("Escribe tu comentario:");
    if (!commentContent || !commentContent.trim()) return;

    try {
      await api.post(`/posts/${postId}/comments`, { content: commentContent });
      fetchFeed();
    } catch (error) {
      console.error("Error comentando", error);
      addToast(error.response?.data?.message || "Hubo un error al comentar", "error");
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((current) => current.filter((post) => post.id !== postId));
  };

  return (
    <section className="space-y-4">
      <div className="glass rounded-xl2 p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <img
            src={getAvatarSrc(user)}
            alt={user?.nombre || "Tu perfil"}
            className="h-14 w-14 rounded-2xl object-cover theme-preview-ring"
          />
          <div className="flex-1">
            <textarea
              className="input min-h-28 resize-none border-transparent bg-white/50 text-base shadow-sm dark:bg-slate-950/20"
              placeholder="Comparte un logro, una vacante o una idea que pueda inspirar a otros..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {imagePreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700">
                <img src={imagePreview} alt="Vista previa" className="h-64 w-full object-cover" />
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-primary/40 px-4 py-2 text-sm font-semibold accent transition hover:bg-primary/5">
                + Adjuntar imagen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
              <button className="btn-primary" onClick={handlePublish}>
                Publicar ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{ ...post, image: getPostImageSrc(post.image) }}
          onComment={(id) => handleComment(id)}
          onDelete={handleDeletePost}
        />
      ))}

      {posts.length === 0 ? <p className="rounded-xl2 border border-dashed border-slate-300 bg-white/60 p-8 text-center text-mediumGray">No hay publicaciones en tu feed aún.</p> : null}
    </section>
  );
};

export default FeedPage;