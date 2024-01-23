const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Memberfact = sequelize.define("memberfacts", {
      memberId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'members', // 'members' refers to table name
           key: 'id', // 'id' refers to column name in members table
        }
     },
      description: {
        type: Sequelize.TEXT
      },
      fact: {
        type: Sequelize.TEXT 
      },
    },
    {
        indexes:[
          {
            unique: false,
            fields:['memberId']
          }
         ]
       },
    {
        //Other model options go here
        tableName: 'memberfacts'
    });

    return Memberfact;
  };
  