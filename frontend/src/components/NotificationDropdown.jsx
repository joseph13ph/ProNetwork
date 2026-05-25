import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/notifications");
        setItems(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {}
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    if (!user?.id_usuario) return undefined;
    socket.connect();
    socket.emit("join", user.id_usuario);
    socket.on("notification", (n) => {
      setItems((s) => [n, ...s]);
    });

    return () => {
      socket.off("notification");
    };
  }, [user]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((s) => s.map((x) => (x.id === id ? { ...x, read: true } : x)));
    } catch (error) {}
  };

  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-white/6">
        <Bell size={18} />
        {unread > 0 ? <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unread}</span> : null}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 mt-2 w-80 rounded-xl2 glass p-3 shadow-md">
            <h4 className="text-sm font-semibold mb-2">Notificaciones</h4>
            <div className="space-y-2 max-h-64 overflow-auto">
              {items.length === 0 ? <div className="text-sm text-mediumGray">Sin notificaciones</div> : null}
              {items.map((n) => (
                <div key={n.id} className={`p-2 rounded-md ${n.read ? "bg-transparent" : "bg-white/10"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{n.message}</div>
                      <div className="text-xs text-mediumGray">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.read ? <button onClick={() => markRead(n.id)} className="text-xs text-primary">Marcar</button> : null}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
