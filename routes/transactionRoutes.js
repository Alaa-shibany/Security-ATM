const express = require("express");
const { performTransaction } = require("../controllers/transactionController");
const { getOperations } = require("../controllers/transactionController");

const router = express.Router();

router.get("/:accountId/operations", getOperations);
router.post("/:accountId/transaction", performTransaction);

module.exports = router;
