//src/pages/ExplanationPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuizExplanations from '../components/QuizExplanations.js';

const ExplanationPage = () => {
    const { explanationID } = useParams();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(true);

    const userID = localStorage.getItem("userID");

    useEffect(() => {
        console.log("INSIDE Explanation Page");
        const fetchExplanationData = async () => {
        try {
            const res = await axios.get(`https://localhost:3001/api/explanations/${userID}/${explanationID}`);
            setQuizData(res.data.questions.quizData);
            setUserAnswers(res.data.questions.userAnswers);
            setTopic(res.data.title);
            console.log("Topic: ", res.data.title);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching explanation data:", err);
            setLoading(false);
        }
        };

        fetchExplanationData();
    }, [userID, explanationID]);

    const handleRetake = () => {
        //navigate(`/quiz/${quizID}`); // or wherever your retake route is
    };

    if (loading) return <p className="text-white">Loading explanations...</p>;
    if (!quizData.length) return <p className="text-danger">No explanations found.</p>;

    return (
        <div className="container text-white mt-4 mb-4 p-4 rounded" style={{backgroundColor: "#1a1a1a"}} >
            <h1 className="text-center mb-4" style={{ color: '#28a745' }}>{topic} Quiz</h1>
                <QuizExplanations
                    quizData={quizData}
                    userAnswers={userAnswers}
                    onRetake={handleRetake}
                    navigate={navigate}
                    readOnly={true}
                />
        </div>
    );
};

export default ExplanationPage;
