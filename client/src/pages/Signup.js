// Signup.js
import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Signup = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to handle successful authentication (both regular and Google)
  const onAuthSuccess = (data, isGoogleAuth = false) => {
    console.log("Auth success data:", data);
    
    // Multiple fallbacks for userName
    const finalUserName = data.userName || 
                          data.username || 
                          data.user?.username || 
                          data.user?.userName ||
                          (data.user?.email ? data.user.email.split('@')[0] : null) ||
                          (email ? email.split('@')[0] : 'User');
    
    // Multiple fallbacks for userID
    const userID = data.userID || 
                   data.userId || 
                   data.user?.id || 
                   data.user?.userID ||
                   data.user?.userId;

    if (!userID) {
      console.error("Auth succeeded but missing userID:", data);
      alert("Authentication succeeded but user information is incomplete. Please try again.");
      return;
    }

    // Store user information
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("userName", finalUserName);
    localStorage.setItem("userID", String(userID));
    
    if (data.token) {
      localStorage.setItem("token", data.token);
      
      // Optional: Decode and log token for debugging
      try {
        const decoded = jwtDecode(data.token);
        console.log("Decoded JWT:", decoded);
      } catch (err) {
        console.warn("Could not decode JWT:", err);
      }
    }

    console.log(`${isGoogleAuth ? 'Google signup' : 'Signup'} successful! Welcome ${finalUserName}`);
    navigate("/");
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    
    if (!userName || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://quiz-backend-5rjf.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, email, password }),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (response.ok) {
        onAuthSuccess(data, false);
      } else {
        const errorMessage = data.message || data.error || `Signup failed (${response.status})`;
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      // Reset form fields
      setUserName("");
      setEmail("");
      setPassword("");
    }
  };

  // Handle Google OAuth signup
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
        console.log("Google signup token payload:", decoded);
      } catch (err) {
        console.warn("Could not decode Google token:", err);
      }

      // Call the same Google OAuth endpoint as login
      // Your backend should handle both login and signup for existing/new users
      const response = await fetch("https://quiz-backend-5rjf.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: token }),
      });

      const data = await response.json();
      console.log("Google signup response:", data);

      if (response.ok) {
        onAuthSuccess(data, true);
      } else {
        const errorMessage = data.error || data.message || `Google signup failed (${response.status})`;
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Google signup error:", err);
      alert("Google signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google signup failed");
    alert("Google signup failed. Please try again.");
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <AuthForm
        onSubmit={handleSignup}
        isLogin={false}
        userName={userName}
        setUserName={setUserName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showGoogleButton={true}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={handleGoogleError}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Signup;