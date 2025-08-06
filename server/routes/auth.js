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
console.log("SUPABASE_SERVICE_ROLE_KEY length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

// Fetch user by email using Supabase Admin API
// supabaseService is your service-role Supabase client
// supabaseService is your server-side client initialised with SERVICE_ROLE_KEY
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
      id: userID, // <- UUID from auth.users
      email,
      username: userName, // <- from req.body, or newUser.user.user_metadata.username
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
    console.log("fetchAuthUserByEmail called with email at 49:", email);
    const existing = await fetchAuthUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Create auth user via admin API (service role)
    /*const { data: newUser, error: createErr } = await supabaseService.auth.admin.createUser({
      email,
      password, // admin will store/ hash password securely
      email_confirm: true,
      user_metadata: { username: userName },
    });*/
    const newUser = await createAuthUser(email, password, userName);
    if (!newUser) return res.status(500).json({ message: "Failed to create user" });

    if (createErr) throw createErr;

    // Ensure profile row exists in public.profiles after createUser
    const profile = await ensureProfileExists(newUser.user.id, newUser.user.email, userName);
    if (!profile) return res.status(500).json({ message: "Failed to create user profile" });
    console.log("Profile created successfully:", profile);

    /*const { data: profile, error: profileError } = await supabaseService
        .from("profiles")
        .insert({
            id: newUser.user.id, // <- UUID from auth.users
            email: newUser.user.email,
            username: userName, // <- from req.body, or newUser.user.user_metadata.username
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("Failed to create user profile");
    }*/


    //console.log("Profile created successfully:", profile);

    /*await supabaseService.from("profiles").upsert(
      [{ id: newUser.id, username: userName, email }],
      { onConflict: "id" }
    );*/

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
    const { email, name, sub: googleId } = payload;

    // Try to find existing auth user by email (admin REST)
    let authUser = await fetchAuthUserByEmail(email);

    // If not found, create via admin.createUser
    /*if (!authUser) {
      const { data: createdUser, error: createErr } = await supabaseService.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-12), // random password; user uses OAuth
        email_confirm: true,
        user_metadata: { username: name, googleId },
      });
      if (createErr) throw createErr;
      authUser = createdUser;
    }*/

    if (!authUser) {
        const createUser = await createAuthUser(email, Math.random().toString(36).slice(-12), name);
        if (!createUser) return res.status(500).json({ message: "Failed to create user" });
        authUser = createUser;
    }

    // Ensure a profile row exists in public.profiles (server uses service key -> bypass RLS)
    const profile = await ensureProfileExists(authUser.id, email, name);
    if (!profile) return res.status(500).json({ message: "Failed to create user profile" });
    console.log("Profile created successfully:", profile);

    /*await supabaseService.from("profiles").upsert(
      [{ id: authUser.id, username: name, email }],
      { onConflict: "id" }
    );*/

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
    res.status(401).json({ error: "Invalid token", details: error.message });
  }
});

export default router;
