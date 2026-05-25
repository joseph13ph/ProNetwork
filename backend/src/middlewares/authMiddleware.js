import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { normalizeAuthUser } from "../utils/auth.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = normalizeAuthUser(decoded);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return res.status(403).json({ message: "No autorizado para este recurso" });
  }
  return next();
};
