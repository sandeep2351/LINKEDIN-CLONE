import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "

    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Find the user based on decoded userId
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User Not Found" });
    }

    // Attach user information to the request object
    req.user = user;

    // Optionally attach the user's theme to the response headers
    if (user.theme) {
      res.setHeader("X-User-Theme", user.theme); // Send theme preference in headers for front-end use
    }

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Token Expired" });
    }

    // Generic server error response
    res.status(500).json({ message: "Internal Server Error" });
  }
};
