const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const {
  validationMiddleware,
  decryptRequestBody,
  encryptResponseBody,
} = require("../middlewares");
const { body } = require("express-validator");

const router = express.Router();

router.use(decryptRequestBody);
router.post(
  "/register",
  [
    body("username", "username is missing")
      .isString()
      .withMessage("username must be a string")
      .escape(),
    body("password", "password is missing")
      .isString()
      .withMessage("password must be a string"),
    body("phone", "phone is missing")
      .custom(
        (val) =>
          typeof val === "string" && val.length === 10 && val.match(/^[0-9]*/gm)
      )
      .withMessage("phone must be a string"),
    body("carPlateNumber", "carPlateNumber is missing")
      .custom((val) => typeof val === "string" && val.match(/^[0-9]*/gm))
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
      .withMessage("username must be a string")
      .escape(),
    body("password", "password is missing")
      .isString()
      .withMessage("password must be a string"),
  ],
  validationMiddleware,
  loginUser
);
router.use(encryptResponseBody);

module.exports = router;
