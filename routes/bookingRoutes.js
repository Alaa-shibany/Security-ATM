const router = require("express").Router();

const { body, param, query } = require("express-validator");
const bookingController = require("../controllers/bookingController");
const {
  validationMiddleware,
  isEmployeeMiddleware,
} = require("../middlewares");

router.post(
  "/create",
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
  bookingController.createBooking
);

router.get(
  "/user/me",
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
  bookingController.getMyBookings
);

router.use(isEmployeeMiddleware);

router.get(
  "/user/:userId",
  [
    param("userId", "userId is missing")
      .custom((input) => {
        return typeof input === "string" && !isNaN(Number(input));
      })
      .withMessage("userId must be a number"),
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
  bookingController.getUserBookings
);

router.get(
  "/park/:parkId",
  [
    param("parkId", "parkId is missing")
      .custom((input) => {
        return typeof input === "string" && !isNaN(Number(input));
      })
      .withMessage("parkId must be a number"),
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
  bookingController.getParkingBookings
);

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
  bookingController.getAllBookings
);

module.exports = router;
