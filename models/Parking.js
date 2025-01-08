const { DataTypes } = require("sequelize");
const sequelize = require("./config/DBconfig");

const Parking = sequelize.define(
  "Parking", 
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    timestamps: true,
    tableName: "parkings",
  }
);

Parking.associate = (models) => {
  Parking.hasMany(models.Booking, { foreignKey: "parkingId" })
};

module.exports = Parking;
