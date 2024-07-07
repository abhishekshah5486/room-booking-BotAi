const openai = require('../Utils/openAI.js');
const axios = require('axios');
const models = require('../Models/Index.js');
const { use } = require('../Routes/Chat23.js');

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

    let user = await User.findOne({ where: { UserId: userId } });
    if (!user) {
        user = await User.create({ UserId: userId, Name: "", Email: "" });
    }
    // Fetching the past conversation history of a user
    const fetchUserConversationHistory = () => {
        try {
            const userChatHistory = models.ConversationHistory.findAll({where : {UserId : userId}});
            return userChatHistory;
        } catch (err) {
            console.error('Error fetching conversation history:', err);
            return [];
        }
    }
    const chatHistory = await fetchUserConversationHistory();
    // CreatingChatCompletion
    const openAIResponse = await openai.chat.completions.create({
        model: 'gpt-4o-2024-05-13',
        messages: chatHistory.map( (chat) => {
            return {role: 'user', content: chat.message}
        }).concat({role: 'user', content: message}),
    })
    const botResponse = openAIResponse.data.choices[0].message.content;
    await ConverationHistory.create({
        UserId: userId,
        Message: message,
        Response: botResponse
    });

    if (message.toLowerCase().includes('book') || 
        message.toLowerCase().includes('reserve') ||
        message.toLowerCase().includes('accomodation') ||
        message.toLowerCase().includes('stay')){
            const roomOptions = await fetchRoomOptions();
            return res.status(200).json({message: "Sure! Here are the available room options:"}, roomOptions);
        }
    else res.json(botResponse);
}


module.exports = {
    BotUserChat,
};
