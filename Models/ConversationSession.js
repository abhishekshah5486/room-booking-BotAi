const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

class ConversationSession extends Model {}

ConversationSession.init({
    sessionId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },  
    state: {
        type: DataTypes.ENUM,
        values: ['start', 'initial', 'awaiting_room_selection', 'awaiting_confirmation', 'awaiting_user_email', 'awaiting_user_name', 'awaiting_nights_selection'],
        allowNull: false,
        defaultValue: 'start'
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

