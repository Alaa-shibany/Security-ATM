const express = require("express");
const {
  getUserAccounts,
  createAccountForUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUserAccounts);
router.post("/new", createAccountForUser);

module.exports = router;
