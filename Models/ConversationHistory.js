import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class ConversationHistory extends Model {}

ConversationHistory.init({
  UserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Response: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'ConversationHistory',
});

export default ConversationHistory;
