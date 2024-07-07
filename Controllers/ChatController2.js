const openai = require('../Utils/openAI.js');
const axios = require('axios');
const models = require('../Models/Index.js');
const { create } = require('../Models/UserDetails.js');

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
const generatePrompt = (userMessage, conversationHistory) => {
    let prompt = "You are a helpful ChatBot AI assistant assisting with resort room bookings at Bot9 Palace.\n";
    conversationHistory.forEach(conv => {
        prompt += `User: ${conv.message}\n`;
        prompt += `Bot: ${conv.botMessage}\n`;
    });
    prompt += `User: ${userMessage}\nBot:`;

    return prompt;
};
const processUserMessage = async (req, res) => {
    const conversationId = req.body.conversationId;
    const message = req.body.message;

    try {
        const fetchUserConversationHistory = await models.ConversationHistory.findOne({where : {conversationId: conversationId}});
        const currentState  = fetchUserConversationHistory.state;

        let botResponse;
        let newState;
        let selectedRoomId; 

        if (currentState === 'awaiting_user_name') {
            if (message.trim().length === 0){
                botResponse = 'Please provide a valid name to proceed.'
            } else {
                const name = message.trim();
                await models.UserDetails.create({
                    conversationId: conversationId,
                    fullName: name
                })
                botResponse = `Thank you, ${name}. Could you please provide your email ID so I can assist you better?`;
                newState = 'awaiting_user_email';
            }
        }
        else if (currentState === 'awaiting_user_email'){
            const userInputEmail = message.trim();
            const validateUserEmail = await openai.chat.completions.create({
                model: 'gpt-4o-2024-05-13',
                message: [ 
                    {
                        role: 'user',
                        content: `Validate whether the email address ${userInputEmail} is valid or not. Respond with 'Yes' if it is valid, and 'No' if it is not.`
                    }
                ]
            }); 
            // Valid Email Address
            if (validateUserEmail.choices[0].message.content.toLowerCase().includes("yes")){
                await models.UserDetails.update(
                    {email: userInputEmail},
                    {where: {conversationId: conversationId}}
                );
                botResponse = 'Thank you! How can I assist you today?';
                newState = 'initial';
            } else {
                botResponse = 'It looks like the email ID you provided is incomplete. Could you please provide a valid email ID?';
                newState = 'awaiting_user_email';
            }
        }
        else if (currentState === 'initial'){
            if (message.toLowerCase().includes('book') ||
                message.toLowerCase().includes('room')){
                // Fetch room options from external API
                const roomOptions = await fetchRoomOptions();
                botResponse = `Sure. Here are the available rooms:\n${roomOptions.data.map(room => `Room ${room.id}: ${room.name}\n${room.description}\n`).join('\n')}\nPlease choose a room number.`;
                newState = 'awaiting_room_selection';
            } else {
                const prompt = generatePrompt(message, fetchUserConversationHistory);
                const openAIResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-2024-05-13',
                    message: [ 
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                });
                botResponse = openAIResponse.choices[0].message.content;
                newState = 'initial';
            }
        }
        else if (currentState === 'awaiting_room_selection'){
            const roomOptions = await fetchRoomOptions();
            const selectedRoom = roomOptions.data.find((room) => room.id.toString() === message.trim());
            if (selectedRoom){
                botResponse = `You have selected room ${selectedRoom.id}.\n
                The price is ${selectedRoom.price} per night.\nPlease confirm your booking by typing 'confirm' or by typing 'cancel'.`;
                newState = 'awaiting_confirmation';
                selectedRoomId = selectedRoom.id;

                // Store pre-booking details in Booking model
                await models.Booking.create({
                    bookingId: Math.floor(Math.random() * 10000),
                    userId,
                    roomId: selectedRoomId,
                    nights: 1,
                    status: 'awaiting'
                });

            } else {
                botResponse = `Invalid room number. Please choose a valid room number from the list:\n${roomOptions.data.map(room => room.number).join(', ')}.`;
                newState = 'awaiting_room_selection';
            }
        }
        else if (currentState === 'awaiting_confirmation'){
            if (message.toLowerCase().trim() === 'confirm') {
                // Retrieve latest booking for the user
                const latestBooking = await models.Booking.findOne({
                    where: { userId },
                    order: [['createdAt', 'DESC']]
                });
                if (latestBooking && latestBooking.status === 'awaiting'){
                    const bookingResponse = createRoomBooking(latestBooking.roomId, 'John Doe', 'johndoe@example.com', latestBooking.nights);

                    if (bookingResponse){
                        await models.Booking.update({ status: 'confirmed' }, {
                            where: { bookingId: latestBooking.bookingId }
                        });
                        botResponse = `Your booking is confirmed! Your booking ID is ${bookingResponse.bookingId}. Thank you! If you need any further assistance, feel free to ask.`;
                    }
                    else  botResponse = `There was an error processing your booking. Please try again later or contact support.`;
                }
                newState = 'initial';
            }
            else if (message.toLowerCase().trim() === 'cancel'){
                const latestBooking = await models.Booking.findOne({
                    where: { userId },
                    order: [['createdAt', 'DESC']]
                });
                if (latestBooking && latestBooking.status === 'awaiting'){
                    await models.Booking.update({ status: 'cancelled' }, {
                        where: { bookingId: latestBooking.bookingId }
                    });
                    botResponse = "Your booking has been cancelled. If you need any further assistance, feel free to ask.";
                }
                newState = 'initial';
            }else {
                botResponse = "Please type 'confirm' to proceed with the booking or 'cancel' to cancel the booking.";
                newState = 'awaiting_confirmation';
            }
        }
        await models.ConversationHistory.create({ UserId: userId, Message: message, Response: botResponse, State: newState });
        res.json({message: botResponse});

    } catch (err) {
        res.status(500).json({error: 'Internal Server Error.'});
    }
}
module.exports = {
    processUserMessage,
};
