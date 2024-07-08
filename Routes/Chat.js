const express = require('express');
const { processUserMessage } =  require('../Controllers/ChatController.js');

const router = express.Router();

router.post('/chat', processUserMessage);

module.exports = router;
