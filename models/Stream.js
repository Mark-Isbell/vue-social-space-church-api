const Church = require("./Church");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Stream = sequelize.define("streams", {
    // Model attributes are defined here
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING, // active, inactive
        allowNull: false
      },
      type: {
        type: DataTypes.STRING, // church, normal, singles, custom --church only created via church creation
        allowNull: false
      },
      description: {
        type: DataTypes.STRING, 
        allowNull: true
      },
    },
    {
     },
    {
        //Other model options go here
        tableName: 'streams'
    });
    return Stream;
  };
  
