const express = require('express');
const { BotUserChat } =  require('../Controllers/ChatController.js');

const router = express.Router();

router.post('/chat', BotUserChat);

module.exports = router;
