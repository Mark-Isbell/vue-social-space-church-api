const Member = require("./Member");
const Directmessage = require("./Directmessage");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Directmessagemember = sequelize.define("directmessagemembers", {
    memberId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'members', // 'members' refers to table name
           key: 'id', // 'id' refers to column name in members table
        }
     },
     directmessageId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'directmessages', // 'directmessages' refers to table name
           key: 'id', // 'id' refers to column name in directmessages table
        }
     },
    status: {
      type: DataTypes.STRING // active, inactive
    },
    },
    {
      indexes:[
        {
          unique: false,
          fields:['directmessageId']
        }
       ]
     },
    {
        //Other model options go here
        tableName: 'directmessagemembers'
    });
    return Directmessagemember;
  };
  
