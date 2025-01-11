const router = require("express").Router();

const { body, param } = require("express-validator");
const parkController = require("../controllers/parkController");
const {
  validationMiddleware,
  isEmployeeMiddleware,
} = require("../middlewares");

router.get("/all", parkController.all);
router.get(
  "/show/:parkId",
  [
    param("parkId", "parkId is missing")
      .custom((input) => {
        return typeof input === "string" && !isNaN(Number(input));
      })
      .withMessage("parkId must be a string"),
  ],
  validationMiddleware,
  parkController.show
);
router.post(
  "/reserve",
  [
    body("parkId", "parkId is missing")
      .isNumeric()
      .withMessage("parkId must be a number"),
    body("date", "date is missing").isDate().withMessage("date must be a date"),
    body("time", "time is missing")
      .isTime({
        hourFormat: "hour24",
        mode: "withSeconds",
      })
      .withMessage("time must be a time"),
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
router.use(isEmployeeMiddleware);
router.post(
  "/add",
  [
    body("name", "name is missing")
      .notEmpty()
      .isString()
      .withMessage("name must be a string"),
    body("description", "description is missing")
      .notEmpty()
      .isString()
      .withMessage("description must be a string"),
    body("price", "price is missing")
      .notEmpty()
      .isNumeric()
      .withMessage("price must be a number"),
  ],
  validationMiddleware,
  parkController.addPark
);
router.put(
  "/edit",
  [
    body("parkId", "parkId is missing")
      .isNumeric()
      .withMessage("parkId must be a number"),
    body("name", "name is missing")
      .optional()
      .isString()
      .withMessage("name must be a string"),
    body("description", "description is missing")
      .optional()
      .isString()
      .withMessage("description must be a string"),
    body("price", "price is missing")
      .optional()
      .isNumeric()
      .withMessage("price must be a number"),
  ],
  validationMiddleware,
  parkController.editPark
);
router.delete(
  "/delete/:parkId",
  [
    param("parkId", "parkId is missing")
      .custom((input) => {
        return typeof input === "string" && !isNaN(Number(input));
      })
      .withMessage("parkId must be a string"),
  ],
  validationMiddleware,
  parkController.deletePark
);

module.exports = router;
