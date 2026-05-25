import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [requestId, setRequestId] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [demoResetLink, setDemoResetLink] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tokenValue = query.get("token") || "";
    setToken(tokenValue);
  }, []);

  useEffect(() => {
    if (!requestId) return undefined;

    const poll = async () => {
      try {
        const { data } = await api.get(`/auth/forgot-password/${requestId}/status`);
        const status = data?.data?.status || "queued";
        setRequestStatus(status);

        if (status === "sent") {
          setMessage("Correo de recuperación enviado. Puedes abrir el enlace de demostración.");
        }
      } catch {
        // ignored
      }
    };

    poll();
    const timer = setInterval(poll, 2000);
    return () => clearInterval(timer);
  }, [requestId]);

  const handleForgotSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    setRequestStatus("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      const nextRequestId = data?.data?.requestId || "";
      const nextStatus = data?.data?.status || "queued";
      setRequestId(nextRequestId);
      setRequestStatus(nextStatus);
      setDemoResetLink(data?.data?.resetLink || "");
      setMessage(data.message || "Solicitud enviada.");
    } catch (err) {
      setError(err.response?.data?.message || "Error al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/auth/reset-password", { token, newPassword });
      setMessage(data.message || "Contraseña actualizada.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  const isResetMode = Boolean(token);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={isResetMode ? handleResetSubmit : handleForgotSubmit} className="glass w-full max-w-md rounded-2xl p-6 shadow-soft">
        <h1 className="text-2xl font-bold">{isResetMode ? "Restablecer contraseña" : "Recuperar contraseña"}</h1>
        <p className="mt-1 text-sm text-mediumGray">
          {isResetMode ? "Ingresa tu nueva contraseña para completar el proceso." : "Ingresa tu correo para recibir un enlace de recuperación."}
        </p>

        {!isResetMode ? (
          <div className="mt-6 space-y-4">
            <input className="input" placeholder="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <input
              className="input"
              placeholder="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        {!isResetMode && requestId ? (
          <div className="mt-3 rounded-xl border border-slate-200/70 bg-white/40 p-3 text-sm">
            <p>
              Estado del envío: <strong>{requestStatus || "queued"}</strong>
            </p>
            {demoResetLink ? (
              <p className="mt-1">
                Enlace de demo: <a className="text-primary underline" href={demoResetLink}>abrir recuperación</a>
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-success" style={{ color: "green" }}>{message}</p> : null}

        <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? "Procesando..." : isResetMode ? "Actualizar contraseña" : "Enviar enlace"}</button>
        <p className="mt-4 text-center text-sm text-mediumGray">
          <Link to="/login" className="font-medium text-primary">Volver a iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
