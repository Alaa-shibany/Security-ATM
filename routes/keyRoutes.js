const express = require("express");
const { getPublicKey } = require("../controllers/keyController");

const router = express.Router();

router.get("/public-key", getPublicKey);

module.exports = router;
