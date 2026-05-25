import { Router } from "express";
import { getFeed, createPost, createComment, deletePost } from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/feed", protect, getFeed);
router.post("/", protect, createPost);
router.post("/:postId/comments", protect, createComment);
router.delete("/:postId", protect, deletePost);

export default router;
