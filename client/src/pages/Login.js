import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const navigate = useNavigate();


    const handleLogin = async (event) => {
        event.preventDefault(); // Prevent page refresh

        // Perform local authentication logic
        try {
            const response = await fetch("https://localhost:3001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
            console.log("Raw response data:", data);

            if (response.ok) {
                localStorage.setItem("isLogin", "true");
                localStorage.setItem("userName", data.userName);
                localStorage.setItem("userID", String(data.userID));
                navigate("/");
            } else {
                alert(data.message || "Signup failed");
            }
        } catch (err) {
            console.error("Signup error:", err);
            alert("Signup failed. Try again later.");
        }

        // Reset form fields after submission
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
                onSubmit={handleLogin}
                isLogin={true} // Sign-up mode 
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
