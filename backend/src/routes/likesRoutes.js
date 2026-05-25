import { Router } from "express";
import { toggleLike, getLikes } from "../controllers/likesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router({ mergeParams: true });

router.post("/:postId/like", protect, toggleLike);
router.get("/:postId/likes", protect, getLikes);

export default router;
