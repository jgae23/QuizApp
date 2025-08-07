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

  localStorage.removeItem("isLogin");
  localStorage.removeItem("userName");
  localStorage.removeItem("userID");
  localStorage.removeItem("token");
  localStorage.removeItem("supabase_access_token");

  // Helper function to handle successful authentication (both regular and Google)
  const onAuthSuccess = (data, isGoogleAuth = false) => {
    console.log("Auth success data:", data);

    let userID;
    let finalUserName = data.userName;
    console.log("I'm here at line 26 in Signup.js");

    if (data.token) {
        localStorage.setItem("token", data.token);

        try {
        const decoded = jwtDecode(data.token);
        console.log("Decoded JWT:", decoded);
        
        // Extract from decoded token
        userID = decoded.userID || decoded.id || decoded._id || decoded.email || decoded.username;
        finalUserName = finalUserName || decoded.username || decoded.email?.split('@')[0] || "User";
        } catch (err) {
        console.warn("Could not decode JWT:", err);
        }
    }

    if (!userID) {
        console.error("Auth succeeded but missing userID (even after decoding token):", data);
        alert("Authentication succeeded but user information is incomplete. Please try again.");
        return;
    }

    localStorage.setItem("isLogin", "true");
    localStorage.setItem("userName", finalUserName);
    localStorage.setItem("userID", String(userID));

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