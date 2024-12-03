const express = require("express");
const { performTransaction } = require("../controllers/transactionController");
const { getOperations } = require("../controllers/transactionController");

const router = express.Router();

router.post("/accounts/:accountId/transaction", performTransaction);
router.get("/accounts/:accountId/operations", getOperations);

module.exports = router;
