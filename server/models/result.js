// models/result.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Question from './question.js';
import User from './user.js';

// Result Table
const Result = sequelize.define('result', {
  resultID: {
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
  questionID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Question,
      key: 'questionID',
    },
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});


export default Result;
export{ Result };