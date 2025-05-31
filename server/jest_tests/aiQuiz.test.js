import { jest } from '@jest/globals';
import { generateQuiz } from '../routes/aiQuiz.js';
import axios from 'axios';
import { createRequest, createResponse } from 'node-mocks-http';

jest.mock('axios');

describe('generateQuiz', () => {
  let req, res;

  beforeEach(() => {
    req = createRequest();
    res = createResponse();
  });

  it('should return a response with quiz data', async () => {
    axios.post.mockResolvedValue({
      data: {
        content: [
          {
            text: '[{"question":"What is 2+2?", "options":["2", "4", "6", "8"], "correctAnswer":"4", "explanation":"Simple math."}]'
          }
        ]
      }
    });

    req.body = { topic: 'math', numberOfQuestions: 1, difficulty: 'easy' };

    await generateQuiz(req, res);

    expect(res.statusCode).toBe(200);
    const responseBody = res._getData();
    expect(responseBody.success).toBe(true);
    expect(responseBody.questions).toBeDefined(); 
    expect(Array.isArray(responseBody.questions)).toBe(true);
    expect(responseBody.questions.length).toBeGreaterThan(0);
  });

  it('should return an error response if axios fails', async () => {
    axios.post.mockRejectedValue(new Error('API request failed'));

    req.body = { topic: 'math', numberOfQuestions: 1, difficulty: 'easy' };

    await generateQuiz(req, res);

    expect(res.statusCode).toBe(500);
    const responseBody = res._getData();
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Failed to generate questions');
  });
});
