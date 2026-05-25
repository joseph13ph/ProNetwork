import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import { sanitizeBody } from "./middlewares/sanitizeMiddleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
const legacyUploadDir = path.resolve(__dirname, "..", "..", "backend", "uploads");
const frontendDistDir = path.resolve(__dirname, "..", "..", "frontend", "dist");
const frontendIndexFile = path.join(frontendDistDir, "index.html");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(legacyUploadDir)) {
  fs.mkdirSync(legacyUploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
  })
});

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          `http://localhost:${env.port}`,
          `http://127.0.0.1:${env.port}`
        ]
      }
    }
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeBody);
app.use("/uploads", express.static(uploadDir));
app.use("/uploads", express.static(legacyUploadDir));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

if (env.csrfEnabled) {
  app.use(csrf({ cookie: true }));
}

app.get("/api/csrf-token", (req, res) => {
  if (env.nodeEnv !== "production") {
    return res.status(200).json({ csrfToken: null, message: "CSRF desactivado en desarrollo" });
  }

  return res.status(200).json({ csrfToken: req.csrfToken() });
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  return res.status(201).json({ file: req.file?.filename, path: req.file?.filename ? `/uploads/${req.file.filename}` : "" });
});

app.use("/api", routes);

if (fs.existsSync(frontendIndexFile)) {
  app.use(express.static(frontendDistDir));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(frontendIndexFile);
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
