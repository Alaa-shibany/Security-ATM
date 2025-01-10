const router = require("express").Router();

const { body, param } = require("express-validator");
const parkController = require("../controllers/parkController");
const { validationMiddleware } = require("../middlewares");

router.get("/all", parkController.all);
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
