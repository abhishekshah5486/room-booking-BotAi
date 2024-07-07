const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

class UserDetails extends Model{}
UserDetails.init({
    ConversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ConversationHistories',
            key: 'ConversationId'
        }
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User',
    timestamps: true,
})

module.exports = UserDetails;