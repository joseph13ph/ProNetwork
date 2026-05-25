import { Router } from "express";
import { listNotifications, markRead } from "../controllers/notificationsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, listNotifications);
router.put("/:id/read", protect, markRead);

export default router;
