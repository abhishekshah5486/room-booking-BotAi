const express = require('express');
const { BotUserChat } =  require('../Controllers/ChatController2.js');

const router = express.Router();

router.post('/chat2', BotUserChat);

module.exports = router;
