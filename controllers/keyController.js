const fs = require("fs");

const getPublicKey = (req, res) => {
  try {
    const publicKey = fs.readFileSync("keys/public.pem", "utf-8");
    res.json({ publicKey });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving public key" });
  }
};

module.exports = {
  getPublicKey,
};
