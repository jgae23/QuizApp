import supabase from "../config/supabaseServiceClient.js";
import express from "express";

const router = express.Router();

// Purpose: to easily request stats for the user porfile.
router.get('/api/user/:userID/stats', async (req, res) => {
    const{userID} = req.params; // retrieves user id
    try{
      const { data: attempts, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('profileid', userID)

      if(error) { console.error(error) }
      else { console.log("Attempts:", attempts); }

      const quizzesCompleted = attempts?.length || 0; // count
      const totalScore = (attempts || []).reduce((sum, attempt) => sum + attempt.score, 0); // the reduce function helps find the sum of the attempts.
      const averageScore = quizzesCompleted > 0 ? totalScore / quizzesCompleted : 0; // if the quiz completed is > 0, then return the avg. if == 0, then return 0.
  
      const { count: questionsAnswered, findError } = await supabase
        .from('savedresults')
        .select('*', { count: 'exact', head: true })
        .eq('profileid', userID);

      if(findError) { console.findError(findError) }
      else { console.log("Questions answered:", count); }
  
      res.json({ // response
        quizzesCompleted,
        averageScore: averageScore.toFixed(2),
        questionsAnswered
      });
    }catch(error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

// Takes user infos
router.get('/:userID', async (req, res) => {
  const { userID } = req.params;
  try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userID)
        .single();

      if(error) return res.status(500).json({ error: error.message });

      res.json({
          username: user.username,
          email: user.email,
          joined: user.created_at // or format it if you want
      });
  } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
