const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

class ConversationSession extends Model {}

ConversationSession.init({
    sessionId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
    modelName: 'ConversationSession',
    timestamps: true,
});

module.exports = ConversationSession;


// ConversationId: {
//     type: DataTypes.UUID,
//     defaultValue: () => UUIDV4(),
//     primaryKey: true
//   },
