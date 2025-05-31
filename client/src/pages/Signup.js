// Signup.js
import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Signup = () => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault(); // Prevent page refresh

        try {
            const response = await fetch("https://localhost:3001/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, email, password }),
            });
    
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("isLogin", "true");
                localStorage.setItem("userName", data.userName);
                localStorage.setItem("userID", String(data.userID));
                console.log("User ID: ", data.userID);

                navigate("/");
            } else {
                alert(data.message || "Signup failed");
            }
        } catch (err) {
            console.error("Signup error:", err);
            alert("Signup failed. Try again later.");
        }

        // Reset form fields after submission
        setUserName("");
        setEmail("");
        setPassword("");
    };

    const handleGoogleSuccess = (credentialResponse) => {
        const token = credentialResponse.credential;

        fetch("https://localhost:3001/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: token }),
        })
            .then(res => res.json())
            .then(data => {
                console.log("Server response:", data);
                localStorage.setItem("isLogin", "true");
                localStorage.setItem("userName", data.user.username);
                localStorage.setItem("userID", String(data.user.userID));
                navigate("/");
                // Store JWT or user data if needed
            })
            .catch(err => console.error("Auth error", err));

        console.log("Google credential:", credentialResponse);
        console.log("Decoded token:", jwtDecode(token));
    };
    
    const handleGoogleError = () => {
        console.log("Google login failed");
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
            />
        </div>
    );

};

export default Signup;
