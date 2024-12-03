const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Account, Token } = require("../models");

const JWT_SECRET = "secretKey";

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });
    const account = await Account.create({
      userId: newUser.id,
      balance: 0.0,
    });
    const rawToken = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const formattedToken = `${newUser.id}|${rawToken}`;
    const tokenEntry = await Token.create({
      userId: newUser.id,
      token: formattedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
      },
      account: {
        id: account.id,
        balance: account.balance,
      },
      token: formattedToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const account = await Account.findOne({ where: { userId: user.id } });
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found for this user" });
    }

    const rawToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const formattedToken = `${user.id}|${rawToken}`;

    const tokenEntry = await Token.create({
      userId: user.id,
      token: formattedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    // Return the response
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
      },
      account: {
        id: account.id,
        balance: account.balance,
      },
      token: formattedToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserAccounts = async (req, res) => {
  try {
    const { userId } = req.params;

    const accounts = await Account.findAll({
      where: { userId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({
        message: "No accounts found for the specified user",
      });
    }

    res.status(200).json({
      message: "Accounts retrieved successfully",
      accounts,
    });
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { registerUser, loginUser, getUserAccounts };
