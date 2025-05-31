// models/index.js
import sequelize from '../config/database.js';
import User from './user.js';
import Quiz from './quiz.js';
import Question from './question.js';
import Result from './result.js';
import Attempts from './attempts.js';

// bc I want a demo user
import bcrypt from 'bcrypt';

const syncModels = async () => {
    try {
      await sequelize.sync({ alter: true }); // Use { force: true } to drop tables or alter for reg.
      console.log('All models were synchronized successfully.');
    } catch (error) {
      console.error('Error synchronizing models:', error);
    }

    // Bulk create
    const users = [];
    for (let i = 1; i <= 10; i++) {
        users.push({
            username: `User ${i}`,
            email: `user${i}@example.com`,
            password: 'password123'
        });
    }

    await User.bulkCreate(users);
    console.log('Users inserted successfully.');

    // I want a DemoUser for final prensentation. Makes it easier to show our work ?? --------------------
    const demoPassword = await bcrypt.hash('password123', 10);
    const demoUser = await User.create({
      username: 'DemoUser',
      email: 'demo@example.com',
      password: demoPassword
    });
    console.log('Demo user created successfully.');

    //-------------------------------------------------------------------------------------------------------


    // Bluck Create Quiz Titles
    const quizzes = await Quiz.bulkCreate([
      {title: 'General Knowledge'},
      {title: 'Science Quiz'},
      {title: 'History'},
      {title: 'Planets'},
      {title: 'Cars'}
    ]);
    console.log('Quizzes inserted successfully.');

    // Map Quiz Title to Quiz
    const quizMap = {};
    quizzes.forEach(q => {
      quizMap[q.title] = q.quizID;
    });

    // Questions!!
    await Question.bulkCreate([
      {
        quizID: quizMap['General Knowledge'],
        title: 'Capital City Question',
        questions: {
          question: 'What is the capital of France?',
          answer: 'Paris',
          options: ["Paris", "London", "Berlin", "Madrid"]
        }
      },
      {
        quizID: quizMap['General Knowledge'],
        title: 'Continent Question',
        questions: {
          question: 'How many continents are there?',
          answer: '7',
          options: ["3", "5", "7", "The USA"]
        }
      },
      {
        quizID: quizMap['Science Quiz'],
        title: 'Planet Question',
        questions: {
          question: 'What planet is known as the Red Planet?',
          answer: 'Mars',
          options: ["Pluto", "Mars", "Jupiter", "Saturn"]
        }
      },
      {
        quizID: quizMap['Science Quiz'],
        title: 'Plant Gas Question',
        questions: {
          question: 'What gas do plants absorb from the atmosphere?',
          answer: 'Carbon Dioxide',
          options: ["Hydrogen", "Carbon Dioxide", "Helium", "Oxygen"]
        }
      }
    ]);
    
    console.log('Questions inserted successfully.');    

  };
  
 export {
    sequelize, User, syncModels, Quiz, Attempts, Result, Question
  };
  