import express from 'express';
import Quiz from '../models/quiz.js';
import Question from '../models/question.js';

const router = express.Router();

// Save quiz
router.post('/create', async (req, res) => {
  
    try{
      const{ title } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const saved = await Quiz.create({
        title,
      });

      return res.status(200).json({ message: "Quiz saved", quizID: saved.quizID });
  } catch (error) {
    console.error("🔥 Error saving quiz:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save questions
router.post('/save-questions', async (req, res) => {
  try {
    const { quizID, title, questions, difficulty } = req.body;
    
    // Save all questions in bulk
    const savedQuestion = await Question.create({
      quizID,
      title,
      questions,
      difficulty,
    });
    
    return res.status(200).json({ 
      message: "Questions saved successfully", 
      questionID: savedQuestion.questionID 
    });
  } catch (error) {
    console.error("Error saving questions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch questions
router.get('/questions/:quizID', async (req, res) => {
  try {
    const { quizID } = req.params;
    const questions = await Question.findOne({
      where: { quizID }
    });
    return res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



export default router;