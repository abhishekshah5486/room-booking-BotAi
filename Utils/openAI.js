const openai = require('openai');
const dotenv = require('dotenv');

dotenv.config();
const path = require('path');

// Specify the path to your .env file
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Setting up an openai client to interact with the api provided by the openai library
// using authentication api key
const openAIClient = new openai({
    apiKey: process.env.OPENAI_API_KEY
})

module.exports = openAIClient;