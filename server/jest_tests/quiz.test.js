import request from 'supertest';
import express from 'express';
import quizRouter from '../routes/quiz.js'; 
import { sequelize } from '../models'; 

const app = express();
app.use(express.json());
app.use('/quiz', quizRouter);

beforeAll(async () => {
  await sequelize.sync({ force: true }); 
});

describe('POST /quiz/create', () => {
  it('should create a quiz when a title is provided', async () => {
    const response = await request(app)
      .post('/quiz/create')
      .send({ title: 'Math Quiz' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Quiz saved');
    expect(response.body.quizID).toBeDefined();
  });

  it('should return an error if title is missing', async () => {
    const response = await request(app)
      .post('/quiz/create')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields');
  });
});
