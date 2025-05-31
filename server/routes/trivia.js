// triviaRoute.js
import express from 'express';
import axios from 'axios';
import he from 'he';

const router = express.Router();

// Helper to decode HTML entities
const decodeHTML = (html) => he.decode(html);

router.post('/generate', async (req, res) => {
  try {
    console.log("📌 Trivia API called with body:", req.body);
    const { category, numberOfQuestions, difficulty } = req.body;

    let categoryId = '';
    if (category) {
      console.log("📌 Fetching categories...");
      const { data: { trivia_categories } } = await axios.get('https://opentdb.com/api_category.php');
      const matchingCategory = trivia_categories.find(cat =>
        cat.name.toLowerCase().includes(category.toLowerCase())
      );
      if (matchingCategory) {
        categoryId = matchingCategory.id;
        console.log(`📌 Matched category to ID: ${categoryId}`);
      }
    }

    let apiUrl = `https://opentdb.com/api.php?amount=${numberOfQuestions}`;
    if (categoryId) apiUrl += `&category=${categoryId}`;
    if (difficulty) apiUrl += `&difficulty=${difficulty.toLowerCase()}`;

    console.log(`📌 Fetching questions from: ${apiUrl}`);
    
    const { data } = await axios.get(apiUrl);

    if (data.response_code !== 0) {
      console.error("📌 Trivia API error, code:", data.response_code);
      return res.status(400).json({
        success: false,
        error: 'Trivia API did not return questions.',
        code: data.response_code
      });
    }

    // Decode and format the questions
    const questions = data.results.map(q => ({
      question: decodeHTML(q.question),
      correctAnswer: decodeHTML(q.correct_answer),
      incorrectAnswers: q.incorrect_answers.map(decodeHTML),
      options: [...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)].sort(() => Math.random() - 0.5),
      difficulty: q.difficulty,
      category: q.category
    }));

    console.log(`📌 Returning ${questions.length} decoded questions`);
    res.json({ success: true, questions });

  } catch (error) {
    console.error('📌 Error in /generate:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating trivia quiz.',
      details: error.message
    });
  }
});

export default router;
