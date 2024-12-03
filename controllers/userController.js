const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { addUser, findUserByUsername } = require("../models/userModel");

const JWT_SECRET = "secretKey";

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }
    if (findUserByUsername(username)) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = new Date().getTime();
    const jwtToken = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    const token = `${userId}|${jwtToken}`;
    addUser({ username, password: hashedPassword, balance: 0, token });
    res.status(201).json({
      message: "User registered successfully",
      user: { username, balance: 0 },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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

module.exports = { registerUser, loginUser };
