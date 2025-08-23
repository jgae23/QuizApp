import React, { useState } from "react";
import "../styles/AuthForm.css"; 
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

const AuthForm = ({ 
    onSubmit, isLogin, 
    email, setEmail, 
    password, setPassword, 
    setUserName, userName, 
    showGoogleButton, 
    onGoogleSuccess, 
    onGoogleError 
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div
        className="container text-white p-4 rounded-4"
        style={{ 
          backgroundColor: "#1a1a1a",
          maxWidth: "500px",
          minHeight: "50vh",
          marginTop: "4rem",
          marginBottom: "3rem"
        }}
      >
        <div className="row justify-content-center" style={{ marginBottom: '-40px'}}>
          <div className="col-12">
            {/* Title + Subtitle like QuizGenerator */}
            <div className="text-center mb-4">
              <h2 style={{
                color: "#4da6ff",
                fontWeight: "600",
                textShadow: "0px 0px 10px rgba(77, 166, 255, 0.3)"
              }}>
                {isLogin ? "Welcome Back!" : "Create Your Account"}
              </h2>
              <p style={{
                color: "#cccccc",
                fontSize: "1.1rem",
                letterSpacing: "0.5px"
              }}>
                {isLogin ? "Login to continue your journey." : "Sign up to get started with quizzes."}
              </p>
            </div>

            <div className="form-container bg-dark mt-4">
              <form onSubmit={onSubmit} className="p-3 rounded-lg m-4 shadow-md">
                {/* Username for signup only */}
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="userName">User Name:</label>
                    <input
                      type="text"
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      placeholder="e.g., quizmaster123"
                      className="form-control bg-black text-white border-bottom-0 border-white"
                      style={{
                        boxShadow: 'none',
                        WebkitBoxShadow: '0 0 0 1000px black inset',
                        WebkitTextFillColor: 'white',
                      }}
                    />
                  </div>
                )}

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="form-control bg-black text-white border-bottom-0 border-white"
                    style={{
                      boxShadow: 'none',
                      WebkitBoxShadow: '0 0 0 1000px black inset',
                      WebkitTextFillColor: 'white',
                    }}
                  />
                </div>

                {/* Password */}
                <div className="form-group position-relative">
                  <label htmlFor="password">Password:</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="form-control bg-black text-white border-bottom-0 border-white"
                    style={{
                      boxShadow: 'none',
                      WebkitBoxShadow: '0 0 0 1000px black inset',
                      WebkitTextFillColor: 'white',
                    }}
                  />
                  {/* Toggle password visibility */}
                  <button
                    type="button"
                    className="btn btn-sm btn-black position-absolute"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{ top: '30px', right: '5px', border: 'none' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <Eye color="white" size={16} /> : <EyeOff color="white" size={16} />}
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" className={`btn btn-signup mt-2 ${isLogin ? "btn-primary" : "btn-primary"} btn-block`}>
                    {isLogin ? "Login" : "Sign Up"}
                </button>
              </form>

              {/* Divider */}
              <div className="d-flex align-items-center justify-content-center" style={{ marginTop: '-30px', marginBottom: '-15px'}}>
                <hr style={{ width: '120px', borderTop: '1px solid #ccc', margin: 0 }} />
                <span className="px-2 text-light">or</span>
                <hr style={{ width: '120px', borderTop: '1px solid #ccc', margin: 0 }} />
              </div>

              {/* Google login */}
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
        </div>
      </div>
    );
}

export default AuthForm;
