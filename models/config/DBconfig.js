const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  database: "bank",
  dialect: "mysql",
  username: "root",
});

module.exports = sequelize;
