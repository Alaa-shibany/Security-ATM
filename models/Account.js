const { DataTypes } = require("sequelize");
const sequelize = require("./config/DBconfig");

const Account = sequelize.define(
  "Account",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE", // If a user is deleted, their accounts are deleted
      onUpdate: "CASCADE",
    },
  },
  {
    timestamps: true,
    tableName: "accounts",
  }
);

Account.associate = (models) => {
  Account.belongsTo(models.User, { foreignKey: "userId" });
  Account.hasMany(models.Operation, { foreignKey: "accountId" });
};

module.exports = Account;
