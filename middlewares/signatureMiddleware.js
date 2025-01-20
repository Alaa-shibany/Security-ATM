const fs = require("fs");
const CryptoJS = require("crypto-js");
const { JSEncrypt } = require("nodejs-jsencrypt");

const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

// Middleware to decrypt the request body
const verifyMiddleware = (req, res, next) => {
  const { signature, body } = req;
  const publicKey = req.userPublicKey;

  if (Object.keys(body).length === 0) {
    return next();
  }

  const data = JSON.stringify(body);

  try {
    if (signature) {
      const hash = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);

      const verifier = new JSEncrypt();
      verifier.setPublicKey(publicKey);

      const isValid = verifier.verify(hash, signature, (str) => str);

      if (!isValid) {
        console.error("Invalid signature");
        req.final.status = 401;
        req.final.data = "Invalid signature";
        return next();
      }
    } else {
      console.error("Signature not provided in request");
      req.final.status = 400;
      req.final.data = "Signature not provided";
    }
    return next();
  } catch (err) {
    console.error("Error decrypting request:", err);
    return res.status(400).json({ message: "Invalid encrypted data" });
  }
};

// Middleware to encrypt the response body
const signMiddleware = (req, res, next) => {
  try {
    const data = JSON.stringify(req.final.data);

    const hash = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    const signer = new JSEncrypt();
    signer.setPrivateKey(serverPrivateKey);
    const signature = signer.sign(hash, (str) => str, "SHA256");

    req.signature = signature;
    next();
  } catch (error) {
    console.error("Error encrypting response:", error);
    res.status(500).json({
      error: "Failed to encrypt response",
    });
  }
};

module.exports = { signMiddleware, verifyMiddleware };
