// routes/savedExplanation.js
import express from "express";
import Explanations from "../models/savedExplanation.js";

const router = express.Router();

router.post('/save', async (req, res) => {
    try {
      const { userID, quizID, explanationData, topic } = req.body;
      
      const explanation = await Explanations.create({
        userID,
        quizID,
        title: topic,
        explanationData
      });
      
      return res.status(200).json({ 
        message: "Explanations saved", 
        explanationID: explanation.explanationID 
      });
    } catch (err) {
      console.error("Error saving explanations:", err);
      res.status(500).json({ message: "Failed to save explanations" });
    }
});

router.get('/:userID/:explanationID', async (req, res) => {
  const { userID, explanationID } = req.params;

  try {
    const explanation = await Explanations.findOne({
      where: { userID, explanationID },
    });

    if (!explanation) return res.status(404).json({ error: "Not found" });

    res.json({
      title: explanation.title,
      questions: explanation.explanationData
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
  