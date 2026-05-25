import { Router } from "express";
import authRoutes from "./authRoutes.js";
import postRoutes from "./postRoutes.js";
import likesRoutes from "./likesRoutes.js";
import notificationsRoutes from "./notificationsRoutes.js";
import { listUsers } from "../controllers/usersController.js";
import { getProfile, upsertProfile } from "../controllers/profilesController.js";
import { protect, allowRoles } from "../middlewares/authMiddleware.js";
import { createCrudRouter } from "./crudRouteFactory.js";
import { adminController } from "../controllers/genericControllers.js";
import {
	acceptConnection,
	listConnections,
	rejectConnection,
	requestConnection
} from "../controllers/connectionsController.js";
import { listJobs, applyToJob } from "../controllers/jobsController.js";
import { listMessages, sendMessage } from "../controllers/messagesController.js";

const router = Router();

router.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
router.use("/auth", authRoutes);
router.get("/users", protect, listUsers);
router.put("/profiles", protect, upsertProfile);
router.get("/profiles/:userId", protect, getProfile);

router.use("/posts", postRoutes); // Rutas reales con Base de Datos
router.use("/posts", likesRoutes);
router.use("/notifications", notificationsRoutes);
router.get("/connections", protect, listConnections);
router.post("/connections/request", protect, requestConnection);
router.post("/connections/:requestId/accept", protect, acceptConnection);
router.post("/connections/:requestId/reject", protect, rejectConnection);
router.get("/jobs", protect, listJobs);
router.post("/jobs/:id/apply", protect, applyToJob);
router.get("/messages", protect, listMessages);
router.post("/messages", protect, sendMessage);
router.use("/admin", protect, allowRoles("administrador"), createCrudRouter(adminController));

export default router;
