import React from "react";
import "../styles/AuthForm.css"; 
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"

const AuthForm = ({ 
    onSubmit, isLogin, 
    email, setEmail, 
    password, setPassword, 
    setUserName, userName, 
    showGoogleButton, 
    onGoogleSuccess, 
    onGoogleError }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="form-wrapper">
            <div className="form-container bg-dark">
                <form onSubmit={onSubmit} className="p-4 rounded-lg shadow-md">
                    <h1 className="text-white text-center mb-3">{isLogin ? "Login" : "Create Account"}</h1>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="userName" >User Name:</label>
                            <input
                                type="text"
                                id="userName"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                                className="form-control bg-black text-white border-bottom-0 border-white"
                                style={{
                                boxShadow: 'none',
                                WebkitBoxShadow: '0 0 0 1000px black inset',
                                WebkitTextFillColor: 'white',
                                }}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email" >Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-control bg-black text-white border-bottom-0 border-white"
                            style={{
                            boxShadow: 'none',
                            WebkitBoxShadow: '0 0 0 1000px black inset',
                            WebkitTextFillColor: 'white',
                            }}
                        />
                    </div>
                    <div className="form-group position-relative">
                        <label htmlFor="password">Password:</label>
                        <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-control bg-black text-white border-bottom-0 border-white"
                        style={{
                            boxShadow: 'none',
                            WebkitBoxShadow: '0 0 0 1000px black inset',
                            WebkitTextFillColor: 'white',
                        }}
                        />

                        {/* Toggle visibility button */}
                        <button
                        type="button"
                        className="btn btn-sm btn-black position-absolute"
                        onClick={() => setShowPassword(prev => !prev)}
                        style={{top: '30px', right: '5px', WebkitBoxShadow: 'none', border: 'none',}}
                        tabIndex={-1}
                        >
                        {showPassword ? <Eye color="white" size={16} /> : <EyeOff color="white" size={16} />}
                        </button>
                    </div>

                    <button type="submit" className={`btn btn-signup ${isLogin ? "btn-primary" : "btn-primary"} btn-block`}>
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>
                <div className="d-flex align-items-center justify-content-center">
                    <hr style={{ width: '120px', borderTop: '1px solid #ccc', margin: 0 }} />
                    <span className="px-2 text-light">or</span>
                    <hr style={{ width: '120px', borderTop: '1px solid #ccc', margin: 0 }} />
                </div>
                {showGoogleButton && (
                    <div className="google-login-wrapper my-3 text-center">
                        <GoogleLogin
                            onSuccess={onGoogleSuccess}
                            onError={onGoogleError}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default AuthForm;