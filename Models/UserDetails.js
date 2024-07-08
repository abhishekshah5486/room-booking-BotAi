const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');
const ConversationSession = require('./ConversationSession.js');

// class UserDetails extends Model{}
// UserDetails.init({
//     id: {
//         type: DataTypes.UUID,
//         primaryKey: true,
//         defaultValue: DataTypes.UUIDV4,
//     },
//     sessionId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//             model: 'ConversationSession',
//             key: 'sessionId'
//         }
//     },
//     fullName: {
//         type: DataTypes.STRING,
//         allowNull: true
//     },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: true
//     }
// }, {
//     sequelize,
//     modelName: 'UserDetails',
//     timestamps: true,
// })
// UserDetails.belongsTo(ConversationSession, { foreignKey: 'sessionId' });
// module.exports = UserDetails;

class UserDetails extends Model{}
UserDetails.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'UserDetails',
    timestamps: true,
})

module.exports = UserDetails;