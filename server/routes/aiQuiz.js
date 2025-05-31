// server/api/aiQuiz.js
import axios from 'axios';

export const generateQuiz = async (req, res) => {
  try {
    const { topic, numberOfQuestions = 5, difficulty = 'medium' } = req.body;
    
    // Call to Anthropic Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Generate ${numberOfQuestions} multiple-choice quiz questions about ${topic} at ${difficulty} difficulty level. 
                     Return ONLY a JSON array with this structure, with no explanatory text before or after:
                     [
                       {
                         "question": "Question text here",
                         "options": ["Option A", "Option B", "Option C", "Option D"],
                         "correctAnswer": "Option A",
                         "explanation": "Brief explanation of the answer"
                       }
                     ]`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    // Get the response content
    const content = response.data.content[0].text;
    
    // Log the raw response for debugging
    console.log("Raw response:", content.substring(0, 100) + "...");
    
    // Extract JSON from the response text
    // Look for text between square brackets
    let jsonContent = content;
    
    // If the content doesn't start with [, try to extract the JSON part
    if (!content.trim().startsWith('[')) {
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = content.substring(jsonStart, jsonEnd);
      }
    }
    
    // Parse the extracted JSON
    const questions = JSON.parse(jsonContent);
    
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating questions:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error details:', error);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate questions',
      details: error.message
    });
  }
};