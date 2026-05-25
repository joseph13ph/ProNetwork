import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { resolveAssetUrl } from "../utils/assets";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const params = useParams();
  const profileUserId = params.userId || user?.id_usuario;

  useEffect(() => {
    const load = async () => {
      if (!profileUserId) return;

      try {
        const res = await api.get(`/profiles/${profileUserId}`);
        const profileData = res.data?.data;
        const usuario = profileData?.usuario || {};
        setProfile({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          foto_perfil: usuario.foto_perfil,
          ubicacion: usuario.ubicacion,
          rol_titulo: profileData?.titular || "Profesional",
          bio: profileData?.biografia || ""
        });
      } catch {
        setProfile(null);
      }

      try {
        const feed = await api.get("/posts/feed");
        const own = (feed.data || []).filter((p) => Number(p.userId) === Number(profileUserId));
        setPosts(own);
      } catch {
        setPosts([]);
      }
    };

    load();
  }, [profileUserId, user]);

  if (!profile) {
    return <div className="glass rounded-xl2 p-6">Cargando perfil...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="glass overflow-hidden rounded-xl2">
        <div className="h-48 w-full bg-gradient-to-r from-slate-800 to-purple-800" />
        <div className="p-5">
          <div className="flex items-center gap-4">
            <img
              src={profile.foto_perfil ? resolveAssetUrl(profile.foto_perfil) : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nombre)}&background=8b5cf6&color=fff`}
              alt="avatar"
              className="-mt-12 h-28 w-28 rounded-full border-4 border-white/80 object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">
                {profile.nombre} {profile.apellido}
              </h2>
              <p className="text-mediumGray">{profile.rol_titulo}</p>
              <p className="mt-2 text-sm text-mediumGray">{profile.bio || profile.ubicacion}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
};

export default ProfilePage;
