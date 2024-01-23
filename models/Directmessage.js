const Church = require("./Church");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Directmessage = sequelize.define("directmessages", {
     creatorId: {  //Person who started the direct message session
        type: Sequelize.INTEGER,
        references: {
           model: 'members', // 'members' refers to table name
           key: 'id', // 'id' refers to column name in members table
        }
     },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      participantString: {
        type: DataTypes.STRING, // string of all member userNames in the direct message
                                // updated with each 'dm open' otherwise left static
                                // used in drop-down list will be okay to use 99% of time IMO
        allowNull: false
      },
      lastMessageDate: {        // every message post will copy its createdAt date to this field
                                // will be used to sort drop down of direct messages 
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {                 // probably don't need this field but creating it anyway for potential future use
        type: DataTypes.STRING, 
        allowNull: true
      },
    },
    {
        //Other model options go here
        tableName: 'directmessages'
    });
    return Directmessage;
  };
  
