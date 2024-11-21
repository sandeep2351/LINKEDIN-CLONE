import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getSuggestedConnections, 
  getPublicProfile, 
  updateProfile, 
  getThemePreference, 
  updateThemePreference 
} from "../controllers/user.controller.js";

const router = express.Router();

// Existing routes
router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile);
router.put("/profile", protectRoute, updateProfile);

// New routes for theme preference
router.get("/theme", protectRoute, getThemePreference); // Fetch theme preference
router.put("/theme", protectRoute, updateThemePreference); // Update theme preference

export default router;
