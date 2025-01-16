const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { validationMiddleware, decryptRequestBody, encryptResponseBody } = require("../middlewares");
const { body } = require("express-validator");

const router = express.Router();

router.use(decryptRequestBody);
router.post(
  "/register",
  [
    body("username", "username is missing")
      .isString()
      .withMessage("username must be a string"),
    body("password", "password is missing")
      .isString()
      .withMessage("password must be a string"),
    body("phone", "phone is missing")
      .isString()
      .withMessage("phone must be a string"),
    body("carPlateNumber", "carPlateNumber is missing")
      .isString()
      .withMessage("carPlateNumber must be a string"),
  ],
  validationMiddleware,
  registerUser
);
router.post(
  "/login",
  [
    body("username", "username is missing")
      .isString()
      .withMessage("username must be a string"),
    body("password", "password is missing")
      .isString()
      .withMessage("password must be a string"),
  ],
  validationMiddleware,
  loginUser
);
router.use(encryptResponseBody);

module.exports = router;
