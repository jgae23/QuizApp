import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';


const MyQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userID = localStorage.getItem("userID");
    const navigate = useNavigate();

    const onViewExplanations = (explanationID) => {
        navigate(`/explanations/${explanationID}`);
    };

    const onViewAttempts = (quizID) => {
        navigate(`/attempts/${quizID}`);
    }

    const onRetakeQuiz = (quizID) => {
        navigate(`/retake-quiz/${quizID}`);
    }

    const handleDelete = async (explanationID, quizID) => {
        if (!window.confirm("Are you sure you want to delete this attempt?")) return;
        console.log("Explanation ID: ", explanationID);
        console.log("Quiz ID: ", quizID);
      
        try {
          await axios.delete(`https://localhost:3001/api/delete/${userID}/${quizID}/${explanationID}`);
          // delete successfully
          window.location.reload(); // refresh the page
        } catch (err) {
          console.error("Failed to delete attempt:", err);
          alert("Something went wrong.");
        }
     };

    const getDifficultyBadge = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
          case 'easy':
            return 'bg-success';
          case 'medium':
            return 'bg-warning text-dark';
          case 'hard':
            return 'bg-danger';
          default:
            return 'bg-secondary';
        }
    };
      

    useEffect(() => {
        const fetchQuizzes = async () => {
        try {
            const res = await axios.get(`https://localhost:3001/api/result/quiz/${userID}`);
            setQuizzes(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching quizzes:", err);
            setError("Failed to load quizzes.");
            setLoading(false);
        }
        };

        fetchQuizzes();
    }, [userID]);

    //console.log(quizzes);

    if (loading) return <p className="text-white">Loading your quizzes...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container pt-4 pb-4 px-4">
            <div className="card text-white border-0 rounded-4 shadow-sm p-4" style={{ backgroundColor: '#1a1a1a' }}>
                <h2 className="mb-4 text-center" style={{ color: '#28a745' }} >My Quizzes</h2>
            
                {quizzes.length === 0 ? (
                <p>You haven't saved any quizzes yet.</p>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {quizzes.map((quiz) => (
                            <div key={quiz.quizID} className="col">
                                <div className="card bg-dark text-light h-100 border-primary">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="card-title">{quiz.topic}</h5>
                                            {/* Dropdown menu */}
                                            <Dropdown onClick={(e) => e.stopPropagation()}>
                                                <Dropdown.Toggle
                                                    as={({ children, onClick }) => (
                                                    <div
                                                        onClick={(e) => {
                                                        e.preventDefault();
                                                        onClick(e);
                                                        }}
                                                        style={{ cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        backgroundColor: '#212529',
                                                        borderRadius: '0.25rem',
                                                        color: '#fff',
                                                        }}
                                                    >
                                                        {children}
                                                    </div>
                                                    )}
                                                    id={`dropdown-${quiz.quizID}`}
                                                >
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu 
                                                    variant="dark"
                                                    className="rounded-3"
                                                    style={{
                                                        backgroundColor: '#1a1a1a', // Pure black background
                                                        transform: 'translateX(-100px)', // Shift left by 10px
                                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' // Add subtle shadow for depth
                                                    }} 
                                                >
                                                    <Dropdown.Item onClick={() => onViewExplanations(quiz.explanationID)}>
                                                        <i className="bi bi-question-circle me-2"></i> View Explanations
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => onViewAttempts(quiz.quizID)}>
                                                        <i className="bi bi-clock-history me-2"></i> View Attempts
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => onRetakeQuiz(quiz.quizID)}>
                                                        <i className="bi bi-arrow-repeat me-2"></i> Retake Quiz
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item 
                                                        onClick={() => handleDelete(quiz.explanationID, quiz.quizID)}
                                                        className="text-danger"
                                                    >
                                                        <i className="bi bi-trash me-2"></i> Delete Quiz
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                                <p className="card-text mb-1">
                                                    Taken on {new Date(quiz.createdAt).toLocaleDateString()}
                                                </p>
                                                <span className={`badge ${getDifficultyBadge(quiz.difficulty)}`}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            height: '100%',
                                                          }}
                                                >
                                                    {quiz.difficulty || 'N/A'}
                                                </span>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2">
                                            <span className="badge bg-success">
                                                {quiz.score}/{quiz.totalQuestions}
                                            </span>
                                            <span className="text-end small">
                                                Accuracy: {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyQuizzes;