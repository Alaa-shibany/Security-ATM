const jwt = require("jsonwebtoken");
const { User, Token } = require("../models");

const JWT_SECRET = "JzgXh8d0B8pGVhxClL3sWeI7dR6aHU6rWenYZRCXdsiWDuBb2a";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Find the user associated with the token
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if the token exists in the database and is valid (not expired)
      const userToken = await Token.findOne({
        where: { userId: user.id, token: token },
      });

      if (!userToken) {
        return res.status(401).json({ message: "Token not found in database" });
      }

      // Check if the token is expired
      if (new Date() > new Date(userToken.expiresAt)) {
        return res.status(401).json({ message: "Token has expired" });
      }

      // Attach user to request object for further use in the route
      req.user = user;
      req.token = userToken; // Optionally include token info

      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authMiddleware;
