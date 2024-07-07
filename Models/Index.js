const UserDetails = require('./UserDetails.js');
const ConversationSession = require('./ConversationSession.js');
const Booking = require('./Booking.js');
const sequelize = require('../Config/DatabaseConfig.js');
const ChatInteraction = require('./ChatInteraction.js');

const models = {
  UserDetails,
  ConversationSession,
  Booking,
  ChatInteraction,
  sequelize,
};

module.exports = models;
