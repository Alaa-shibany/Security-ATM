const fs = require("fs");
const JSEncrypt = require("node-jsencrypt");

// Load the server's private key
const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

// Middleware to decrypt the request body
const decryptRequestBody = (req, res, next) => {
  const { encryptedData } = req.body;

  try {
    if (encryptedData) {
      req.body = encryptedData;
    }
    req.final = { data: {}, status: 0 };
    next();
  } catch (err) {
    console.error("Error decrypting request:", err);
    return res.status(400).json({ message: "Invalid encrypted data" });
  }
};

// Middleware to encrypt the response body
const encryptResponseBody = (req, res, next) => {
  try {
    // Send the encrypted response
    res.status(req.final.status).json(req.final.data);
  } catch (error) {
    console.error("Error encrypting response:", error);
    res.status(500).json({
      error: "Failed to encrypt response",
    });
  }
};

module.exports = { encryptResponseBody, decryptRequestBody };
