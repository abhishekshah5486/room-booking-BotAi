const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

class UserDetails extends Model{}
UserDetails.init({
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ConversationSession',
            key: 'sessionId'
        }
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
    modelName: 'User',
    timestamps: true,
})

module.exports = UserDetails;