import {jest} from '@jest/globals';
import request from 'supertest';
import express from 'express';
import router from '../routes/trivia.js';
import axios from 'axios';

// create mock
jest.mock('axios');

// create app
const app = express();
app.use(express.json());
app.use('/', router);

axios.get = jest.fn(); // TODO: figure out how mock properly works

describe('POST /generate', () => {
  it('should return trivia data if successful', async () => {
    const mockTriviaData = { results: [{ question: 'Example question?' }] };
    axios.get.mockResolvedValue({ data: mockTriviaData });

    const res = await request(app)
      .post('/generate')
      .send({ category: 'general', numberOfQuestions: 1, difficulty: 'easy' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTriviaData);
  });

  it('should return 500 if there is an error', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    const res = await request(app)
      .post('/generate')
      .send({ category: 'general', numberOfQuestions: 1, difficulty: 'easy' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to save trivia quiz');
  });
});
