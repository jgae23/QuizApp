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
            const response = await fetch("https://quiz-backend-5rjf.onrender.com/api/auth/login", {
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

        localStorage.removeItem("isLogin");
        localStorage.removeItem("userName");
        localStorage.removeItem("userID");
        localStorage.removeItem("token");
        localStorage.removeItem("supabase_access_token");


        fetch("https://quiz-backend-5rjf.onrender.com/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: token }),
        })
            .then(res => res.json())
            .then(data => {
                //console.log("Server response:", data);
                console.log("Username from data:", data.userName);
                localStorage.setItem("isLogin", "true");
                localStorage.setItem("userName", data.userName);
                localStorage.setItem("userID", String(data.userID));
                navigate("/");
                // Store JWT or user data if needed
            })
            .catch(err => console.error("Auth error", err));

        console.log("Google credential:", credentialResponse);
        console.log("Decoded token:", jwtDecode(token));
        console.log("Usernmae from token:", jwtDecode(token).name);
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
