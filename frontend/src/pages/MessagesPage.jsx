import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resolveAssetUrl } from "../utils/assets";

const MessagesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const messagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedUserId = searchParams.get("userId");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get("/users");
        const list = res.data?.data || res.data || [];
        const filtered = list.filter((u) => u.id_usuario !== user?.id_usuario);
        setUsers(filtered);
      } catch {
        addToast("No se pudieron cargar usuarios", "error");
      }
    };

    if (user) loadUsers();
  }, [user]);

  useEffect(() => {
    if (!user?.id_usuario) return undefined;
    socket.connect();
    socket.emit("join", user.id_usuario);

    socket.on("private-message", (msg) => {
      if (activeUser && Number(msg.fromUserId) === Number(activeUser.id_usuario)) {
        setMessages((m) => [...m, { ...msg, incoming: true }]);
      }
    });

    return () => {
      socket.off("private-message");
      socket.disconnect();
    };
  }, [user, activeUser]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!selectedUserId || users.length === 0) return;
    const nextUser = users.find((item) => String(item.id_usuario) === String(selectedUserId));
    if (nextUser) {
      selectUser(nextUser);
    }
  }, [selectedUserId, users]);

  const emojiList = ["😀", "😂", "😍", "👍", "🔥", "🙏", "🎉", "💡", "🚀", "❤️"];

  const parseMessage = (value) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      return { text: value };
    }

    return { text: value };
  };

  const selectUser = async (u) => {
    setActiveUser(u);
    setMessages([]);
    setText("");
    setImageUrl("");
    try {
      const res = await api.get(`/messages?with=${u.id_usuario}`);
      const history = (res.data?.data || []).map((m) => ({
        content: m.content,
        incoming: Number(m.fromUserId) !== Number(user.id_usuario),
        fromUserId: m.fromUserId
      }));
      setMessages(history);
    } catch {
      addToast("No se pudieron cargar mensajes históricos", "info");
    }
  };

  const sendMessage = async () => {
    if (!text.trim() && !imageUrl || !activeUser) return;

    const payloadContent = JSON.stringify({ text: text.trim(), imageUrl: imageUrl || "" });
    const payload = { toUserId: activeUser.id_usuario, content: payloadContent };
    setMessages((m) => [...m, { ...payload, incoming: false, fromUserId: user.id_usuario }]);
    socket.emit("private-message", {
      toUserId: activeUser.id_usuario,
      content: payloadContent,
      fromUserId: user.id_usuario
    });

    try {
      await api.post("/messages", payload);
      setText("");
      setImageUrl("");
    } catch {
      addToast("No se pudo enviar el mensaje", "error");
    }
  };

  const handleEmojiInsert = (emoji) => {
    setText((current) => `${current}${emoji}`);
  };

  const handleMessageImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setImageUrl(response.data.path || (response.data.file ? `/uploads/${response.data.file}` : ""));
    } catch {
      addToast("No se pudo subir la imagen", "error");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="glass grid min-h-[560px] rounded-xl2 shadow-soft md:grid-cols-[280px_1fr]">
      <aside className="border-r border-slate-100 p-4">
        <h2 className="text-lg font-semibold">Conversaciones</h2>
        <div className="mt-3 space-y-2">
          {users.map((u) => (
            <button
              key={u.id_usuario}
              onClick={() => selectUser(u)}
              className={`w-full rounded-xl2 p-3 text-left text-sm ${activeUser?.id_usuario === u.id_usuario ? "bg-primary/10" : "hover:bg-slate-100/60"}`}
            >
              {u.nombre} {u.apellido}
            </button>
          ))}
        </div>
      </aside>
      <div className="flex flex-col p-4">
        <div ref={messagesRef} className="max-h-[60vh] space-y-3 overflow-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[70%] rounded-2xl p-3 text-sm ${m.incoming ? "bg-white/80 text-black" : "ml-auto bg-primary text-white"}`}
            >
              {(() => {
                const payload = parseMessage(m.content);
                return (
                  <div className="space-y-2">
                    {payload.text ? <p className="whitespace-pre-wrap">{payload.text}</p> : null}
                    {payload.imageUrl ? <img src={resolveAssetUrl(payload.imageUrl)} alt="Adjunto" className="max-h-64 rounded-xl object-cover" /> : null}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
        {imageUrl ? <p className="mt-3 text-xs text-mediumGray">Imagen lista para enviar.</p> : null}
        <div className="mt-auto space-y-3 pt-4">
          <div className="flex flex-wrap gap-2">
            {emojiList.map((emoji) => (
              <button key={emoji} onClick={() => handleEmojiInsert(emoji)} className="rounded-full border border-white/10 px-3 py-1 text-sm hover:bg-white/10">
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMessageImage}
            />
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2">
              <ImagePlus size={16} />
              Imagen
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="input"
              placeholder={activeUser ? `Escribe a ${activeUser.nombre}` : "Selecciona una conversación"}
            />
            <button onClick={sendMessage} className="btn-primary">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessagesPage;
