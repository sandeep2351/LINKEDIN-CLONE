import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js"; // Assuming you have this middleware for user authentication
import {
	createPost,
	getFeedPosts,
	deletePost,
	getPostById,
	createComment,
	likePost,
	deleteComment, // Import the new deleteComment controller
} from "../controllers/post.controller.js";

const router = express.Router();

// Get all posts in the feed
router.get("/", protectRoute, getFeedPosts);

// Create a new post
router.post("/create", protectRoute, createPost);

// Delete a specific post
router.delete("/delete/:id", protectRoute, deletePost);

// Get a post by its ID
router.get("/:id", protectRoute, getPostById);

// Create a new comment on a post
router.post("/:id/comment", protectRoute, createComment);

// Like/unlike a post
router.post("/:id/like", protectRoute, likePost);

// Delete a specific comment on a post
router.delete("/:postId/comment/:commentId", protectRoute, deleteComment); // New route for deleting comments

export default router;
