const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const {
  authMiddleware,
  transactionalMiddleware,
  symmetricDecrypt,
  symmetricEncrypt,
  configMiddleware,
  signMiddleware,
  verifyMiddleware,
} = require("./middlewares");

const {
  authRoutes,
  keyRoutes,
  parkRoutes,
  transactionRoutes,
  userRoutes,
  bookingRoutes,
} = require("./routes");

const app = express();

app.use(
  cors({
    origin: "https://localhost:8000",
  })
);
app.use(bodyParser.json());

app.use(transactionalMiddleware);
app.use(configMiddleware);
app.use("/key", keyRoutes);
app.use("/auth", authRoutes);
app.use(authMiddleware);
app.use(symmetricDecrypt);
app.use(verifyMiddleware);
app.use("/accounts", userRoutes);
app.use("/accounts", transactionRoutes);
app.use("/park", parkRoutes);
app.use("/booking", bookingRoutes);
app.use("/*", (req, res, next) => {
  if (req.final.status != 0) return next();
  req.final.status = 404;
  req.final.data = { error: "Not Found" };
  next();
});
app.use(signMiddleware);
app.use(symmetricEncrypt);

module.exports = app;
