const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { sequelize } = require("./models");

const {
  decryptRequestBody,
  encryptResponseBody,
  authMiddleware,
} = require("./middlewares");

const {
  authRoutes,
  keyRoutes,
  parkRoutes,
  transactionRoutes,
  userRoutes,
} = require("./routes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/key", keyRoutes);
app.use(decryptRequestBody);
app.use("/auth", authRoutes);
//app.use(authMiddleware);
app.use("/accounts", userRoutes);
app.use("/accounts", transactionRoutes);
app.use("/park", parkRoutes);
app.use("/*", (req, res, next) => {
  if (req.final.status != 0) return next();
  req.final.status = 404;
  req.final.data = { error: "Not Found" };
  next();
});
app.use(encryptResponseBody);

app.listen(PORT, async () => {
  await sequelize.sync({ force: false, alter: false });

  console.log(`Server is running on port ${PORT}`);
});
