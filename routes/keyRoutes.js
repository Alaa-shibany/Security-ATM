// src/routes/keyRoutes.js
const express = require("express");
const { getPublicKey } = require("../controllers/keyController");

const router = express.Router();

// Route to retrieve the public key
router.get("/public-key", getPublicKey);

module.exports = router;
