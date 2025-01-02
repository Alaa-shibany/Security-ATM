const express = require("express");
const {
  getUserAccounts,
  createAccountForUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/accounts", getUserAccounts);
router.post("/accounts/new", createAccountForUser);

module.exports = router;
