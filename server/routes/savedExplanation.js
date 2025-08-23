// routes/savedExplanation.js
import express from "express";
import supabase from "../config/supabaseServiceClient.js";

const router = express.Router();

router.post('/save', async (req, res) => {
    try {
      const { userID, quizID, explanationData, topic } = req.body;

      const { data, error } = await supabase
        .from('savedexplanations')
        .insert([
          { 
            profileid: userID, 
            quizid: quizID,
            title: title,
            explanationdata: explanationData
           },
        ])
        .select('explanationid')
        .single();
      
      if(error) return res.status(500).json({ error: error.message });
      
      return res.status(200).json({ 
        message: "Explanations saved", 
        explanationID: data.explanationid
      });
    } catch (err) {
      console.error("Error saving explanations:", err);
      res.status(500).json({ message: "Failed to save explanations" });
    }
});

router.get('/:userID/:explanationID', async (req, res) => {
  const { userID, explanationID } = req.params;

  try {
    let { data, error } = await supabase
      .from('savedexplanations')
      .select('title,explanationdata')
      .eq('profileid', userID)
      .eq('explanationid', explanationID)
      .single();
  

    if(error) return res.status(500).json({ error: error.message });

    res.json({
      title: data.title,
      questions: data.explanationdata,
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
  