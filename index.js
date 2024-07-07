const express = require('express');
const app = express();
const sequelize = require('./Config/DatabaseConfig.js');
app.use(express.json());

const chatRoute1 = require('./Routes/Chat.js');
const chatRoute2 = require('./Routes/Chat2.js');

// Sync database
sequelize.sync({ force: true }).then(() => {
    console.log('Database Created Successfully.');
  }).catch((err) => {
    console.log('Error creating database:', err);
});

  
app.use('/api', chatRoute1);
app.use('/api', chatRoute2);

const port = 3000;
app.listen(port, () => {
    try {
        console.log(`Server started at port:${port}`);
    } catch (error) {
        console.log("Failed to start server.");
    }  
})