
const Sequelize = require("sequelize");



const sequelize = new Sequelize(
  process.env.DB_DB,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: Number(process.env.DB_POOL_MAX),
      min: Number(process.env.DB_POOL_MIN),
      acquire: Number(process.env.DB_POOL_ACQUIRE),
      idle: Number(process.env.DB_POOL_IDLE)
    }
  }
);

/*
if (process.env.NODE_ENV === "dev")
*/

module.exports = sequelize;