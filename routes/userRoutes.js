const express = require("express");
const {
  getUserAccounts,
  createAccountForUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", getUserAccounts);
router.post("/new", createAccountForUser);

module.exports = router;
