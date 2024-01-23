const Streammember = require("./Streammember");
const Stream = require("./Stream");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Streamcomment = sequelize.define("streamcomments", {
    // Model attributes are defined here
    streammemberId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'streammembers', // 'streammembers' refers to table name
           key: 'id', // 'id' refers to column name in streammembers table
        }
     },
     streamId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'streams', // 'streams' refers to table name
           key: 'id', // 'id' refers to column name in streams table
        }
     },
      comment: {
        type: Sequelize.TEXT, 
        allowNull: true
      },
      status: {
        type: DataTypes.STRING // hidden / visible 
      },
      likesNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      praisesNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      likes: {
        // comma separated value of all member ids and usernames that liked
        // e.g. "userId564userNamehockenberry38302,userId8745userNameboris"
        type: Sequelize.TEXT, 
        defaultValue: ""
      },
      praises: {
        // comma separated value of all member ids and usernames that praised
        // e.g. "userId564userNamehockenberry38302,userId8745userNameboris"
        type: Sequelize.TEXT, 
        defaultValue: ""
      }
    },
    {
    indexes:[
      {
        unique: false,
        fields:['streamId']
      },
      {
         unique: false,
         fields:['streammemberId']
       },
       {
          unique: false,
          fields:['createdAt']
        }
     ]
   },
    {
        //Other model options go here
        tableName: 'streamcomments'
    });
    return Streamcomment;
  };
  
