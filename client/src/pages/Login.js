// client/src/pages/Login.jsx
import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to persist login info with better fallbacks
  const onLoginSuccess = (payload) => {
    console.log("Login success payload:", payload);
    
    // Multiple fallbacks for userName
    const userName = payload.userName || 
                     payload.username || 
                     payload.user?.username || 
                     payload.user?.userName ||
                     (payload.user?.email ? payload.user.email.split('@')[0] : null) ||
                     (email ? email.split('@')[0] : 'User');
    
    // Multiple fallbacks for userID
    const userID = payload.userID || 
                   payload.userId || 
                   payload.user?.id || 
                   payload.user?.userID ||
                   payload.user?.userId;

    if (!userID) {
      console.error("Login succeeded but missing userID:", payload);
      alert("Login succeeded but user information is incomplete. Please try again.");
      return;
    }

    // Store user information
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("userName", userName);
    localStorage.setItem("userID", String(userID));
    
    if (payload.token) {
      localStorage.setItem("token", payload.token);
      
      // Optional: Decode and log token for debugging
      try {
        const decoded = jwtDecode(payload.token);
        console.log("Decoded JWT:", decoded);
      } catch (err) {
        console.warn("Could not decode JWT:", err);
      }
    }

    console.log(`Login successful! Welcome ${userName}`);
    navigate("/");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://quiz-backend-5rjf.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response data:", data);

      if (!response.ok) {
        const errorMessage = data.message || data.error || `Login failed (${response.status})`;
        alert(errorMessage);
        return;
      }

      // Check if we got the expected data structure
      if (!data.userID && !data.userId && !data.user?.id) {
        console.error("Invalid response structure:", data);
        alert("Login response is missing user information. Please try again.");
        return;
      }

      onLoginSuccess(data);
      
    } catch (err) {
      console.error("Login error:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      // Clear form
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

    setIsLoading(true);

    try {
      // Optional: Log Google token info for debugging
      try {
        const decoded = jwtDecode(token);
        console.log("Google token payload:", decoded);
      } catch (err) {
        console.warn("Could not decode Google token:", err);
      }

      const res = await fetch("https://quiz-backend-5rjf.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: token }),
      });

      const data = await res.json();
      console.log("Google auth response:", data);

      if (!res.ok) {
        const errorMessage = data.error || data.message || `Google login failed (${res.status})`;
        alert(errorMessage);
        return;
      }

      // Check if we got the expected data structure
      if (!data.userID && !data.userId && !data.user?.id) {
        console.error("Invalid Google auth response structure:", data);
        alert("Google login response is missing user information. Please try again.");
        return;
      }

      onLoginSuccess(data);
      
    } catch (err) {
      console.error("Google auth error", err);
      alert("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    alert("Google login failed. Please try again.");
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
        isLoading={isLoading} // Pass loading state to form if it supports it
      />
    </div>
  );
};

export default Login;