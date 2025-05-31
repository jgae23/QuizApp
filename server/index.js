// server/index.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import https from 'https';
import fs from 'fs';
import axios from 'axios';
import { syncModels } from "./models/index.js";
import { generateQuiz } from './routes/aiQuiz.js';
import express from 'express';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js'; 
import resultRoutes from './routes/savedResult.js';
import quizRoutes from './routes/quiz.js';
import explanationRoutes from './routes/savedExplanation.js';
import deleteRoutes from './routes/deleteResult.js';
import triviaRoutes from './routes/trivia.js';

// Configure environment variables first
dotenv.config();

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the port from .env or fallback to 3000 
const PORT = process.env.PORT || 3001;

// Set up Express
const app = express();

// Improve CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Increase the limit for JSON parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// RapidAPI configuration
const rapidApiOptions = {
  method: 'GET',
  hostname: 'quizmania-api.p.rapidapi.com',
  port: null,
  path: '/trivia',
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'quizmania-api.p.rapidapi.com'
  }
};

// Sync database models
syncModels();

// Set up auth routes
app.use('/api/auth', authRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/quiz', quizRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/delete", deleteRoutes);
app.use('/api/explanations', explanationRoutes);
app.use('/api/trivia-quiz', triviaRoutes); // Use the trivia routes module
app.post('/api/ai-quiz/generate', generateQuiz);

// Keep the existing RapidAPI trivia route for backwards compatibility
app.get("/api/trivia-old", (req, res) => {
  const category = req.query.category || '';
  const difficulty = req.query.difficulty || '';
  const amount = req.query.amount || '10';
  
  const customPath = `/trivia?category=${category}&difficulty=${difficulty}&amount=${amount}`;
  
  const options = {...rapidApiOptions, path: customPath};
  
  const request = https.request(options, (response) => {
    const chunks = [];

    response.on('data', (chunk) => {
      chunks.push(chunk);
    });

    response.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const triviaData = JSON.parse(body.toString());
        res.json(triviaData);
      } catch (error) {
        console.error('Error parsing custom trivia API response:', error);
        res.status(500).json({ error: 'Failed to fetch custom trivia questions' });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Error fetching from custom trivia API:', error);
    res.status(500).json({ error: 'Failed to connect to custom trivia API' });
  });

  request.end();
});
console.log("I am here");
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // In development, add a simple route for testing
  app.get('/login', (req, res) => {
    res.send('Login page placeholder - in development this would be handled by React dev server');
  });
  
  app.get('/', (req, res) => {
    res.send('API server is running. Frontend is available at https://localhost:3000');
  });
}

// Load HTTPS certs
const key = fs.readFileSync('./localhost-key.pem');
const cert = fs.readFileSync('./localhost.pem');

// Use HTTPS server
https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`Secure server listening on https://localhost:${PORT}`);
});