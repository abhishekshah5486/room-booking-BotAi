import openai from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Setting up an openai client to interact with the api provided by the openai library
// using authentication api key
const openAIClient = new openai({
    apiKey: process.env.OPENAI_API_KEY
})

export default openAIClient;