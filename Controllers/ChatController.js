import openai from '../Utils/openAI.js';
import axios from 'axios';
import models from '../Models/Index.js';
import { open } from 'sqlite';

const { ConverationHistory, User, Booking } = models;
// Function to fetch room options from an external API

const fetchRoomOptions = async () => {
    try {   
        const response = await axios.get('https://bot9assignement.deno.dev/rooms');
        return response;
        
    } catch (err) {
        console.error('Error fetching room options:', err);
        return null;
    }
}

// Function to simulate a room booking using the external API
const createRoomBooking = async (roomId, fullName, email, nights) => {
    try {
        const response = await axios.post('https://bot9assignement.deno.dev/book', {
            roomId,
            fullName,
            email,
            nights
        });
        return response;
    } catch (err) {
        console.error('Error creating room booking:', err);
        return null;
    }
}

// Handle ChatBot Interactions
const BotUserChat = async (req, res) => {
    const userId = req.body.UserId;
    const message = req.body.message;

    // Fetching the past conversation history of a user
    const fetchUserConversationHistory = () => {
        try {
            const userChatHistory = models.ConversationHistory.findAll({where : {UserId : userId}});
            return userChatHistory;
        } catch (err) {
            console.error('Error fetching conversation history:', err);
            throw err;
        }
    }
    const chatHistory = await fetchUserConversationHistory();
    // CreatingChatCompletion
    const openAIResponse = openai.chat.completions.create({
        model: 'gpt-4o-2024-05-13',
        messages: chatHistory.map( (chat) => {
            return {role: 'user', content: chat.message}
        }).concat({role: 'user', content: message}),
    })
    const botResponse = openaiResponse.data.choices[0].message.content;
    await ConverationHistory.create({
        UserId: userId,
        Message: message,
        Response: botResponse
    });

    if (message.toLowerCase().includes('book') || 
        message.toLowerCase().includes('reserve') ||
        message.toLowerCase().includes('accomodation')){}

    const query = `UserInput: ${message}\n
        Query: Does the user wish or intent to buy or reserve a room? Is the user looking for accomodation?\n
        Respond with only 'Yes' or 'No'.
     `

}
