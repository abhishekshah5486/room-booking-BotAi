const { Model, DataTypes } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

class Booking extends Model {}

Booking.init({
    bookingId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    conversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ConversationHistories',
            key: 'ConversationId'
        }
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nights: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    }, {
    sequelize,
    modelName: 'Booking',
    timestamps: true,
});

module.exports = Booking;
