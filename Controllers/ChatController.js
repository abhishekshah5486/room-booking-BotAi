const openai = require('../Utils/openAI.js');
const axios = require('axios');
const models = require('../Models/Index.js');
const { create } = require('../Models/UserDetails.js');
const { use } = require('../Routes/Chat.js');
const { response } = require('express');

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
const generatePrompt = async (userMessage, conversationSession) => {
    const userDetails = await models.UserDetails.findOne({where: {sessionId: conversationSession.sessionId}});
    const userName = userDetails ? userDetails.fullName : 'Guest';
    let prompt = `You are a helpful ChatBot AI assistant assisting ${userName} with resort room bookings at Bot9 Palace.\n`;

    const chatInteractions = await fetchSessionWithInteractions(conversationSession.sessionId);
    chatInteractions.forEach(conv => {
        prompt += `User: ${conv.message}\n`;
        prompt += `Bot: ${conv.botMessage}\n`;
    });
    prompt += `User: ${userMessage}\nBot:`;

    return prompt;
};

async function fetchSessionWithInteractions(sessionId){
    const session = await models.ConversationSession.findByPk(sessionId, {
        include: models.ChatInteraction,
        order: [['timestamp', 'ASC']]
    });
    const chatInteractions = session.ChatInteractions;
    return chatInteractions;
}

const processUserMessage = async (req, res) => {
    let sessionId = req.body.sessionId;
    const message = req.body.message;

    try {
        let conversationSession = await models.ConversationSession.findOne({where: {sessionId: sessionId}});
        if (!conversationSession){
            conversationSession = await models.ConversationSession.create({});
            sessionId = conversationSession.sessionId;
        }
        const currentState = conversationSession.state;

        let botResponse;
        let newState;
        let selectedRoomId; 

        if (currentState === 'awaiting_user_name') {
            if (message.trim().length === 0){
                botResponse = 'Please provide a valid name to proceed.'
            } else {
                const name = message.trim();
                await models.UserDetails.create({
                    sessionId: sessionId,
                    fullName: name
                })
                botResponse = `Thank you, ${name}. Could you please provide your email ID so I can assist you better?`;
                newState = 'awaiting_user_email';
            }
        }
        else if (currentState === 'awaiting_user_email'){
            const userInputEmail = message.trim();
            const validateUserEmail = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [ 
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
                    {where: {sessionId: sessionId}}
                );
                botResponse = 'Thank you! How can I assist you today?';
                newState = 'initial';
            } else {
                botResponse = 'It looks like the email ID you provided is incomplete. Could you please provide a valid email ID?';
                newState = 'awaiting_user_email';
            }
        }
        else if (currentState === 'initial'){
            const bookingIntentPrompt = `User: "${message}".\nAnalyze if the user intends to book a room. Respond with "Yes" if the user indicates a desire to book a room, otherwise respond with "No."`;

            // Checking booking intent using openai api
            const validateRoomBookingIntent = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [ 
                    {
                        role: 'user',
                        content: bookingIntentPrompt
                    }
                ]
            });
            // Checking room booking intent using keywords
            function analyzeBookingIntent(input) {
                const keywords = ["book", "reserve", "room", "stay", "want", "need"];
                const normalizedInput = input.toLowerCase();
            
                for (let keyword of keywords) {
                    if (normalizedInput.includes(keyword)) {
                        return true;
                    }
                }
                return false;
            }
            const keywordRoomBookingIntent = analyzeBookingIntent(message);
            const aiRoomBookingIntent = validateRoomBookingIntent.choices[0].message.content.toLowerCase().includes("yes");
            const combinedIntent = (keywordRoomBookingIntent || aiRoomBookingIntent);
            if (combinedIntent){
                // Fetch room options from external API
                const roomOptions = await fetchRoomOptions();
                botResponse = `Sure. Here are the available rooms:\n${roomOptions.data.map(room => `Room ${room.id}: ${room.name}\n${room.description}\n`).join('\n')}\nPlease choose a room number.`;
                newState = 'awaiting_room_selection';
            } else {
                const prompt = await generatePrompt(message, conversationSession);
                const openAIResponse = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [ 
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

                const userDetails = await models.UserDetails.findOne({where: {sessionId: conversationSession.sessionId}});
                // Store pre-booking details in Booking model
                await models.Booking.create({
                    sessionId: sessionId,
                    roomId: selectedRoomId,
                    fullName: userDetails.fullName,
                    email: userDetails.email,
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
                    where: { sessionId: conversationSession.sessionId },
                    order: [['createdAt', 'DESC']]
                });
                if (latestBooking && latestBooking.status === 'awaiting'){
                    // Simulate room booking
                    const bookingResponse = await createRoomBooking(latestBooking.roomId, latestBooking.fullName, latestBooking.email, latestBooking.nights);

                    if (bookingResponse){
                        const finalBookingDetails = await models.Booking.update({ status: 'confirmed' }, {
                            where: { bookingId: latestBooking.bookingId }
                        });
                        const botResponse = `
                            Congratulations ${finalBookingDetails.fullName} 🎉!
                            
                            Your booking is confirmed! Here are your booking details:
                            
                            Booking ID: ${finalBookingDetails.bookingId}
                            Room ID: ${finalBookingDetails.roomId}
                            Number of Nights: ${finalBookingDetails.nights}
                            Status: ${finalBookingDetails.status}
                            Date of Booking: ${new Date(finalBookingDetails.date).toLocaleDateString()}
                            
                            Thank you for booking with us! If you need any further assistance, feel free to ask.
                        `;

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
        await models.ChatInteraction.create({
            sessionId: conversationSession.sessionId,
            message: message,
            response: botResponse,    
        })
        await models.ConversationSession.update(
            {state: newState},
            {where: {sessionId: conversationSession.sessionId}}
        );
        res.json({message: botResponse});

    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal Server Error.'});
    }
}
module.exports = {
    processUserMessage,
};
