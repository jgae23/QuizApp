// pages/TakeQuiz.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import QuizResult from '../components/QuizResult';
import QuizExplanations from '../components/QuizExplanations';
import axios from 'axios';

const TakeQuiz = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [quizData, setQuizData] = useState([]);
    const [quizTopic, setQuizTopic] = useState('');
    const [quizDifficulty, setQuizDifficulty] = useState('');
    const [quizID, setQuizID] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [viewMode, setViewMode] = useState('quiz'); // 'quiz' | 'results' | 'explanations'
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [quizType, setQuizType] = useState('');
    const [hasSaved, setHasSaved] = useState(false);

    const isLogin = localStorage.getItem("isLogin") === "true";
    const userID = localStorage.getItem("userID");

    useEffect(() => {
        if (location.state?.questions) {
            setQuizData(location.state.questions);
            setQuizTopic(location.state.topic || 'Quiz');
            setQuizDifficulty(location.state.difficulty);
            setQuizType(location.state.type);
            setQuizID(location.state.quizID || ''); // fallback if missing
            setUserAnswers(new Array(location.state.questions.length).fill(''));
        } else {
            navigate('/quiz-generator/ai');
        }
    }, [location, navigate]);

    useEffect(() => {
        const saveEverything = async () => {
            if (!isLogin || !userID || !quizData.length || !quizID || hasSaved) return;

            try {
                const explanationResponse = await axios.post('https://localhost:3001/api/explanations/save', {
                    userID,
                    quizID,
                    topic: quizTopic,
                    explanationData: {
                        quizData,
                        userAnswers
                    }
                });

                const explanationID = explanationResponse.data.explanationID;
                console.log("Explanation saved with ID:", explanationID);

                const resultPayload = {
                    userID,
                    topic: quizTopic,
                    score,
                    total: quizData.length,
                    attempts: totalAttempts,
                    difficulty: quizDifficulty,
                    quizID,
                    explanationID,
                };

                const resultRes = await axios.post('https://localhost:3001/api/result/save-results', resultPayload);
                if (resultRes.status === 200) {
                    console.log("Saved results successfully");
                    setHasSaved(true);
                }
            } catch (err) {
                console.error("Failed to save quiz result or explanations:", err);
            }
        };

        if (viewMode === 'results' && !hasSaved) {
            saveEverything();
        }
    }, [isLogin, userID, quizData, userAnswers, quizID, score, totalAttempts, quizTopic, quizDifficulty, viewMode, hasSaved]);

    const handleNextQuestion = () => {
        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentQuestion] = selectedAnswer;
        setUserAnswers(newUserAnswers);

        if (selectedAnswer === quizData[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }

        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer('');
        } else {
            setViewMode('results');
            setTotalAttempts(totalAttempts + 1);
        }
    };

    const handleRetakeQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswer('');
        setScore(0);
        setUserAnswers(new Array(quizData.length).fill(''));
        setViewMode('quiz');
        setHasSaved(false);
    };

    const handleContinueTrying = () => {
        setCurrentQuestion(0);
        setSelectedAnswer('');
        setScore(0);
        setHasSaved(false);
        setViewMode('quiz');
    };

    const handleShowExplanations = () => {
        setViewMode('explanations');
    };

    const handleBackToResults = () => {
        setViewMode('results');
    };

    if (!quizData.length) return <div className="container mt-5 text-center">Loading...</div>;

    return (
        <div className="container text-white mt-4 mb-4 p-4 border-0 rounded-4" style={{ backgroundColor: "#1a1a1a" }}>
            <h1 className="text-center mb-4" style={{ color: '#28a745' }} >{quizTopic} Quiz</h1>

            {viewMode === 'quiz' && (
                <QuestionCard
                    question={quizData[currentQuestion]}
                    current={currentQuestion}
                    total={quizData.length}
                    selectedAnswer={selectedAnswer}
                    onSelect={setSelectedAnswer}
                    onNext={handleNextQuestion}
                />
            )}

            {viewMode === 'results' && (
                <QuizResult
                    topic={quizTopic}
                    score={score}
                    quizID={quizID}
                    total={quizData.length}
                    attempts={totalAttempts}
                    onTryAgain={handleContinueTrying}
                    difficulty={quizDifficulty}
                    onShowExplanations={handleShowExplanations}
                    navigate={navigate}
                    quizData={quizData}
                    userAnswers={userAnswers}
                    quizType={quizType}
                />
            )}

            {viewMode === 'explanations' && (
                <QuizExplanations
                    quizData={quizData}
                    userAnswers={userAnswers}
                    onRetake={handleRetakeQuiz}
                    onBackToResults={handleBackToResults}
                    navigate={navigate}
                    readOnly={false}
                    quizType={quizType}
                    quizID={quizID}
                />
            )}
        </div>
    );
};

export default TakeQuiz;
