const router = require("express").Router();

const { body, param, query } = require("express-validator");
const parkController = require("../controllers/parkController");
const {
  validationMiddleware,
  isEmployeeMiddleware,
} = require("../middlewares");

router.get(
  "/all",
  [
    query("search").optional({ values: "falsy" }).isString().trim(),
    query("date")
      .optional({ values: "falsy" })
      .isDate()
      .withMessage("date must be a date"),
    query("time")
      .optional({ values: "falsy" })
      .isTime({ hourFormat: "hour24", mode: "withSeconds" })
      .withMessage("time must be a time"),
  ],
  validationMiddleware,
  parkController.all
);
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

router.use(isEmployeeMiddleware);
router.post(
  "/add",
  [
    body("name", "name is missing")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("name must be a string")
      .escape(),
    body("description", "description is missing")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("description must be a string")
      .escape(),
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
      .optional({ values: "falsy" })
      .isString()
      .trim()
      .escape()
      .withMessage("name must be a string"),
    body("description", "description is missing")
      .optional({ values: "falsy" })
      .isString()
      .trim()
      .escape()
      .withMessage("description must be a string"),
    body("price", "price is missing")
      .optional({ values: "falsy" })
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
