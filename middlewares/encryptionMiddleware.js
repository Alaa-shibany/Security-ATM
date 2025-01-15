const fs = require("fs");
const JSEncrypt = require("node-jsencrypt");

// Load the server's private key
const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

// Middleware to decrypt the request body
const decryptRequestBody = (req, res, next) => {
  const { encryptedData } = req.body;

  try {
    if (encryptedData) {
      const jsEncrypt = new JSEncrypt({ default_key_size: "2048" });
      jsEncrypt.setPrivateKey(serverPrivateKey);

      const decryptedData = [];
      for (const chunk of encryptedData) {
        const decStr = jsEncrypt.decrypt(chunk);
        if (decStr === false) {
          throw new Error("error while encryption data.");
        }

        decryptedData.push(decStr);
      }

      const data = JSON.parse(decryptedData.join(""));
      req.userPublicKey = data.publicKey;

      delete data.publicKey;
      req.body = data;
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
    const data = JSON.stringify(req.final.data);

    const jsEncrypt = new JSEncrypt({ default_key_size: "2048" });

    jsEncrypt.setPublicKey(req.userPublicKey);

    const encryptedData = [];

    for (let i = 0; i <= Math.floor(data.length / 100); i++) {
      const str = data.slice(i * 100, (i + 1) * 100);

      const encStr = jsEncrypt.encrypt(str);

      if (encStr === false) {
        throw new Error("error while encryption data.");
      }
      encryptedData.push(encStr);
    }

    res.status(req.final.status).json({ encryptedData });
  } catch (error) {
    console.error("Error encrypting response:", error);
    res.status(500).json({
      error: "Failed to encrypt response",
    });
  }
};

module.exports = { encryptResponseBody, decryptRequestBody };
