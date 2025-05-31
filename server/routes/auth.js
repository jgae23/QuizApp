// routes/auth.js
import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username: userName,
            email,
            password: hashedPassword,
        });
       
        res.status(201).json({ message: 'Signup successful', userName: newUser.username, userID: newUser.userID });
    } catch (error) {
        console.error('Signup error', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.status(200).json({ message: 'Login successful', userName: user.username, userID: user.userID });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google route
router.post("/google", async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).json({ error: "Missing credential" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({ 
                email, 
                name, 
                username: name, 
                googleId, 
                password: "oauth" // Placeholder for consistency
            });
        }

        res.json({ message: "Login successful", user });
    } catch (error) {
        console.error("OAuth error:", error.message);
        res.status(401).json({ error: "Invalid token" });
    }
});


export default router;
