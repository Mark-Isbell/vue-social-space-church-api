const Member = require("./Member");
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Church = sequelize.define("churches", {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false
      },
      street1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      street2: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false
      },
      zip: {
        type: DataTypes.STRING,
        allowNull: false
      },
      intStateProvinceRegion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      intZipPostal: {
        type: DataTypes.STRING,
        allowNull: false
      },
      invitationCode: {
        type: DataTypes.STRING
      },
      moderationPolicy: {
        type: Sequelize.TEXT, 
        allowNull: true
      },
    },
    {
      indexes:[
        {
          unique: false,
          fields:['name']
        },
        {
          unique: false,
          fields:['country']
        },
        {
          unique: false,
          fields:['state']
        }
       ]
     },
    {
        //Other model options go here
        tableName: 'churches'
    });

    return Church;
  };
  
