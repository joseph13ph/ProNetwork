import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const NotificationsPage = () => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data?.data || []);
    } catch {
      addToast("No se pudieron cargar notificaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      addToast("No se pudo marcar como leída", "error");
    }
  };

  return (
    <section className="glass rounded-xl2 p-4 shadow-soft">
      <h2 className="text-2xl font-bold">Notificaciones</h2>
      {loading ? <p className="mt-4 text-mediumGray">Cargando...</p> : null}
      <div className="mt-4 space-y-3">
        {notifications.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl2 border p-3 ${item.read ? "border-slate-100" : "border-primary/30 bg-primary/5"}`}
          >
            <p className="text-sm">{item.message}</p>
            <p className="mt-1 text-xs text-mediumGray">{new Date(item.createdAt).toLocaleString()}</p>
            {!item.read ? (
              <button onClick={() => markRead(item.id)} className="mt-2 text-xs font-semibold text-primary">
                Marcar como leída
              </button>
            ) : null}
          </article>
        ))}
      </div>
      {!loading && notifications.length === 0 ? (
        <p className="mt-4 text-sm text-mediumGray">No tienes notificaciones por ahora.</p>
      ) : null}
    </section>
  );
};

export default NotificationsPage;
