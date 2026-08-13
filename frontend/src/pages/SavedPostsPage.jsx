import { useEffect, useState } from "react";
import api from "../services/api";
import PostCard from "../components/PostCard";

const SavedPostsPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/posts/feed");
        const list = Array.isArray(res.data) ? res.data : [];
        setPosts(list.filter((post) => post.savedByUser));
      } catch {
        setPosts([]);
      }
    };

    load();
  }, []);

  const handleSaveChange = (postId, saved) => {
    if (!saved) {
      setPosts((current) => current.filter((post) => post.id !== postId));
    }
  };

  return (
    <section className="space-y-4">
      <div className="glass rounded-xl2 p-5 shadow-soft">
        <h2 className="text-2xl font-bold">Guardados</h2>
        <p className="mt-1 text-sm text-mediumGray">Aquí aparecen las publicaciones que marcaste para ver después.</p>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="rounded-xl2 border border-dashed border-slate-300 bg-white/60 p-8 text-center text-mediumGray">
            Aún no tienes publicaciones guardadas.
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onSaveChange={handleSaveChange} />)
        )}
      </div>
    </section>
  );
};

export default SavedPostsPage;
