const { Account, Operation } = require("../models");

const performTransaction = async (req, res, next) => {
  if (req.final.status !== 0) return next();
  const { accountId } = req.params;
  const { type, amount } = req.body;
  try {
    if (!["withdraw", "deposit"].includes(type)) {
      req.final.status = 400;
      req.final.data = { message: "Invalid transaction type" };
      return next();
    }
    if (amount <= 0) {
      req.final.status = 400;
      req.final.data = { message: "Amount must be greater than 0" };
      return next();
    }

    const account = await Account.findByPk(accountId);
    if (!account) {
      req.final.status = 404;
      req.final.data = { message: "Account not found" };
      return next();
    }
    if (type === "withdraw") {
      if (account.balance < amount) {
        req.final.status = 400;
        req.final.data = { message: "Insufficient balance" };
        return next();
      }
      account.balance -= amount;
    } else if (type === "deposit") {
      account.balance = Number(account.balance) + Number(amount);
    }
    await account.save();
    const operation = await Operation.create({
      accountId: account.id,
      type,
      amount,
    });
    req.final.status = 200;
    req.final.data = {
      message: "Transaction successful",
      balance: account.balance,
      operation: {
        id: operation.id,
        type: operation.type,
        amount: operation.amount,
        timestamp: operation.timestamp,
      },
    };
    return next();
  } catch (error) {
    console.error(error);
    req.final.status = 500;
    req.final.data = { message: "Internal server error" };
    return next();
  }
};

const getOperations = async (req, res, next) => {
  try {
    if (req.final.status !== 0) return next();
    const { accountId } = req.params;

    const { count, rows } = await Operation.findAndCountAll({
      where: { accountId },
      order: [["timestamp", "DESC"]],
    });
    req.final.status = 200;
    req.final.data = {
      message: "Operations retrieved successfully",
      data: {
        totalOperations: count,
        operations: rows,
      },
    };
    return next();
  } catch (error) {
    console.error("Error fetching operations:", error);
    req.final.status = 500;
    req.final.data = { message: "Internal Server Error" };
    return next();
  }
};

module.exports = { performTransaction, getOperations };
