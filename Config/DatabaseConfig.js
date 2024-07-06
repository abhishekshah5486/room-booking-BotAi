const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();
// Load environment varibles from .env to .process file

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        dialect: 'sqlite',
        storage: './booking_data.sqlite'
    }
)
module.exports = sequelize;