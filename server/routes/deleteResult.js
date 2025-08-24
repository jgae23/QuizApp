// routes/deleteResult.js
import express from "express";
import supabase from "../config/supabaseServiceClient.js";

const router = express.Router();

router.delete("/:attemptID/:explanationID/:quizID", async (req, res) => {
  const { attemptID, explanationID, quizID } = req.params;

  try {
    const { data: deleted, error } = await supabase
      .from('attempts')
      .delete()
      .eq('attemptid', attemptID)

    if(error) return res.status(500).json({ error: error.message });

    const { data, findError } = await supabase
      .from('savedresults')
      .delete()
      .eq('explanationid', explanationID)
      .eq('quizid', quizID)

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
      const { data: deleted, error } = await supabase
        .from('savedresults')
        .delete()
        .eq('profileid', userID)
        .eq('explanationid', explanationID)
  
      if(error) return res.status(500).json({ error: error.message });

      // Delete quiz attempt
      const { data, findError } = await supabase
        .from('attempts')
        .delete()
        .eq('profileid', userID)
        .eq('quizid', quizID)

      // Delete quiz explanation
      const { data: expla_deleted, finderror } = await supabase
        .from('savedexplanations')
        .delete()
        .eq('profileid', userID)
        .eq('quizid', quizID)
  
      res.status(200).json({ message: "Results deleted successfully." });
    } catch (err) {
      console.error("Error deleting attempt:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

export default router;
