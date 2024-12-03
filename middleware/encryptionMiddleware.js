const crypto = require("crypto");
const fs = require("fs");

const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

const decryptRequestBody = (req, res, next) => {
  const { public_key, encryptedData } = req.body;

  if (!public_key || !encryptedData) {
    return res
      .status(400)
      .json({ message: "Public key and encrypted data are required" });
  }

  try {
    const buffer = Buffer.from(encryptedData, "base64");
    const decryptedData = crypto.privateDecrypt(
      {
        key: serverPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedData, "base64")
    );
    req.body = JSON.parse(decryptedData.toString("utf8"));
    req.userPublicKey = public_key;
    next();
  } catch (err) {
    console.error("Error decrypting request:", err);
    return res.status(400).json({ message: "Invalid encrypted data" });
  }
};

const encryptResponseBody = (req, res, next) => {
  const originalSend = res.json;
  res.json = (data) => {
    try {
      const dataString = JSON.stringify(data);
      const encryptedData = crypto.publicEncrypt(
        {
          key: req.userPublicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(dataString)
      );
      originalSend.call(res, {
        encryptedData: encryptedData.toString("base64"),
      });
    } catch (err) {
      console.error("Error encrypting response:", err);
      res.status(500).json({ message: "Error encrypting response" });
    }
  };
  next();
};

module.exports = { encryptResponseBody, decryptRequestBody };
