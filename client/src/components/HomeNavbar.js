// HomeNavbar.jsx
import "../styles/HomeNavbar.css"
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/quizapp_logo.png";
import icon from "../assets/person-icon-1.png";

// HomeNavbar component
const HomeNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Update login state whenever location changes (re-render trigger)
        const loggedIn = localStorage.getItem("isLogin") === "true";
        setIsLoggedIn(loggedIn);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("isLogin");
        setIsLoggedIn(false);
        navigate("/login");
    };

    // Determine which link to show
    const isLoginPage = location.pathname === "/login";
    const isSignupPage = location.pathname === "/signup";

    const userName = localStorage.getItem("userName");

    return (
        <nav className="navbar bg-dark">
            <div className="logo">
                <Link to="/">
                    <img src={logo} alt="quiz-app-logo" />
                </Link>
            </div>
            <div className="nav-right">
                <ul className="nav-links">
                    {isLoggedIn && (
                        <p className="welcome-message">Welcome, {userName || "User"}! 🎉</p>
                    )}
                    {!isLoggedIn && !isLoginPage && (
                        <li>
                            <Link to="/login" className="bordered-link">Login</Link>
                        </li>
                    )}
                    {!isLoggedIn && !isSignupPage && (
                        <li>
                            <Link to="/signup" className="bordered-link">Sign Up</Link>
                        </li>
                    )}
                    {isLoggedIn && (
                        <>
                            <li>
                                <Link to="/my-quizzes" className="bordered-link btn btn-link text-white">My Quizzes</Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="bordered-link btn btn-link text-white">
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                </ul>
                <div className="icon">
                    <Link to={isLoggedIn ? "/profile" : "/"}>
                        <img src={icon} alt="quiz-app-logo" />
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default HomeNavbar;
