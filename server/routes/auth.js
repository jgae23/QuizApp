// routes/auth.js
import express from "express";
import supabaseService from "../config/supabaseServiceClient.js"; // service-role client
import bcrypt from "bcrypt";
import { auth, OAuth2Client } from "google-auth-library";
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

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
//console.log("SUPABASE_SERVICE_ROLE_KEY length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

// Fetch user by email using Supabase Admin API
const fetchAuthUserByEmail = async (email) => {
  const { data, error } = await supabaseService
    .rpc('get_user_id_by_email', { email });

  if (error) {
    console.error('RPC error:', error);
    throw error;
  }
  return Array.isArray(data) && data.length > 0;
};

// Create auth user via admin API (service role)
const createAuthUser = async (email, password, userName) => {
  const { data, error } = await supabaseService.auth.admin.createUser({
    email,
    password, // admin will store/ hash password securely
    email_confirm: true,
    user_metadata: { username: userName },
  });  
  if (error) {
    console.error("Error creating auth user:", error);
    throw error;
  }  
  return data;
}

// Ensure profile row exists in public.profiles after createUser
const ensureProfileExists = async (userID, email, userName) => {
  const { data, error } = await supabaseService
    .from("profiles")
    .insert({
      id: userID, 
      email,
      username: userName, 
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Profile creation error:", error);
    throw new Error("Failed to create user profile");
  }

  return data;
};

// ------------------ SIGNUP ------------------
// Creates an auth user using the admin API and returns an app JWT
router.post("/signup", async (req, res) => {
  const { userName, email, password } = req.body;
  if (!email || !password || !userName) return res.status(400).json({ message: "Missing fields" });

  try {
    // If user exists in auth.users, reject
    const existing = await fetchAuthUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const newUser = await createAuthUser(email, password, userName);
    if (!newUser) return res.status(500).json({ message: "Failed to create user" });

    console.log("New user created:", newUser);

    // Ensure profile row exists in public.profiles after createUser
    const profile = await ensureProfileExists(newUser.user.id, newUser.user.email, userName);
    if (!profile) return res.status(500).json({ message: "Failed to create user profile" });
    console.log("Profile created successfully:", profile);

    // Sign app token
    const token = signAppToken({ userID: newUser.user.id, username: userName });

    res.status(201).json({
      message: "Signup successful",
      userName,
      userID: newUser.user.id,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ------------------ LOGIN ------------------
// Use Supabase token endpoint (grant_type=password) to authenticate and get user info.
// Returns an app JWT (server-signed) for your API use.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const { data, error } = await supabaseService.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Supabase login error:", error);
      return res.status(401).json({ message: error.message });
    }

    const { user, session } = data;
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // user has id, email, user_metadata
    const username = user.user_metadata?.username ?? user.email;

    // Sign your app’s own JWT
    const appToken = signAppToken({ userID: user.id, username });

    res.status(200).json({
      message: "Login successful",
      userName: username,
      userID: user.id,
      token: appToken,
      supabase_access_token: session.access_token,
      supabase_refresh_token: session.refresh_token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ------------------ GOOGLE OAUTH ------------------
// Frontend sends Google ID token (credential). Server verifies it with Google,
// then finds or creates an auth user (via admin API), upserts profile, and returns app JWT.
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Missing credential" });

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name ?? payload?.given_name ?? null;

    if (!email) {
      console.error("Google token payload missing email:", payload);
      return res.status(400).json({ error: "Google token missing email" });
    }

    // 1) Check existence (your helper returns truthy if exists)
    const exists = await fetchAuthUserByEmail(email);

    // We'll always normalize to a single userId variable
    let userId = null;

    if (!exists) {
      // create user (createAuthUser returns the admin create result)
      const created = await createAuthUser(email, Math.random().toString(36).slice(-12), name ?? email);

      // normalize created shape: try created.user, created.data, or created
      const createdUser = created?.user ?? created?.data ?? created;
      if (!createdUser || !createdUser.id) {
        console.error("createAuthUser returned unexpected shape:", created);
        return res.status(500).json({ message: "Failed to create user" });
      }
      userId = createdUser.id;

      // best-effort profile creation
      try {
        await ensureProfileExists(userId, createdUser.email ?? email, name ?? email);
      } catch (err) {
        console.warn("ensureProfileExists failed (non-fatal):", err);
      }
    } else {
      // If user exists, get its id via your RPC (returns array of rows)
      const { data: rpcData, error: rpcErr } = await supabaseService.rpc('get_user_id_by_email', { email });
      if (rpcErr) {
        console.error("RPC get_user_id_by_email error:", rpcErr);
        throw rpcErr;
      }
      if (Array.isArray(rpcData) && rpcData.length > 0 && rpcData[0].id) {
        userId = rpcData[0].id;
      } else {
        // fallback to searching admin list (rare)
        let page = 1;
        while (!userId) {
          const { data, error } = await supabaseService.auth.admin.listUsers({ page, perPage: 1000 });
          if (error) {
            console.error("admin.listUsers error:", error);
            throw error;
          }
          const users = data?.users ?? data?.data ?? [];
          const found = users.find(u => u.email === email);
          if (found) {
            userId = found.id;
            break;
          }
          if (!users || users.length === 0) break;
          page++;
        }
      }
    }

    if (!userId) {
      console.error("No userId after google flow for email:", email);
      return res.status(500).json({ error: "Google login response is missing user information. Please try again." });
    }

    // Sign token once with the normalized userId
    const appToken = signAppToken({ userID: userId, username: name ?? email });

    res.json({
      message: "Login successful",
      userName: name ?? email,
      userID: userId,
      token: appToken,
    });
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(401).json({ error: "Invalid token", details: error.message });
  }
});

export default router;
