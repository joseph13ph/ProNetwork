import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const getApiErrorMessage = (error, fallback) => {
  const apiMessage = error.response?.data?.message;
  const apiErrors = error.response?.data?.errors;

  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    return apiErrors.map((item) => item.msg || item.message).filter(Boolean).join(" | ");
  }

  if (apiMessage) {
    return apiMessage;
  }

  if (error.message === "Network Error") {
    return "No hay conexion con el backend. Verifica que el servidor este encendido.";
  }

  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem("proconnect_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem("proconnect_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("proconnect_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Error al iniciar sesion") };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      await api.post("/auth/register", payload);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Error al registrarse") };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("proconnect_token");
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
