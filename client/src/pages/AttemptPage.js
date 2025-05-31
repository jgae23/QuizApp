// src/pages/AttemptPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AttemptPage = () => {
  const { quizID } = useParams();
  const userID = localStorage.getItem("userID");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        let res;
        if(quizID) {
          res = await axios.get(`/api/result/attempts/${userID}/${quizID}`);
        } else {
          res = await axios.get(`/api/result/attempts/${userID}`);
        }
        setAttempts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching attempts:", err);
        setError("Failed to load attempts.");
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [quizID, userID]);

  const handleDelete = async (attemptID) => {
    if (!window.confirm("Are you sure you want to delete this attempt?")) return;
    console.log("Attempt ID: ", attemptID);
  
    try {
      await axios.delete(`/api/delete/${attemptID}`);
      setAttempts((prev) => prev.filter((a) => a.attemptID !== attemptID));
    } catch (err) {
      console.error("Failed to delete attempt:", err);
      alert("Something went wrong.");
    }
 };

 const onViewExplanations = (explanationID) => {
    navigate(`/explanations/${explanationID}`);
 };

  if (loading) return <p className="text-white">Loading attempts...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container pt-4 pb-4">
      <div className="card text-white rounded-4 shadow-sm p-4" style={{ backgroundColor: '#1a1a1a' }}>
        <h2 className="mb-4 text-center" style={{ color: '#28a745' }}>Past Attempts</h2>
        {attempts.map((attempt, index) => (
            <div
                key={index}
                className="d-flex "
            >
                <div
                    className="list-group-item bg- d-flex justify-content-between align-items-center text-white mb-2 rounded flex-grow-1"
                    style={{
                        backgroundColor: '#212529', // Bootstrap bg-dark color
                        transition: 'background-color 0.3s',
                        cursor: 'pointer',
                    }}
                    onMouseOver={(e) => e.currentTarget.classList.add('bg-primary')}
                    onMouseOut={(e) => e.currentTarget.classList.remove('bg-primary')}
                >
                    <div
                        className="d-flex align-items-center"
                        style={{ cursor: 'pointer', flexGrow: 1 }}
                        onClick={() => onViewExplanations(attempt.explanationID)}
                    >
                        <div className='p-2'>
                            <strong>{attempt.title} Quiz - Attempt #{index + 1}</strong>
                            <div>
                            <small>
                                Taken on {new Date(attempt.createdAt).toLocaleString()}
                            </small>
                            </div>
                        </div>
                    </div>
            
                    {/* Score button moved to the right side */}
                    <div className="d-flex align-items-center me-3">
                        <span className="badge bg-primary">
                            {attempt.score}/{attempt.totalQuestions} (
                            {Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                        </span>
                    </div>
                </div>
                <div
                    className="d-flex justify-content-center align-items-center rounded"
                    style={{
                        backgroundColor: '#212529', // bg-danger
                        width: '36px',
                        height: '65px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                    }}
                    onClick={() => handleDelete(attempt.attemptID)}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')} // bg-warning
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#212529')}  // bg-danger
                    >
                    <i className="bi bi-trash text-white"></i>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default AttemptPage;
