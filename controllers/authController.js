const jwt = require("jsonwebtoken");
const { User, Account, Token } = require("../models");

const JWT_SECRET = "JzgXh8d0B8pGVhxClL3sWeI7dR6aHU6rWenYZRCXdsiWDuBb2a";

const registerUser = async (req, res, next) => {
  try {
    if (req.final.status !== 0) return next();
    const { username, password, phone, carPlateNumber } = req.body;
    const existingUsername = await User.findOne({ where: { username } });
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingUsername || existingPhone) {
      req.final.status = 400;
      req.final.data = { message: "Username Or phone already exists" };
      return next();
    }
    const newUser = await User.create({
      username,
      password,
      userType: "visitor",
      phone,
      carPlateNumber,
    });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const formattedToken = `${newUser.id}|${token}`;
    //TODO:add real session key
    await Token.create({
      userId: newUser.id,
      token: formattedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      sessionKey: "ehboood",
    });

    req.final.status = 201;
    req.final.data = {
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        carPlateNumber: newUser.carPlateNumber,
      },
      token: formattedToken,
    };
    return next();
  } catch (error) {
    console.error(error);
    req.final.status = 500;
    req.final.data = { message: "Internal server error" };
    return next();
  }
};

const loginUser = async (req, res, next) => {
  if (req.final.status !== 0) return next();
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      req.final.status = 404;
      req.final.data = { message: "Invalid credentials" };
      return next();
    }
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      req.final.status = 401;
      req.final.data = { message: "Invalid credentials" };
      return next();
    }

    const rawToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const formattedToken = `${user.id}|${rawToken}`;

    //TODO:add real session key
    await Token.create({
      userId: user.id,
      token: formattedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      sessionKey: "ehboood",
    });

    // Return the response
    req.final.status = 200;
    req.final.data = {
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
      },
      token: formattedToken,
    };
    return next();
  } catch (error) {
    console.error(error);
    req.final.status = 500;
    req.final.data = { message: "Internal server error" };
    return next();
  }
};

module.exports = { registerUser, loginUser };
