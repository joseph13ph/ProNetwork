import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/app/feed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="glass w-full max-w-md rounded-2xl p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Iniciar sesion</h1>
        <p className="mt-1 text-sm text-mediumGray">Accede a tu red profesional</p>

        <div className="mt-6 space-y-4">
          <input className="input" placeholder="Correo electronico" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Contrasena" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? "Ingresando..." : "Iniciar sesion"}</button>
        <p className="mt-4 text-center text-sm text-mediumGray">
          <Link to="/forgot-password" className="font-medium text-primary">¿Olvidaste tu contraseña?</Link>
        </p>
        <p className="mt-4 text-center text-sm text-mediumGray">
          No tienes cuenta? <Link to="/register" className="font-medium text-primary">Registrate</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
