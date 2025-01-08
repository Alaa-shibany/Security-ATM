const { DataTypes } = require("sequelize");
const sequelize = require("./config/DBconfig");

const Booking = sequelize.define(
  "Booking", 
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    parkingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "parkings",
        key: "id",
      },
      onDelete: "CASCADE", // If an account is deleted, its operations are also deleted
      onUpdate: "CASCADE",
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
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cost: {
      type: DataTypes.INTEGER,
      defaultValue: 0.0,
      validate: {
        isInt: true,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
    tableName: "bookings",
  }
);

Booking.associate = (models) => {
  Booking.belongsTo(models.Account, { foreignKey: "accountId"})
  Booking.belongsTo(models.Parking, { foreignKey: "parkingId"})
};

module.exports = Booking;
