const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');
const ConversationSession = require('./ConversationSession.js');

// class ChatInteraction extends Model {}

// ChatInteraction.init({
//     interactionId: {
//         type: DataTypes.UUID,
//         defaultValue: Sequelize.UUIDV4,
//         primaryKey: true,
//     },
//     sessionId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//             model: 'ConversationSession',
//             key: 'sessionId',
//         },
//     },
//     message: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//     },
//     response: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//     },
//     timestamp: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
// }, {
//     sequelize,
//     modelName: 'ChatInteractions',
//     timestamps: true,
// })
// ChatInteraction.belongsTo(ConversationSession, { foreignKey: 'sessionId' });
// module.exports = ChatInteraction;

class ChatInteraction extends Model {}

ChatInteraction.init({
    interactionId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'ChatInteractions',
    timestamps: true,
})
module.exports = ChatInteraction;