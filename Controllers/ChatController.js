const openai = require('../Utils/openAI.js');
const axios = require('axios');
const models = require('../Models/Index.js');
const { create } = require('../Models/UserDetails.js');
const { use } = require('../Routes/Chat.js');
const { response } = require('express');
const validator = require('validator');

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
    let prompt = `You are ChatBot9. A helpful ChatBot AI assistant assisting ${userName} with resort room bookings at Bot9 Palace.\n`;

    const chatInteractions = await fetchSessionWithInteractions(conversationSession.sessionId);
    chatInteractions.forEach(conv => {
        prompt += `User: ${conv.message}\n`;
        prompt += `Bot: ${conv.response}\n`;
    });
    prompt += `User: ${userMessage}\nBot:`;

    return prompt;
};

async function fetchSessionWithInteractions(sessionId){
    const chatInteractions = await models.ChatInteraction.findAll({where: {sessionId: sessionId}});
    return chatInteractions;
}

// General chat completion function
async function generalizedChatCompletion(modelName, message){
    const response  =  await openai.chat.completions.create({
        model: modelName,
        messages: [
            {
                role: 'user',
                content: message
            }
        ]
    })
    return response;
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

        if (currentState === 'start'){
            const prompt = `You are ChatBot9, a helpful AI assistant assisting a user with resort room   bookings at Bot9 Palace.
                            Analyze the following message to determine the user's intent:
                            "${message}"
                            If the user initiates the conversation with a greeting (e.g., says "hi", "hello") or some kind of query , respond politely and ask for their name to proceed ahead.
                            If the user inputs a conversation-ending message (e.g., says "goodbye", "bye", or uses inappropriate language), respond accordingly or terminate the conversation/chat if necessary.
                            If the user inputs any confusing message or vague message,provide a polite and unique response for clarification (e.g., "I'm sorry, I didn't quite understand that. Could you please clarify?").
                            If the user seems to spam with irrelevant messages repeatedly, prompt them to stay on topic and inform them that the chat will be terminated if the irrelevant messages continue
                            Complete the conversation:
                            User: "${message}"\n
                            Bot: `
            const conversationStartResponse = await generalizedChatCompletion('gpt-3.5-turbo', prompt);
            botResponse = conversationStartResponse.choices[0].message.content;
            if (botResponse.toLowerCase().includes('name')){
                newState = 'awaiting_user_name';
            }
        }
        else if (currentState === 'awaiting_user_name') {
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
            const validateUserEmail = validator.isEmail(userInputEmail);
            if (validateUserEmail){
                await models.UserDetails.update(
                    {email: userInputEmail},
                    {where: {sessionId: sessionId}}
                );
                botResponse = 'Thank you! How can I assist you today?';
                newState = 'initial';
            }
            else {
                const responses = [
                    "It seems the email ID you entered is incomplete. Could you please provide a valid email?",
                    "I'm sorry, but the email ID you provided appears to be incomplete. Please enter a valid email address.",
                    "The email you entered doesn't seem complete. Please provide a valid email address.",
                    "It looks like the email address is missing some information. Please enter a complete email ID.",
                    "Could you please enter a complete email address? The one you provided seems incomplete.",
                    "I didn't catch that email address correctly. Please enter a complete and valid email ID.",
                    "I'm sorry, I need a valid email address to proceed. Please enter one that is complete.",
                    "The email you entered is not complete. Please provide a valid and complete email ID."
                ];
                
                // Select a random response
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                botResponse = randomResponse;
                
                newState = 'awaiting_user_email';
            }
        }
        else if (currentState === 'initial'){
            const bookingIntentPrompt = `User: "${message}".\nAnalyze if the user intends to book a room. Respond with "Yes" if the user indicates a desire to book a room, otherwise respond with "No."`;

            // Checking booking intent using openai api
            const validateRoomBookingIntent = await generalizedChatCompletion('gpt-3.5-turbo', bookingIntentPrompt);
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
                const openAIResponse = await generalizedChatCompletion('gpt-3.5-turbo', prompt);
                botResponse = openAIResponse.choices[0].message.content;
                newState = 'initial';
            }
        }
        else if (currentState === 'awaiting_room_selection'){
            const roomOptions = await fetchRoomOptions();

            const selectedRoom = roomOptions.data.find((room) => room.id.toString() === message.trim());
            if (selectedRoom){
                botResponse = `You have selected room ${selectedRoom.id}.\n
                The price is ${selectedRoom.price} per night.\nFor how many nights do you wish to stay?.`;
                newState = 'awaiting_nights_selection';
                selectedRoomId = selectedRoom.id;

                const userDetails = await models.UserDetails.findOne({where: {sessionId: conversationSession.sessionId}});
                // Store pre-booking details in Booking model
                await models.Booking.create({
                    sessionId: sessionId,
                    roomId: selectedRoomId,
                    fullName: userDetails.fullName,
                    email: userDetails.email,
                    status: 'awaiting'
                });

            } else {
                botResponse = `Invalid room number. Please choose a valid room number from the list:\n${roomOptions.data.map(room => room.number).join(', ')}.`;
                newState = 'awaiting_room_selection';
            }
        }
        else if (currentState === 'awaiting_nights_selection'){

            const prompt = `Analyse the number of nights the user wants to stay based on their input.
                            Complete the conversation below:
                            (Please ensure that the BotResponse strictly evaluates to a number and not text.)
                            Bot: "How many nights would you like to stay or book a room for?"
                            User: "${message}"
                            BotResponse: 
                            `
            const stayNightsIntentPromptResponse = await generalizedChatCompletion('gpt-3.5-turbo', prompt);
            const stayNightsIntentPromptResponseContent  = stayNightsIntentPromptResponse.choices[0].message.content;
            console.log(stayNightsIntentPromptResponseContent);
            // Regular expression to match numbers
            let numberRegex = /\d+/;

            // Extract the number from the text
            let matches = stayNightsIntentPromptResponseContent.match(numberRegex);
            if (matches){
                const numberOfNights = parseInt(matches[0], 10);
                const bookingDetails = await models.Booking.findOne({
                    where: { sessionId: conversationSession.sessionId },
                    order: [['createdAt', 'DESC']]
                });
                await models.Booking.update({nights: numberOfNights}, {where: {bookingId: bookingDetails.bookingId}});
                botResponse = `Awesome! I've updated your booking to ${numberOfNights} nights.\nWould you like to confirm this booking?`;
                newState =  'awaiting_confirmation';
            }else {
                const responses = [
                    "Could you please clarify how many nights you'd like to stay?",
                    "I'm sorry, I didn't catch the number of nights. Could you repeat that?",
                    "It seems I didn't quite get the number of nights. Can you confirm?",
                    "I'm not sure I understood the number of nights correctly. Could you specify?",
                    "I didn't catch the exact number of nights. Could you clarify?",
                    "It seems there was an issue understanding the number of nights. Can you tell me again?",
                    "I didn't quite get that. How many nights were you thinking of staying?",
                    "I'm sorry, I need to confirm the number of nights. Can you please specify?",
                    "Could you clarify the number of nights for your booking?"
                ];
                
                // Select a random response
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                botResponse = randomResponse;    
            }

        }
        else if (currentState === 'awaiting_confirmation'){
            const confirmationIntentPrompt = `Bot: Do you confirm your booking?
                                              User: "${message}"
                                              Analyze if the user's response indicates a desire to confirm the room booking. Respond with "Yes" if the user intends to confirm the room booking, otherwise respond with "No."`;
            const confirmationIntentPromptResponse = await generalizedChatCompletion('gpt-3.5-turbo', confirmationIntentPrompt);
            const latestBooking = await models.Booking.findOne({
                where: { sessionId: conversationSession.sessionId },
                order: [['createdAt', 'DESC']]
            });
            if (confirmationIntentPromptResponse.choices[0].message.content.toLowerCase().includes('yes')) {
                // Retrieve latest booking for the user
                if (latestBooking && latestBooking.status === 'awaiting'){
                    // Simulate room booking
                    const bookingResponse = await createRoomBooking(latestBooking.roomId, latestBooking.fullName, latestBooking.email, latestBooking.nights);

                    if (bookingResponse){
                        await models.Booking.update({ status: 'confirmed' }, {
                            where: { bookingId: latestBooking.bookingId }
                        });
        
                        const finalBookingDetails = await models.Booking.findOne({
                            where: { bookingId: latestBooking.bookingId }
                        });
        
                        botResponse = `
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
            else {
                if (latestBooking && latestBooking.status === 'awaiting'){
                    await models.Booking.update({ status: 'cancelled' }, {
                        where: { bookingId: latestBooking.bookingId }
                    });
                    botResponse = "Your booking has been cancelled. If you need any further assistance, feel free to ask.";
                }
                newState = 'initial';
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
