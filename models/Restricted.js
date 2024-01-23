const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Restricted = sequelize.define("restricteds", {
    memberId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'members', // 'members' refers to table name
           key: 'id', // 'id' refers to column name in members table
        }
     },
    moderatormessageId: {  
        // populated when a moderator resolves message(reported comment) by removing member from church
        type: Sequelize.INTEGER, 
        allowNull: true
      },
    email: {
        type: DataTypes.STRING, 
        allowNull: false
      },
    restrictionType: { 
        // for this version only 'church' is used: 'global' is possible for possible future federated version; 
        type: DataTypes.STRING, 
        allowNull: false
      }
    },
    {
     },
    {
        //Other model options go here
        tableName: 'restricteds'
    });
    return Restricted;
  };
  
