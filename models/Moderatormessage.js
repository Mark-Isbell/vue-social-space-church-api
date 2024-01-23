const Church = require("./Church");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Moderatormessage = sequelize.define("moderatormessages", {
     type: {
        type: DataTypes.STRING, // streamjoinrequest, commentmoderation
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT, 
        allowNull: true
      },
      moderatorResponse: {
        type: Sequelize.TEXT, 
        allowNull: true
      },
      moderatorAction: {
        type: DataTypes.STRING, // Only used for comment moderation reports
                                // ENUM: "Ignore report" or "Delete post and ..."
        allowNull: true
      },
      moderatorRestriction: {
        type: DataTypes.STRING, // Only used for comment moderation reports
                                // ENUM: "No Restriction on Member","Restrict Member From Posting In Stream", "Restrict Member From Posting In All Their Streams", "Remove Memeber From Church"
        allowNull: true
      },
      status: {
        type: DataTypes.STRING, // completed, pending, approved, denied
                                // streamjoinrequest: pending -> approved or denied
                                // commentmoderation: pending -> completed
        allowNull: false
      },
      keyfieldmemberId: {
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      keyfieldstreamId: {
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      keyfieldstreammemberId: {
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      keyfieldstreamcommentId: {
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      keyfieldimageId: {
        type: Sequelize.INTEGER, 
        allowNull: true
      },
    },
    {
        //Other model options go here
        tableName: 'moderatormessages'
    });
    return Moderatormessage;
  };
  
