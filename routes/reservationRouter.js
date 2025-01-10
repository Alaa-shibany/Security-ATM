const { body } = require("express-validator");
const { validationMiddleware } = require("../middlewares");
const parkController = require("../controllers/parkController");

const router = require("express").Router();

router.post(
  "/reserve",
  [
    body("parkId", "parkId is missing")
      .isNumeric()
      .withMessage("parkId must be a number"),
    body("date", "date is missing").isDate().withMessage("date must be a date"),
    body("time", "time is missing").isTime().withMessage("time must be a time"),
    body("duration", "duration is missing")
      .isNumeric()
      .withMessage("duration must be a number"),
    body("cardId", "cardId is missing")
      .isNumeric()
      .withMessage("cardId must be a number"),
    body("pin", "pin is missing")
      .isString()
      .isLength({ min: 4, max: 4 })
      .custom((input) => {
        return typeof input === "string" && !isNaN(Number(input));
      })
      .withMessage("pin must be a 4 digit number"),
  ],
  validationMiddleware,
  parkController.reservePark
);

module.exports = router;
