import http from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { sequelize } from "./models/index.js";
import { initDatabase } from "./config/initDatabase.js";
import { syncDatabase } from "./config/syncDatabase.js";
import { setIo } from "./utils/socketServer.js";

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: env.nodeEnv === "production" ? true : env.clientUrl,
    methods: ["GET", "POST"],
    credentials: true
  }
});

setIo(io);

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(`user:${userId}`);
  });
});

const start = async () => {
  try {
    await initDatabase();
    await sequelize.authenticate();
    await syncDatabase();
    server.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`ProConnect API ejecutandose en puerto ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error al iniciar servidor", error);
    process.exit(1);
  }
};

start();
