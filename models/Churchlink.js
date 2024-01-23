const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Churchlink = sequelize.define("churchlinks", {
      description: {
        type: Sequelize.TEXT
      },
      link: {
        type: Sequelize.TEXT
      },
    },
    {
        //Other model options go here
        tableName: 'churchlinks'
    });

    return Churchlink;
  };
  