const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

class ConversationHistory extends Model {}

ConversationHistory.init({
    conversationId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },  
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM,
        values: ['initial', 'awaiting_room_selection', 'awaiting_confirmation', 'awaiting_user_email', 'awaiting_user_name'],
        allowNull: false,
        defaultValue: 'awaiting_user_name'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    }, {
    sequelize,
    modelName: 'ConversationHistory',
    timestamps: true,
});

module.exports = ConversationHistory;


// ConversationId: {
//     type: DataTypes.UUID,
//     defaultValue: () => UUIDV4(),
//     primaryKey: true
//   },
