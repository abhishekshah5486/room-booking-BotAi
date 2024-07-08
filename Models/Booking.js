const { Model, DataTypes } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');
const ConversationSession = require('./ConversationSession.js');

class Booking extends Model {}

// Booking.init({
//     bookingId: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         allowNull: false,
//         primaryKey: true,
//     },
//     sessionId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//             model: 'ConversationSession',
//             key: 'sessionId'
//         }
//     },
//     roomId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//     },
//     fullName: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     nights: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//     },
//     status: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     date: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
//     }, {
//     sequelize,
//     modelName: 'Bookings',
//     timestamps: true,
// });
// Booking.belongsTo(ConversationSession, { foreignKey: 'sessionId' });
// module.exports = Booking;


Booking.init({
    bookingId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false
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
    modelName: 'Bookings',
    timestamps: true,
});
module.exports = Booking;