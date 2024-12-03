const crypto = require("crypto");
const { privateKey } = require("../keys");

const login = (req, res) => {
  const { encryptedData } = req.body;

  try {
    const decryptedData = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(encryptedData, "base64")
    );

    const { username, password } = JSON.parse(decryptedData.toString());

    // تحقق من المستخدم
    if (username === "user1" && password === "pass123") {
      res.status(200).json({ message: "Login successful", username });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Decryption failed", error: err.message });
  }
};

module.exports = { login };
