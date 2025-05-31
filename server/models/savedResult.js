// modesls/savesResult.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Explanation from './savedExplanation.js';
import User from './user.js';
import Quiz from './quiz.js';

// savedResult Table
const savedResult = sequelize.define('savedresult', {
  rsltID: {
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
  explanationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Explanation,
      key: 'explanationID',
    },
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.TEXT,
  },
  score: {
    type: DataTypes.INTEGER,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
  },
  attempts: {
    type: DataTypes.INTEGER,
  },
  createdAt: {
    type: DataTypes.DATE, defaultValue: DataTypes.NOW,
  }
});


export default savedResult;
export{ savedResult };