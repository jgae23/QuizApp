// routes/auth.js
import express from "express";
import supabase from "../config/supabaseClient.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ------------------ SIGNUP ------------------
router.post("/signup", async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                { 
                    username: userName, 
                    email, 
                    password: hashedPassword,
                }
            ])
            .select()
            .single();
        
        if (insertError) throw insertError;

        res.status(201).json({ 
            message: 'Signup successful', 
            userName: newUser.username, 
            userID: newUser.userID 
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ 
            message: 'Login successful', 
            userName: user.username, 
            userID: user.userID 
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ------------------ GOOGLE OAUTH ------------------
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
        const { email, name, sub: googleId } = payload;

        // Try to find existing user by email
        let { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        // If not found, insert new user
        if (!user) {
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([
                    { 
                        username: name, 
                        email,
                        password: "oauth", // Dummy password to satisfy non-null
                        googleId
                    }
                ])
                .select()
                .single();

            if (insertError) throw insertError;
            user = newUser;
        }

        res.json({ 
            message: "Login successful", 
            userName: user.username, 
            userID: user.userID 
        });

    } catch (error) {
        console.error("OAuth error:", error.message);
        res.status(401).json({ error: "Invalid token" });
    }
});

export default router;
