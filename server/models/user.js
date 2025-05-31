import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// User Table
const User = sequelize.define('user', {
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password; // Don't expose password
  return values;
};

export default User;
export{ User };
