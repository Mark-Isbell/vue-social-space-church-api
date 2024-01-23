const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Churchfact = sequelize.define("churchfacts", {
      churchId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'churches', // 'churches' refers to table name
           key: 'id', // 'id' refers to column name in churches table
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
            fields:['churchId']
          }
         ]
       },
    {
        //Other model options go here
        tableName: 'churchfacts'
    });

    return Churchfact;
  };
  