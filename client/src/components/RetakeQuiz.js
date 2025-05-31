// src/components/RetakeQuiz.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RetakeQuiz = () => {
    const { quizID } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`/api/quiz/questions/${quizID}`);
                const topic = response.data.title;
                const questions = response.data.questions;
                const difficulty = response.data.difficulty;

                console.log("Topic Quiz: ", topic);
    
                setLoading(false);
    
                navigate('/take-quiz', {
                    state: {
                      questions,
                      topic,
                      difficulty,
                      quizID,
                    },
            
                });
                  
            } catch (err) {
                setError('Failed to fetch quiz questions');
                setLoading(false);
            }
        };
    
        fetchQuestions();
    }, [quizID, navigate]);
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return null; // Because navigate will redirect the user
};

export default RetakeQuiz;
