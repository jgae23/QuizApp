// routes/auth.js
import express from "express";
import supabaseService from "../config/supabaseServiceClient.js"; // service-role client
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signAppToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Helper: fetch user via Supabase Admin API (by email)
const fetchAuthUserByEmail = async (email) => {
  console.log("fetchAuthUserByEmail called with email:", email);
  if (!email) throw new Error("fetchAuthUserByEmail called with empty email");
  
  try {
    // Use the service client to list users (much cleaner than manual REST calls)
    const { data: users, error } = await supabaseService.auth.admin.listUsers();
    
    if (error) {
      console.error("Error listing users:", error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
    
    // Find user by email
    const user = users.users.find(u => u.email === email);
    return user || null;
    
  } catch (error) {
    console.error("fetchAuthUserByEmail error:", error);
    throw error;
  }
};

// Alternative helper using Supabase client method (recommended)
const fetchAuthUserByEmailV2 = async (email) => {
  try {
    // This is a cleaner approach using the client method
    const { data, error } = await supabaseService.auth.admin.getUserByEmail(email);
    
    if (error) {
      // If user not found, return null instead of throwing
      if (error.message.includes('User not found')) {
        return null;
      }
      throw error;
    }
    
    return data.user;
  } catch (error) {
    console.error("fetchAuthUserByEmailV2 error:", error);
    throw error;
  }
};

// ------------------ SIGNUP ------------------
// Creates an auth user using the admin API and returns an app JWT
router.post("/signup", async (req, res) => {
  const { userName, email, password } = req.body;
  if (!email || !password || !userName) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    // Check if user exists in auth.users
    const existing = await fetchAuthUserByEmailV2(email);
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create auth user via admin API (service role)
    const { data: authData, error: createErr } = await supabaseService.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: userName },
    });

    if (createErr) {
      console.error("Create user error:", createErr);
      throw createErr;
    }

    const newUser = authData.user;

    // Ensure profile row exists in public.profiles
    const { error: profileError } = await supabaseService
      .from("profiles")
      .upsert(
        [{ id: newUser.id, username: userName, email }],
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail the signup if profile creation fails, just log it
    }

    // Sign app token
    const token = signAppToken({ userID: newUser.id, username: userName });

    res.status(201).json({
      message: "Signup successful",
      userName,
      userID: newUser.id,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// ------------------ LOGIN ------------------
// Use Supabase Admin to authenticate user and return app JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    // Use Supabase Admin to sign in the user (server-side)
    const { data, error } = await supabaseService.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'http://localhost:3000' // This won't be used, just required
      }
    });

    if (error) {
      console.error("Generate link error:", error);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Alternative: Use signInWithPassword with a temporary client
    // This is actually better for password authentication
    const { data: signInData, error: signInError } = await supabaseService.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      return res.status(401).json({ 
        message: signInError.message || "Invalid email or password" 
      });
    }

    const authUser = signInData.user;
    const username = authUser.user_metadata?.username ?? authUser.email;

    // Create app JWT for your API auth
    const appToken = signAppToken({ userID: authUser.id, username });

    res.status(200).json({
      message: "Login successful",
      userName: username,
      userID: authUser.id,
      token: appToken,
      supabase_access_token: signInData.session?.access_token, // optional
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// ------------------ GOOGLE OAUTH ------------------
// Frontend sends Google ID token (credential). Server verifies it with Google,
// then finds or creates an auth user (via admin API), upserts profile, and returns app JWT.
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Missing credential" });
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ error: "No email in Google token" });
    }

    // Try to find existing auth user by email
    let authUser = await fetchAuthUserByEmailV2(email);

    // If not found, create via admin.createUser
    if (!authUser) {
      const { data: createData, error: createErr } = await supabaseService.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-12), // random password; user uses OAuth
        email_confirm: true,
        user_metadata: { username: name, googleId },
      });
      
      if (createErr) {
        console.error("Create OAuth user error:", createErr);
        throw createErr;
      }
      
      authUser = createData.user;
    }

    // Ensure a profile row exists in public.profiles
    const { error: profileError } = await supabaseService
      .from("profiles")
      .upsert(
        [{ id: authUser.id, username: name, email }],
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      // Don't fail OAuth if profile creation fails
    }

    const username = authUser.user_metadata?.username ?? name ?? authUser.email;

    // Sign app token
    const appToken = signAppToken({ userID: authUser.id, username });

    res.json({
      message: "Login successful",
      userName: username,
      userID: authUser.id,
      token: appToken,
    });
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(401).json({ 
      error: "Authentication failed", 
      details: error.message 
    });
  }
});

export default router;