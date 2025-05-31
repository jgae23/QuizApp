import React from "react";
import { Link } from "react-router-dom";

const QuizNavbar = () => {
  return (
    <nav className="navbar">
      <h1>QUIZ TIME</h1>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/results">Results</Link></li>
      </ul>
    </nav>
  );
};

export default QuizNavbar;
