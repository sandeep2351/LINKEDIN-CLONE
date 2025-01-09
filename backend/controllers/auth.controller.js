import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async (req, res) => {
	try {
		const { name, username, email, password } = req.body;

		// Validate input fields
		if (!name || !username || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Check if email or username already exists
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ message: "Email already exists" });
		}

		const existingUsername = await User.findOne({ username });
		if (existingUsername) {
			return res.status(400).json({ message: "Username already exists" });
		}

		// Validate password length
		if (password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters long" });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user
		const user = new User({
			name,
			email,
			password: hashedPassword,
			username,
		});

		await user.save();

		// Generate JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

		// Respond with token
		res.status(201).json({ 
			message: "User registered successfully", 
			token 
		});

		// Send welcome email
		const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;
		try {
			await sendWelcomeEmail(user.email, user.name, profileUrl);
		} catch (emailError) {
			console.error("Error sending welcome email", emailError);
		}
	} catch (error) {
		console.error("Error in signup:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Generate JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

		// Respond with token
		res.json({ 
			message: "Logged in successfully", 
			token 
		});
	} catch (error) {
		console.error("Error in login controller:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const logout = (req, res) => {
	// Logout handled on client-side
	res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		console.error("Error in getCurrentUser controller:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
