const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  addUser,
  findUserByUsername,
  findUserById,
} = require("../models/userModel");

const JWT_SECRET = "secretKey";

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = addUser(username, hashedPassword);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        balance: newUser.balance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const jwtToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    const token = `${user.id}|${jwtToken}`;
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const depositOrWithdraw = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, amount } = req.body;
    if (!userId || !type || !amount) {
      return res
        .status(400)
        .json({ error: "User ID, type, and amount are required" });
    }

    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount should be a positive number" });
    }
    if (type === "deposit") {
      user.balance += amount;
      updateUserBalance(user.id, user.balance);
      return res.status(200).json({
        message: "Deposit successful",
        balance: user.balance,
      });
    }

    // Withdraw
    if (type === "withdraw") {
      if (user.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      user.balance -= amount;
      updateUserBalance(user.id, user.balance);
      return res.status(200).json({
        message: "Withdrawal successful",
        balance: user.balance,
      });
    }

    return res
      .status(400)
      .json({ error: 'Invalid type. Use "deposit" or "withdraw".' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser, depositOrWithdraw };
