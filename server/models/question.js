// models/question.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Quiz from './quiz.js'; 

// Question Table
const Question = sequelize.define('question', {
  questionID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quizID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Quiz,
      key: 'quizID',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  questions: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.TEXT,
  },
});


export default Question;
export{ Question };