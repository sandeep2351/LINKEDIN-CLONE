import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

// Get Suggested Connections
export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");

    // Find users who are not already connected and exclude the current user
    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    })
      .select("name username profilePicture headline")
      .limit(3);

    res.json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedConnections controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Public Profile
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in getPublicProfile controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "username",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(req.body.bannerImg);
      updatedData.bannerImg = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updatedData }, { new: true }).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch Theme Preference
export const getThemePreference = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ theme: user.theme || "light" }); // Default to light if not set
  } catch (error) {
    console.error("Error in getThemePreference controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Theme Preference
export const updateThemePreference = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({ message: "Invalid theme value" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { theme },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Theme updated successfully", theme: user.theme });
  } catch (error) {
    console.error("Error in updateThemePreference controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
