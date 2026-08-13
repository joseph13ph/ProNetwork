import { Router } from "express";
import { getFeed, createPost, createComment, deletePost } from "../controllers/postController.js";
import { listSavedPosts, toggleSavedPost } from "../controllers/savedPostsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/feed", protect, getFeed);
router.get("/saved", protect, listSavedPosts);
router.post("/", protect, createPost);
router.post("/:postId/comments", protect, createComment);
router.post("/:postId/save", protect, toggleSavedPost);
router.delete("/:postId", protect, deletePost);

export default router;
