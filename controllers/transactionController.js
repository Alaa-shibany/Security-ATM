const { Account, Operation } = require("../models");

const performTransaction = async (req, res) => {
  const { accountId } = req.params;
  const { type, amount } = req.body;
  try {
    if (!["withdraw", "deposit"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    if (type === "withdraw") {
      if (account.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      account.balance -= amount;
    } else if (type === "deposit") {
      account.balance += amount;
    }
    await account.save();
    const operation = await Operation.create({
      accountId: account.id,
      type,
      amount,
    });
    return res.status(200).json({
      message: "Transaction successful",
      balance: account.balance,
      operation: {
        id: operation.id,
        type: operation.type,
        amount: operation.amount,
        timestamp: operation.timestamp,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getOperations = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Operation.findAndCountAll({
      where: { accountId },
      order: [["timestamp", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: "Operations retrieved successfully",
      data: {
        totalOperations: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        operations: rows,
      },
    });
  } catch (error) {
    console.error("Error fetching operations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { performTransaction, getOperations };
