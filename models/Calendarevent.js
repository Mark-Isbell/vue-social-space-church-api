const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Calendarevent = sequelize.define("calendarevents", {
     title: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      beginDateTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endDateTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING
      },
      link: {
        type: DataTypes.STRING
      }
    },
    {
        //Other model options go here
        tableName: 'calendarevents'
    });
    return Calendarevent;
  };
  