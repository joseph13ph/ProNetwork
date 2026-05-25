import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ConnectionsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState({ sent: [], received: [], accepted: [], userDirectory: {} });

  const loadUsers = async () => {
    const res = await api.get("/users");
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    setUsers(list.filter((item) => item.id_usuario !== user?.id_usuario));
  };

  const loadConnections = async () => {
    const res = await api.get("/connections");
    setConnections(res.data?.data || { sent: [], received: [], accepted: [], userDirectory: {} });
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadConnections()]);
    } catch {
      addToast("No se pudieron cargar las conexiones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) {
      refreshAll();
    }
  }, [user?.id_usuario]);

  const getUserLabel = (id) => {
    const fromDirectory = connections.userDirectory?.[id];
    const fallback = users.find((item) => Number(item.id_usuario) === Number(id));
    const person = fromDirectory || fallback;
    if (!person) return `Usuario ${id}`;
    return `${person.nombre} ${person.apellido}`;
  };

  const isUnavailable = (targetId) => {
    const hasSent = connections.sent.some((item) => Number(item.toUserId) === Number(targetId));
    const hasReceived = connections.received.some((item) => Number(item.fromUserId) === Number(targetId));
    const hasAccepted = connections.accepted.some((item) => Number(item.fromUserId) === Number(targetId) || Number(item.toUserId) === Number(targetId));
    return hasSent || hasReceived || hasAccepted;
  };

  const handleSendRequest = async (toUserId) => {
    try {
      await api.post("/connections/request", { toUserId });
      addToast("Solicitud enviada", "success");
      await loadConnections();
    } catch (error) {
      addToast(error.response?.data?.message || "No se pudo enviar la solicitud", "error");
    }
  };

  const handleDecision = async (requestId, action) => {
    try {
      await api.post(`/connections/${requestId}/${action}`);
      addToast(action === "accept" ? "Conexión aceptada" : "Solicitud rechazada", "success");
      await loadConnections();
    } catch (error) {
      addToast(error.response?.data?.message || "No se pudo procesar la solicitud", "error");
    }
  };

  return (
    <section className="space-y-4">
      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h2 className="text-2xl font-bold">Conexiones</h2>
        <p className="mt-1 text-sm text-mediumGray">Envía solicitudes y administra tus conexiones profesionales.</p>
      </article>

      {loading ? <p className="text-sm text-mediumGray">Cargando conexiones...</p> : null}

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-lg font-semibold">Descubrir perfiles</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {users.map((item) => (
            <div key={item.id_usuario} className="rounded-xl2 border border-slate-200/70 p-4 dark:border-slate-700">
              <p className="font-semibold">{item.nombre} {item.apellido}</p>
              <p className="text-sm text-mediumGray">{item.email}</p>
              <button
                className="btn-primary mt-3"
                disabled={isUnavailable(item.id_usuario)}
                onClick={() => handleSendRequest(item.id_usuario)}
              >
                {isUnavailable(item.id_usuario) ? "No disponible" : "Conectar"}
              </button>
            </div>
          ))}
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-lg font-semibold">Solicitudes recibidas</h3>
        <div className="mt-3 space-y-3">
          {connections.received.length === 0 ? <p className="text-sm text-mediumGray">No tienes solicitudes pendientes.</p> : null}
          {connections.received.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-xl2 border border-slate-200/70 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700">
              <p className="text-sm">{getUserLabel(item.fromUserId)} quiere conectar contigo.</p>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={() => handleDecision(item.id, "accept")}>Aceptar</button>
                <button className="btn-secondary" onClick={() => handleDecision(item.id, "reject")}>Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-lg font-semibold">Solicitudes enviadas</h3>
        <div className="mt-3 space-y-2">
          {connections.sent.length === 0 ? <p className="text-sm text-mediumGray">No has enviado solicitudes.</p> : null}
          {connections.sent.map((item) => (
            <p key={item.id} className="rounded-xl2 border border-slate-200/70 p-3 text-sm dark:border-slate-700">
              Pendiente con {getUserLabel(item.toUserId)}
            </p>
          ))}
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-lg font-semibold">Ya conectados</h3>
        <div className="mt-3 space-y-2">
          {connections.accepted.length === 0 ? <p className="text-sm text-mediumGray">Aún no tienes conexiones aceptadas.</p> : null}
          {connections.accepted.map((item) => {
            const otherId = Number(item.fromUserId) === Number(user?.id_usuario) ? item.toUserId : item.fromUserId;
            return (
              <p key={item.id} className="rounded-xl2 border border-slate-200/70 p-3 text-sm dark:border-slate-700">
                Conectado con {getUserLabel(otherId)}
              </p>
            );
          })}
        </div>
      </article>
    </section>
  );
};

export default ConnectionsPage;
