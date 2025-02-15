// Import models in a centralized location to ensure they're loaded
const User = require("./User");
const Token = require("./Token");
const Account = require("./Account");
const Booking = require("./Booking");
const Operation = require("./Operation");
const Parking = require("./Parking");
const sequelize = require("./config/DBconfig");

// Define associations
User.associate({ Token, Account });
Token.associate({ User });
Account.associate({ User, Operation, Booking });
Operation.associate({ Account });
Parking.associate({ Booking});
Booking.associate({ Parking, Account });

// Export models to ensure they're used elsewhere
module.exports = {
  sequelize,
  User,
  Account,
  Token,
  Operation,
  Parking,
  Booking,
};
