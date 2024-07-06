const express = require('express');
const app = express();
const sequelize = require('./Config/DatabaseConfig.js');
app.use(express.json());

const chatRoutes = require('./Routes/Chat.js');

// Sync database
sequelize.sync({ force: true }).then(() => {
    console.log('Database Created Successfully.');
  }).catch((err) => {
    console.log('Error creating database:', err);
});

  
app.use('/api', chatRoutes);

const port = 3000;
app.listen(port, () => {
    try {
        console.log(`Server started at port:${port}`);
    } catch (error) {
        console.log("Failed to start server.");
    }  
})