const CryptoJS = require("crypto-js");

// Middleware to decrypt the request body
const symmetricDecrypt = (req, res, next) => {
  const { encryptedData, signature } = req.body;

  try {
    const sessionKey = req.sessionKey;
    if (encryptedData) {
      const decryptedData = CryptoJS.TripleDES.decrypt(
        encryptedData,
        sessionKey,
        { mode: CryptoJS.mode.ECB }
      ).toString(CryptoJS.enc.Utf8);

      req.body = JSON.parse(decryptedData);

      req.signature = signature;
    }
    req.final = { data: {}, status: 0 };
    next();
  } catch (err) {
    console.error("Error decrypting request:", err);
    return res.status(400).json({ message: "Invalid encrypted data" });
  }
};

// Middleware to encrypt the response body
const symmetricEncrypt = (req, res, next) => {
  try {
    const sessionKey = req.sessionKey;
    const signature = req.signature;
    const data = JSON.stringify(req.final.data);

    const encryptedData = CryptoJS.TripleDES.encrypt(data, sessionKey, {
      mode: CryptoJS.mode.ECB,
    }).toString();

    res.status(req.final.status).json({ encryptedData, signature });
  } catch (error) {
    console.error("Error encrypting response:", error);
    res.status(500).json({
      error: "Failed to encrypt response",
    });
  }
};

module.exports = { symmetricDecrypt, symmetricEncrypt };
