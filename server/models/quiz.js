// models/quiz.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Quiz Table
const Quiz = sequelize.define('quiz', {
  quizID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});


export default Quiz;
export{ Quiz };