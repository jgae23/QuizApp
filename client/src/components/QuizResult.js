// pages/QuizResult.js

import React from 'react';

const QuizResult = ({topic, score, quizID, total, attempts, onTryAgain, difficulty, onShowExplanations, navigate, quizData, userAnswers, quizType}) => {
    const isLogin = localStorage.getItem("isLogin") === "true";
    //const userID = localStorage.getItem("userID");
    
    //const [explanationID, setExplanationID] = useState(null);
    //const [hasSaved, setHasSaved] = useState(false);
    const type = quizType;
    console.log("Quiz Type: ", type);
  
    return (
      <div className="card bg-dark text-white" style={{ border: '1px solid #237ac3' }}>
            <div className="card-body text-center">
                <h2>Quiz Results</h2>
                <h3>Your Score: {score} out of {total}</h3>
                <p>You got {Math.round((score / total) * 100)}%</p>
            
            
                <div className="mt-4">
                    {isLogin && 
                        <>
                            <p>You've attempted this quiz {attempts} times. Would you like to see the explanations or try again?</p>
                            <button className="btn btn-info me-2" onClick={onShowExplanations}>
                                Show Explanations
                            </button>
                        </>
                    }
                    <button className="btn btn-primary me-2" onClick={onTryAgain}>
                        Try Again
                    </button>
                    <button className="btn btn-secondary me-2" onClick={() => navigate(`/quiz-generator/${type}`)}>
                        New Quiz
                    </button>
                    <button className="btn me-2 btn-danger" onClick={() => navigate('/')}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuizResult;