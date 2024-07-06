const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../Config/DatabaseConfig.js');

class User extends Model{}
User.init({
    UserID: {
        type: DataTypes.UUID,
        defaultValue: () => UUIDV4(),
        primaryKey: true
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User'
})

module.exports = User;