const fs = require("fs");
const JSEncrypt = require("node-jsencrypt");

// Load the server's private key
const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

// Middleware to decrypt the request body
const decryptRequestBody = (req, res, next) => {
  const { public_key, encryptedData } = req.body;

  if (!public_key || !encryptedData) {
    return res
      .status(400)
      .json({ message: "Public key and encrypted data are required" });
  }

  try {
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(serverPrivateKey);

    const decryptedData = decryptor.decrypt(encryptedData);
    if (!decryptedData) {
      throw new Error("Decryption failed.");
    }

    req.body = JSON.parse(decryptedData);
    req.userPublicKey = public_key;
    next();
  } catch (err) {
    console.error("Error decrypting request:", err);
    return res.status(400).json({ message: "Invalid encrypted data" });
  }
};

// Middleware to encrypt the response body
const encryptResponseBody = (req, res, next) => {
  const originalSend = res.json;

  res.json = (data) => {
    try {
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(req.userPublicKey);

      const dataString = JSON.stringify(data);
      const encryptedData = encryptor.encrypt(dataString);

      if (!encryptedData) {
        throw new Error("Encryption failed.");
      }

      originalSend.call(res, {
        encryptedData,
      });
    } catch (err) {
      console.error("Error encrypting response:", err);
      res.status(500).json({ message: "Error encrypting response" });
    }
  };

  next();
};

module.exports = { encryptResponseBody, decryptRequestBody };
