const express = require('express');
const { processUserMessage } =  require('../Controllers/ChatController2.js');

const router = express.Router();

router.post('/chat', processUserMessage);

module.exports = router;
