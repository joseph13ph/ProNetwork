import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Bell, User, X, MoonStar, SunMedium, Upload, Bookmark, Sparkles } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationDropdown from "./NotificationDropdown";
import { resolveAssetUrl } from "../utils/assets";

const Navbar = () => {
  const { user, updateUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const loadContacts = async () => {
      if (!messagesOpen || !user?.id_usuario) return;

      try {
        const res = await api.get("/users");
        const nextContacts = Array.isArray(res.data?.data) ? res.data.data : [];
        setContacts(nextContacts.filter((item) => item.id_usuario !== user.id_usuario));
      } catch (error) {
        setContacts([]);
      }
    };

    loadContacts();
  }, [messagesOpen, user]);

  const openConversation = (contactId) => {
    setMessagesOpen(false);
    navigate(`/app/messages?userId=${contactId}`);
  };

  const handleProfilePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id_usuario) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const nextPhoto = uploadResponse.data.path || (uploadResponse.data.file ? `/uploads/${uploadResponse.data.file}` : "");
      const updateResponse = await api.put("/auth/me", { foto_perfil: nextPhoto });
      updateUser(updateResponse.data.user);
    } catch {
      // ignore for now
    } finally {
      event.target.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-white/25 px-4 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-gradient-to-br from-purple-600 to-pink-500 p-2 text-white font-bold">PC</div>
        <h1 className="text-lg font-semibold">ProNetwork</h1>
      </div>

      <nav className="relative flex items-center gap-3">
        <button title="Mensajes" className="p-2 rounded-full hover:bg-white/10" onClick={() => setMessagesOpen((value) => !value)}>
          <MessageCircle size={18} />
        </button>
        <NotificationDropdown />
        <button title="Perfil" className="flex items-center gap-2 rounded-full p-2 hover:bg-white/10" onClick={() => setProfileOpen((value) => !value)}>
          {user?.foto_perfil ? (
            <img src={resolveAssetUrl(user.foto_perfil)} alt="Perfil" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <User size={16} />
          )}
          <span className="hidden sm:inline text-sm">{user?.nombre || "Yo"}</span>
          {user?.isPremium ? <span className="hidden sm:inline rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-200">Premium</span> : null}
        </button>

        {profileOpen ? (
          <div className="absolute right-0 top-12 w-80 rounded-xl2 glass p-3 shadow-soft">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <p className="text-sm font-semibold">Perfil</p>
                <p className="text-xs text-mediumGray">Personaliza tu cuenta y apariencia</p>
              </div>
              <button onClick={() => setProfileOpen(false)} className="rounded-full p-1 hover:bg-white/10" aria-label="Cerrar perfil">
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <button onClick={toggleDarkMode} className="flex w-full items-center justify-between rounded-xl2 border border-white/10 px-3 py-2 text-left hover:bg-white/10">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {isDarkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
                  {isDarkMode ? "Modo claro" : "Modo oscuro"}
                </span>
              </button>

              <label className="flex cursor-pointer items-center justify-between rounded-xl2 border border-white/10 px-3 py-2 hover:bg-white/10">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Upload size={16} />
                  Subir foto de perfil
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
              </label>

              <button onClick={() => navigate("/app/saved")} className="flex w-full items-center justify-between rounded-xl2 border border-white/10 px-3 py-2 text-left hover:bg-white/10">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Bookmark size={16} />
                  Guardados
                </span>
              </button>

              <button onClick={() => navigate("/app/settings")} className="flex w-full items-center justify-between rounded-xl2 border border-white/10 px-3 py-2 text-left hover:bg-white/10">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles size={16} />
                  Versión premium
                </span>
              </button>
            </div>
          </div>
        ) : null}

        {messagesOpen ? (
          <div className="absolute right-0 top-12 w-80 rounded-xl2 glass p-3 shadow-soft">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <p className="text-sm font-semibold">Mensajes</p>
                <p className="text-xs text-mediumGray">Elige un contacto para abrir el chat</p>
              </div>
              <button onClick={() => setMessagesOpen(false)} className="rounded-full p-1 hover:bg-white/10" aria-label="Cerrar mensajes">
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
              {contacts.length === 0 ? (
                <p className="text-sm text-mediumGray">No hay contactos disponibles.</p>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id_usuario}
                    onClick={() => openConversation(contact.id_usuario)}
                    className="flex w-full items-center gap-3 rounded-xl2 border border-white/10 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-xs font-bold text-white">
                      {(contact.nombre?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{contact.nombre} {contact.apellido}</p>
                      <p className="truncate text-xs text-mediumGray">{contact.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
};

export default Navbar;
