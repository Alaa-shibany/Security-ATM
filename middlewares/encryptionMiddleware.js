const fs = require("fs");
const JSEncrypt = require("node-jsencrypt");

// Load the server's private key
const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

// Middleware to decrypt the request body
const decryptRequestBody = (req, res, next) => {
  const { public_key, encryptedData } = req.body;

  if (!public_key) {
    return res.status(400).json({ message: "Public key is required" });
  }

  try {
    if (encryptedData) {
      const decryptor = new JSEncrypt();
      decryptor.setPrivateKey(serverPrivateKey);

      const decryptedData = decryptor.decrypt(encryptedData);
      if (!decryptedData) {
        throw new Error("Decryption failed.");
      }

      req.body = JSON.parse(decryptedData);
      console.log(
        "----------------------------------------------------------------"
      );
      console.log(req.body);
      console.log(
        "----------------------------------------------------------------"
      );
    }
    req.userPublicKey = public_key;

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
    // Public and private keys
    const publicKey = req.userPublicKey;
    // Generate RSA key pair
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(publicKey);
    const payload = JSON.stringify(req.final.data);

    const chunkNum = Math.floor(payload.length / 100) + 1;

    const encryptedData = [];
    for (let i = 0; i < chunkNum; i++) {
      const chunk = payload.slice(i * 100, i * 100 + 100);

      // Encrypt the stringified version of the data
      const encrypted = jsEncrypt.encrypt(chunk);
      if (encrypted === false) {
        return res.status(500).json({
          error: "Failed to encrypt response",
        });
      }

      encryptedData.push(encrypted);
    }

    // Send the encrypted response
    res.status(req.final.status).json({
      encryptedData,
    });
  } catch (error) {
    console.error("Error encrypting response:", error);
    res.status(500).json({
      error: "Failed to encrypt response",
    });
  }

  next();
};

module.exports = { encryptResponseBody, decryptRequestBody };
