const { Account } = require("../models");

const getUserAccounts = async (req, res, next) => {
  try {
    if (req.final.status !== 0) return next();
    const userId = req.userId;
    const accounts = await Account.findAll({
      where: { userId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!accounts || accounts.length === 0) {
      req.final.status = 404;
      req.final.data = { message: "No accounts found for the specified user" };
      return next();
    }

    req.final.status = 200;
    req.final.data = { message: "Accounts retrieved successfully", accounts };
    return next();
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    req.final.status = 500;
    req.final.data = { message: "Internal Server Error" };
    return next();
  }
};

const createAccountForUser = async (req, res, next) => {
  try {
    if (req.final.status !== 0) return next();
    const userId = req.userId;
    const newAccount = await Account.create({
      userId,
      balance: 0,
    });

    req.final.status = 200;
    req.final.data = { message: "Account created successfully", newAccount };
    return next();
  } catch (error) {
    console.error("Error creating user account:", error);
    req.final.status = 500;
    req.final.data = { message: "Internal Server Error" };
    return next();
  }
};

module.exports = { getUserAccounts, createAccountForUser };
