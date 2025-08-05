// client/src/pages/Login.jsx
import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Helper to persist login info
  const onLoginSuccess = (payload) => {
    // payload should contain: userName, userID, token (optional)
    const userName = payload.userName ?? payload.user?.username;
    const userID = payload.userID ?? payload.user?.userID;

    if (!userName || !userID) {
      console.warn("Login succeeded but missing user info:", payload);
      return;
    }

    // Store minimal state
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("userName", userName);
    localStorage.setItem("userID", String(userID));

    if (payload.token) {
      localStorage.setItem("token", payload.token); // or use cookie
    }

    navigate("/");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("https://quiz-backend-5rjf.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Raw response data:", data);

      if (!response.ok) {
        alert(data.message || data.error || "Login failed");
        return;
      }

      onLoginSuccess(data);
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Try again later.");
    } finally {
      setEmail("");
      setPassword("");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) {
      alert("Missing Google credential");
      return;
    }

    try {
      const res = await fetch("https://quiz-backend-5rjf.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: token }),
      });
      const data = await res.json();
      console.log("Server response:", data);

      if (!res.ok) {
        alert(data.error || data.message || "Google login failed");
        return;
      }

      onLoginSuccess(data);
    } catch (err) {
      console.error("Auth error", err);
      alert("Google login failed");
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded Google token:", decoded);
    } catch {
      // not critical
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    alert("Google login failed");
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <AuthForm
        onSubmit={handleLogin}
        isLogin={true}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showGoogleButton={true}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={handleGoogleError}
      />
    </div>
  );
};

export default Login;
