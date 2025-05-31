// src/QuizExplanations.js
import React from 'react';

const QuizExplanations = ({quizData, userAnswers, onRetake, onBackToResults, navigate, readOnly, quizType}) => {
    console.log("QuizExplanations loaded");
    console.log("QuizExplanations loaded, readOnly = ", readOnly);

    return (
        <div className="card text-white bg-dark border" >
            <div className="card-body">
                <h2 className="text-center mb-4">Explanations</h2>
                
                {quizData.map((question, index) => (
                    <div key={index} className="mb-4 p-3 border rounded" style={{backgroundColor: "#1a1a1a"}} >
                        <h4>{index + 1}. {question.question}</h4>
                        <div className="options mt-2">
                            {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`mb-1 ${
                                option === question.correctAnswer 
                                ? 'text-success fw-bold' 
                                : option === userAnswers[index]
                                    ? 'text-danger' 
                                    : ''
                            }`}>
                                {option} {option === question.correctAnswer && '✓'} 
                                {option === userAnswers[index] && option !== question.correctAnswer && '✗'}
                            </div>
                            ))}
                        </div>
                        <div className="explanation mt-3 p-2 bg-dark border-info border rounded">
                            <h5>Explanation:</h5>
                            <p>{question.explanation}</p>
                        </div>
                    </div>
                ))}
                {!readOnly && (
                    <div className="text-center mt-4">
                        <button className="btn btn-primary me-2" onClick={onRetake}>
                        Retake Quiz
                        </button>
                        <button className="btn btn-secondary me-2" onClick={() => navigate(`/quiz-generator/${quizType}`)}>
                        New Quiz
                        </button>
                        <button className="btn btn-info me-2" onClick={() => {
                        console.log("Button clicked"); 
                        onBackToResults();
                        }}>
                        Back to Results
                        </button>

                        <button className="btn me-2 btn-danger" onClick={() => navigate('/')}>
                        Exit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizExplanations;