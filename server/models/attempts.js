// models/attempts.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Explanation from './savedExplanation.js';
import Quiz from './quiz.js';
import User from './user.js';

// Attempts Table
const Attempts = sequelize.define('attempts', {
  attemptID: {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
  },
  createdAt: {
    type: DataTypes.DATE, defaultValue: DataTypes.NOW,
  }
});


export default Attempts;
export{ Attempts };