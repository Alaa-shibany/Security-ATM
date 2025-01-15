const { DataTypes } = require("sequelize");
const sequelize = require("./config/DBconfig");

const Token = sequelize.define(
  "Token",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE", // Delete tokens if the associated user is deleted
      onUpdate: "CASCADE",
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    publicKey: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    sessionKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "tokens",
  }
);

Token.associate = (models) => {
  Token.belongsTo(models.User, { foreignKey: "userId" });
};

module.exports = Token;
