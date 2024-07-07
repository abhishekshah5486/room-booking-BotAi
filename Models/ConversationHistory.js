const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

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
  State: {
    type: DataTypes.ENUM,
    values: ['initial', 'awaiting_room_selection', 'awaiting_confirmation'],
    allowNull: false,
    defaultValue: 'initial'
  },
  Timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'ConversationHistory',
});

module.exports = ConversationHistory;


// ConversationId: {
//     type: DataTypes.UUID,
//     defaultValue: () => UUIDV4(),
//     primaryKey: true
//   },
