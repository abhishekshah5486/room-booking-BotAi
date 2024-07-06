import User from './User.js';
import ConversationHistory from './ConversationHistory.js';
import Booking from './Booking.js';
import sequelize from '../Config/database.js';

const models = {
  User,
  ConversationHistory,
  Booking,
  sequelize,
};

export default models;
