const express = require('express');
const app = express();
const sequelize = require('./Config/DatabaseConfig.js');
const models = require('./Models/Index.js');
app.use(express.json());

// const chatRoute1 = require('./Routes/Chat.js');
const chatRoute = require('./Routes/Chat.js');

async function syncModels() {
    try {
      await models.ConversationSession.sync();
      await models.UserDetails.sync();
      await models.Booking.sync();
      await models.ChatInteraction.sync();
      console.log('Database tables synced successfully.');
    } catch (error) {
      console.error('Error syncing database tables:', error);
    }
}
// Call the syncModels function to ensure proper table order
syncModels();
// Sync database
// sequelize.sync().then(() => {
//     console.log('Database Created Successfully.');
//   }).catch((err) => {
//     console.log('Error creating database:', err);
// });

  
// app.use('/api', chatRoute1);
app.use('/api', chatRoute);

const port = 3000;
app.listen(port, () => {
    try {
        console.log(`Server started at port:${port}`);
    } catch (error) {
        console.log("Failed to start server.");
    }  
})