import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js'; // Import your new connection

class User extends Model {}

User.init(
  {
    // Define the columns (matches your SQL table)
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING, // In MSSQL, this becomes NVARCHAR
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['student', 'teacher']] // Enforce enum validation
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,                 // Pass the connection instance
    modelName: 'User',         // The name of the model
    tableName: 'Users',        // The actual table name in the database
    timestamps: true,          // Enable timestamps (createdAt)
    updatedAt: false           // We don't have an 'updatedAt' column in our SQL
  }
);

export default User;