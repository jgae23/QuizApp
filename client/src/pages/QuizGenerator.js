import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const QuizGenerator = () => {
  const { type } = useParams();
  const quizType = type;

  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  //const [selectedCategory, setSelectedCategory] = useState("");
  
  // Debug: Log the quiz type when component loads
  useEffect(() => {
    console.log("QuizGenerator loaded with type:", quizType);
  }, [quizType]);

  useEffect(() => {
    const saveQuizAndNavigate = async () => {
      if (quizData && quizData.length > 0) {
        try {
          // Create the quiz
          const response = await axios.post('https://localhost:3001/api/quiz/create', {
            title: topic,
          });

          const quizID = response.data.quizID;
          console.log("Quiz created ID: ", quizID);

          // Save all questions
          const savedQuestions = await axios.post('https://localhost:3001/api/quiz/save-questions', {
            quizID,
            title: topic,
            questions: quizData,
            difficulty
          });
          const questionID = savedQuestions.data.questionID;
          console.log("Question ID: ", questionID);
  
          navigate('/take-quiz', {
            state: {
              questions: quizData,
              topic,
              difficulty,
              quizID,
              type,
            },
          });
        } catch (error) {
          console.error("Failed to save quiz:", error);
          alert("There was an error saving the quiz. Please try again.");
        }
      }
    };

    saveQuizAndNavigate();
  }, [quizData, navigate, topic, difficulty, type]);

  useEffect(() => {
    // Fetch the categories from Open Trivia DB API
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://opentdb.com/api_category.php");
        setCategories(response.data.trivia_categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories.");
      }
    };

    fetchCategories();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log(`Generating ${quizType} quiz with:`, { topic, numberOfQuestions, difficulty });

    try {
      let response;

      if (quizType === 'ai') {
        response = await axios.post(`https://localhost:3001/api/ai-quiz/generate`, {
          topic,
          numberOfQuestions,
          difficulty
        });

        console.log("AI quiz response:", response.data);
        
        if (response.data.success) {
          setQuizData(response.data.questions);
        } else {
          setError('Failed to generate quiz questions.');
        }
      } else if (quizType === 'trivia') {
        //console.log("Making trivia quiz request to:", `${API_BASE}/api/trivia`);
        response = await axios.post(`https://localhost:3001/api/trivia-quiz/generate`, {
          category: topic,
          numberOfQuestions,
          difficulty
        });

        console.log("Trivia quiz response:", response.data);
        
        if (response.data && response.data.questions) {
          setQuizData(response.data.questions);
          console.log("Trivia questions:", response.data.questions);
        } else {
          setError('Failed to generate trivia questions.');
        }
      } else {
        setError(`Unknown quiz type: ${quizType}`);
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      // Show more detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(`Server error: ${err.response.status} - ${err.response.data.error || 'Unknown error'}`);
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('No response received from server. Please check your connection.');
      } else {
        console.error('Error message:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container text-white p-4 rounded-4"
      style={{ 
        backgroundColor: "#1a1a1a", 
        maxWidth: "500px",  // Limit the maximum width
        minHeight: "50vh",   // Reduce minimum height from 70vh
        marginTop: "4rem",
        marginBottom: "3rem"
      }}
    >
      { (quizType === 'trivia' && categories.length === 0) ? (
        <div className="text-center p-5">Loading categories...</div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="text-center mb-4">
              <h2 style={{
                color: "#4da6ff", // Bright blue for attention
                fontWeight: "600",
                textShadow: "0px 0px 10px rgba(77, 166, 255, 0.3)" // Subtle glow effect
              }}>
                Ready to Challenge Yourself?
              </h2>
              <p style={{
                color: "#cccccc", // Slightly lighter than white for contrast
                fontSize: "1.1rem",
                letterSpacing: "0.5px"
              }}>
                Choose a topic, set your difficulty, and we'll generate questions just for you!
              </p>
            </div>
              <div className="form-container bg-dark">
                <form onSubmit={handleGenerateQuiz} className="p-3 rounded-lg m-4 shadow-md" >
                  <div className="form-group">
                    {type === 'ai' && 
                      <>
                        <label htmlFor="topic">What do you want to get tested on?</label>
                          <input
                            type="text"
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Artificial Intelligence"
                            required
                            className="form-control bg-black text-white border-bottom-0 border-white"
                            style={{
                              boxShadow: 'none',
                              WebkitBoxShadow: '0 0 0 1000px black inset',
                              WebkitTextFillColor: 'white',
                            }}
                          />
                      </>
                    }
                    {type === 'trivia' && 
                      <>
                        <label htmlFor="category">Select a Trivia Category:</label>
                          <select
                            id="category"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="form-control bg-black text-white border-bottom-0"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category.name} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                      </>
                    }
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="numQuestions">Number of Questions:</label>
                    <select 
                      id="numQuestions" 
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                      className="form-control bg-black text-white border-bottom-0"
                    >
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                  </div>
              
                  <div className="form-group">
                    <label htmlFor="difficulty">Difficulty Level:</label>
                    <select 
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="form-control bg-black text-white border-bottom-0"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
              
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary transition"
                    style={{transformOrigin: 'center'}}
                    onMouseOver={ (e) =>  e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) =>  e.target.style.transform = 'scale(1)'}
                  >
                    {isLoading ? 'Generating...' : 'Generate Quiz'}
                  </button>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </div>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default QuizGenerator;