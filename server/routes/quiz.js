import express from 'express';
import supabase from "../config/supabaseServiceClient.js";

const router = express.Router();

// Save quiz
router.post('/create', async (req, res) => {
  
    try{
      const{ title } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { data, error } = await supabase
        .from('quizzes')
        .insert([
          { title: title, },
        ])
        .select('quizid')
        .single();
      
      if(error) return res.status(500).json({ error: error.message });

      console.log("Saving quiz ID:", data.quizid);

      return res.status(200).json({ message: "Quiz saved", quizID: data.quizid });
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
    const { data, error } = await supabase
      .from('questions')
      .insert([
        { 
          quizid: quizID,
          title: title,
          content: questions,
          difficulty: difficulty,
        },
      ])
      .select('id')
      .single();
    
    if(error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ 
      message: "Questions saved successfully", 
      questionID: data.questionid
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

  let { data: questions, error } = await supabase
    .from('questions')
    .select('content')
    .eq('quizid', quizID)
    .single();

    if(error) return res.status(500).json({ error: error.message });
  
    return res.json(questions.content);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



export default router;