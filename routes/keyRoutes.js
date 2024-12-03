const express = require("express");
const { publicKey } = require("../keys");

const router = express.Router();

router.get("/public-key", (req, res) => {
  console.log(publicKey);

  res.status(200).send(publicKey.export({ type: "pkcs1", format: "pem" }));
});

module.exports = router;
