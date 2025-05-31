import React from "react";
import QuizSelection from "../components/QuizSelection";

const Home = () => {
  const isLogin = localStorage.getItem("isLogin") === "true";
  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '6rem',
  };
  
  const headingStyle = {
    fontSize: '3rem',
    marginBottom: '10px',
    color: '#e0ffff',
    textAlign: 'center',
  };
  
  const paragraphStyle = {
    fontSize: '1rem',
    marginBottom: '20px',
    color: '#f0f0f0',
    textAlign: 'center',
  };
  const cardsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '2rem',
    width: '100%',
    maxWidth: '1200px',
  };
    
  
  return (
    // Removed the "row" class that was forcing column layout
    <div className="container-fluid justify-content-center" style={containerStyle}>
        <h1 style={headingStyle}>Choose Your Quiz Experience</h1>
        <p style={paragraphStyle}>
            Select from our AI-powered quizzes or explore our trivia database
        </p>
        
        {!isLogin && (
            <p style={{ ...paragraphStyle, fontSize: "0.85rem", opacity: 0.8 }}>
            Sign up or Login to save your quizzes, track progress, and more!
            </p>
        )}
        
        {/* Cards wrapper - will display children in a row */}
        <div style={cardsContainerStyle}>
            <QuizSelection
            title="AI-Generated Quiz"
            description="Generate unique quiz questions on any topic using Claude 3.5 Sonnet AI.
                Perfect for custom topics or specialized knowledge areas."
            comment1="Any topic you can imagine"
            comment2="Custom difficulty levels"
            comment3="Unique questions every time"
            type="ai"
            />
            
            <QuizSelection
            title="Trivia Database"
            description="Use our trivia database with thousands of pre-made questions across
                various categories and difficulty levels."
            comment1="Multiple categories"
            comment2="Three difficulty levels"
            comment3="Multiple choice questions"
            type="trivia"
            />
        </div>
        
        {isLogin && (
            <>
            {/* Future User Features */}
            </>
        )}
    </div>
  );
};

export default Home;