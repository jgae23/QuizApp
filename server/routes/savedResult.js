// routes/savedResult.js
import express from "express";
import Result from "../models/savedResult.js";
import Attempts from "../models/attempts.js";

const router = express.Router();

router.post('/save-results', async (req, res) => {
    try {

        const { userID, topic, score, total, attempts, difficulty, quizID, explanationID } = req.body;
    
        if (!userID || !topic) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const savedAttempt = await Attempts.create({
            userID,
            quizID,
            explanationID,
            title: topic,
            score,
            totalQuestions: total,
            createdAt: new Date(),
        });

        // Look for an existing result for this quiz and user
        const existingResult = await Result.findOne({ where: { quizID, userID } });

        if (existingResult) {
            // Update the existing result if new score is greater than old one
            if(score > existingResult.score) {
                existingResult.score = score;
                existingResult.explanationID = explanationID;
                existingResult.createdAt = new Date(); // optional: update timestamp

                await existingResult.save();

                return res.status(200).json({ message: "Result updated", quiz: existingResult, attempt: savedAttempt });
            } else {
                return res.status(200).json({ message: "Score not improved", quiz: existingResult, attempt: savedAttempt });
            }
        } else {
            const saved = await Result.create({
                userID,
                quizID,
                explanationID,
                topic,
                difficulty,
                score,
                totalQuestions: total,
                attempts,
                createdAt: new Date(),
            });
      
            return res.status(200).json({ message: "Results saved", quiz: saved, attempt: savedAttempt });
        }

    } catch (error) {
      console.error("🔥 Error saving results:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/quiz/:userID', async (req, res) => {
    try {
      const { userID } = req.params;
      const quizzes = await Result.findAll({
        where: { userID },
        order: [['createdAt', 'DESC']]
      });
      res.json(quizzes);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Get Attempts by userID and quizID
router.get('/attempts/:userID/:quizID', async (req, res) => {
  try {
    const { userID, quizID } = req.params; 
    const attempts = await Attempts.findAll({
      where: { userID, quizID },
    });
    res.json(attempts);
  } catch (err) {
    console.error("Error fetching attempts:", err);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// Get all attempts of a user
router.get('/attempts/:userID/', async (req, res) => {
  try {
    const { userID } = req.params; 
    const attempts = await Attempts.findAll({
      where: { userID },
    });
    res.json(attempts);
  } catch (err) {
    console.error("Error fetching attempts:", err);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});
  

export default router;