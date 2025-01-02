const jwt = require("jsonwebtoken");
const { User, Token } = require("../models");

const JWT_SECRET = "JzgXh8d0B8pGVhxClL3sWeI7dR6aHU6rWenYZRCXdsiWDuBb2a";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

    if (!token) {
      req.final.status = 401;
      req.final.data = { message: "Unauthenticated" };
      return next();
    }

    const userId = token.split("|")[0];
    const jwtToken = token.split("|")[1];

    // Verify token
    jwt.verify(jwtToken, JWT_SECRET, async (err, decoded) => {
      if (err) {
        req.final.status = 401;
        req.final.data = { message: "Invalid or expired token" };
        return next();
      }

      // Find the user associated with the token
      const user = await User.findByPk(userId);
      if (!user) {
        req.final.status = 401;
        req.final.data = { message: "User not found" };
        return next();
      }

      // Check if the token exists in the database and is valid (not expired)
      const userToken = await Token.findOne({
        where: { userId: user.id, token: token },
      });

      if (!userToken) {
        req.final.status = 401;
        req.final.data = { message: "Token not found in database" };
        return next();
      }

      // Check if the token is expired
      if (new Date() > new Date(userToken.expiresAt)) {
        req.final.status = 401;
        req.final.data = { message: "Token has expired" };
        return next();
      }

      // Attach user to request object for further use in the route
      req.user = user;
      req.token = userToken; // Optionally include token info

      next(); // Proceed to the next middleware or route handler
    });

    req.userId = userId;
  } catch (error) {
    req.final.status = 500;
    req.final.data = { message: "Internal server error" };
    return next();
  }
};

module.exports = authMiddleware;
