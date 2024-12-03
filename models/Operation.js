const { DataTypes } = require("sequelize");
const sequelize = require("./config/DBconfig");

const Operation = sequelize.define(
  "Operation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
      onDelete: "CASCADE", // If an account is deleted, its operations are also deleted
      onUpdate: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("withdraw", "deposit"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0.01,
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "operations",
  }
);

Operation.associate = (models) => {
  Operation.belongsTo(models.Account, {
    foreignKey: "accountId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = Operation;
