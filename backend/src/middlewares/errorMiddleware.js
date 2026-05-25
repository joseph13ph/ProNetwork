export const notFound = (req, res) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      message: "Token CSRF invalido o ausente"
    });
  }

  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  return res.status(status).json({
    message,
    errors: Array.isArray(err.errors) ? err.errors : undefined
  });
};
