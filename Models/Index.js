const User = require('./User.js');
const ConversationHistory = require('./ConversationHistory.js');
const Booking = require('./Booking.js');
const sequelize = require('../Config/DatabaseConfig.js');

const models = {
  User,
  ConversationHistory,
  Booking,
  sequelize,
};

module.exports = models;
