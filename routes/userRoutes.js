const express = require("express");
const { registerUser } = require("../controllers/userController");
const { loginUser } = require("../controllers/userController");
const { getUserAccounts } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:userId/accounts", getUserAccounts);

module.exports = router;
