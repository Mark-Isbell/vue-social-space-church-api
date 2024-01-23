const Directmessagemember = require("./Directmessagemember");
const Directmessage = require("./Directmessage");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Directmessagecomment = sequelize.define("directmessagecomments", {
    directmessagememberId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'directmessagemembers', // 'directmessagemembers' refers to table name
           key: 'id', // 'id' refers to column name in directmessagemembers table
        }
     },
     directmessageId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'directmessages', // 'directmessages' refers to table name
           key: 'id', // 'id' refers to column name in directmessages table
        }
     },
      comment: {
        type: Sequelize.TEXT, 
        allowNull: true
      },
      status: {
        type: DataTypes.STRING // no use currently but reserving for future
      }
    },
    {
    indexes:[
      {
        unique: false,
        fields:['directmessageId']
      },
      {
         unique: false,
         fields:['directmessagememberId']
       },
       {
          unique: false,
          fields:['createdAt']
        }
     ]
   },
    {
        //Other model options go here
        tableName: 'directmessagecomments'
    });
    return Directmessagecomment;
  };
  
