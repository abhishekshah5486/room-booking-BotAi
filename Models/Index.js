const User = require('./UserDetails.js');
const ConversationHistory = require('./ConversationSession.js');
const Booking = require('./Booking.js');
const sequelize = require('../Config/DatabaseConfig.js');

const models = {
  User,
  ConversationHistory,
  Booking,
  sequelize,
};

module.exports = models;
