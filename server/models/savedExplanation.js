// models/quizExplanation.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js'; 
import Quiz from './quiz.js';

// savedExplanation Table
const savedExplanations = sequelize.define('savedexplanation', {
  explanationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'userID',
    },
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
  explanationData: {   // Store all questions/answers/explanations as JSON
    type: DataTypes.JSON,
    allowNull: false,
  },
});


export default savedExplanations;
export{ savedExplanations };