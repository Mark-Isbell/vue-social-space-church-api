const { Sequelize } = require('sequelize');

// Note: This model is not currently used, as all images are stored in Base64 text format
module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define("images", {
    image: { 
        type: DataTypes.BLOB('long'), // <- type for image ( database :postgresql )
        allowNull: true 
      },
      memberId: {
        type: Sequelize.INTEGER,
        references: {
           model: 'members', // 'members' refers to table name
           key: 'id', // 'id' refers to column name in members table
        }
     },
      caption: {
        type: DataTypes.STRING
      },
      imageType: {
        type: DataTypes.STRING // profile or collection
      },
    },
    {
        //Other model options go here
        tableName: 'images'
    });

    return Image;
  };
  


