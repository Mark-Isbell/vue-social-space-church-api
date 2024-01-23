const Member = require("./Member");
const Stream = require("./Stream");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Streammember = sequelize.define("streammembers", {
    // Model attributes are defined here
    memberId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'members', // 'members' refers to table name
           key: 'id', // 'id' refers to column name in members table
        }
     },
     streamId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'streams', // 'streams' refers to table name
           key: 'id', // 'id' refers to column name in streams table
        }
     },
    participantType: {
      type: DataTypes.STRING // member, moderator 
    },
    status: {
      type: DataTypes.STRING  // ENUM: memberleftstream, normal, restricted  
                              // "restricted" means they cannot POST in stream but can view
                              // "memberleftstream" means they have left the stream and hence cannot view or post
                              // "normal" means they are members and can post comments in stream
    },
    },
    {
      indexes:[
        {
          unique: false,
          fields:['streamId']
        }
       ]
     },
    {
        //Other model options go here
        tableName: 'streammembers'
    });
    return Streammember;
  };
  
