const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define("members", {
    // Model attributes are defined here
      userName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      }, 
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      emailConfirmationToken: {
        type: DataTypes.STRING(1234),
        allowNull: true
      },
      passwordResetToken: {
        type: DataTypes.STRING(1234),
        allowNull: true
      },
      passwordResetExpire: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isEmailConfirmed: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "no"
      },
      role: {
        type: DataTypes.STRING,  // "unverfied", "verified", "member", "moderator"
        allowNull: false,
        defaultValue: "unverified"
      },
      currentStreamId: {
        // purpose of this is to remember what the member is currently viewing
        type: Sequelize.INTEGER,
        references: {
           model: 'streams', // 'streams' refers to table name
           key: 'id', // 'id' refers to column name in streams table
        }
      },
      currentDirectMessageId: {
        // purpose of this is to remember which direct message session is most recently used
        type: Sequelize.INTEGER,
        references: {
           model: 'directmessages', // 'directmessages' refers to table name
           key: 'id', // 'id' refers to column name in directmessages table
        }
      },
      profilePic:{
        type: Sequelize.TEXT, // Base64 string here 
        allowNull: true
      },
      introduction: {
        type: Sequelize.STRING
      }
      }, 
      {
          tableName: 'members',
      });
    return Member;
  };
  

    

