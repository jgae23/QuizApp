// routes/deleteResult.js
import express from "express";
import Attempts from "../models/attempts.js"; 
import Result from "../models/savedResult.js"; 
import Explanations from "../models/savedExplanation.js";

const router = express.Router();

router.delete("/:attemptID", async (req, res) => {
  const { attemptID } = req.params;

  try {
    const deleted = await Attempts.destroy({
      where: { attemptID },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    res.status(200).json({ message: "Attempt deleted successfully." });
  } catch (err) {
    console.error("Error deleting attempt:", err);
    res.status(500).json({ message: "Server error." });
  }
});

router.delete("/:userID/:quizID/:explanationID", async (req, res) => {
    const { userID, quizID, explanationID } = req.params;
  
    try {
    
      // Delete quiz result  
      const deleted = await Result.destroy({
        where: { userID, explanationID },
      });
  
      if (deleted === 0) {
        return res.status(404).json({ message: "quiz result not found." });
      }
      // Delete quiz attempt
      await Attempts.destroy({ where: { userID, quizID } });

      // Delete quiz explanation
      await Explanations.destroy({ where: { userID, quizID }});

  
      res.status(200).json({ message: "Results deleted successfully." });
    } catch (err) {
      console.error("Error deleting attempt:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

export default router;
