// routes/savedResult.js
import express from "express";
import supabase from "../config/supabaseServiceClient.js";

const router = express.Router();

router.post('/save-results', async (req, res) => {
    try {

        const { userID, topic, score, total, attempts, difficulty, quizID, explanationID } = req.body;
    
        if (!userID || !topic) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { data: savedAttempt, error } = await supabase
          .from('attempts')
          .insert({
            profileid: userID,
            quizid: quizID,
            explanationid: explanationID,
            title: topic,
            score: score,
            totalquestions: total,
          })
          
        if(error) return res.status(500).json({ error: error.message });
        // Look for an existing result for this quiz and user
        //const existingResult = await Result.findOne({ where: { quizID, userID } });
        const { data: existingResult, findError } = await supabase
          .from('savedresults')
          .select('*')
          .eq('quizid', quizID)
          .eq('profileid', userID)
          .single();

        if(findError) return res.status(500).json({ findError: findError.message });

        if (existingResult) {
            // Update the existing result if new score is greater than old one
            if(score > existingResult.score) {
                const { data, error } = await supabase
                  .from('savedresults')
                  .update({ score: score}, {explanationid: explanationID}, { createdat: new Date() })
                  .eq('rsltid', existingResult.rsltid)

                return res.status(200).json({ message: "Result updated", quiz: existingResult, attempt: savedAttempt });
            } else {
                return res.status(200).json({ message: "Score not improved", quiz: existingResult, attempt: savedAttempt });
            }
        } else { 
            const { data: saved, error } = await supabase
              .from('savedresults')
              .insert([
                { profileid: userID,
                  quizid: quizID,
                  explanationid: explanationID,
                  topic: topic,
                  difficulty: difficulty,
                  score: score,
                  totalquestions: total,
                  totalattempts: attempts,
               },
              ])
              .select('*')
              .single();

            if(error) return res.status(500).json({ error: error.message });
                      
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
      const { data: quizzes, error } = await supabase
        .from('savedresults')
        .select('*')
        .eq('profileid', userID)
        .order('createdat', { ascending: false }); // DESC
      
      if(error) return res.status(500).json({ error: error.message });

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

    const { data: attempts, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('profileid', userID)
      .eq('quizid', quizID)

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

    const { data: attempts, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('profileid', userID)

    res.json(attempts);
  } catch (err) {
    console.error("Error fetching attempts:", err);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});
  

export default router;