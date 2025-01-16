const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { sequelize } = require("./models");

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
} = require("./routes");

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:8000",
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
app.use("/*", (req, res, next) => {
  if (req.final.status != 0) return next();
  req.final.status = 404;
  req.final.data = { error: "Not Found" };
  next();
});
app.use(signMiddleware);
app.use(symmetricEncrypt);

app.listen(PORT, async () => {
  await sequelize.sync({ force: false, alter: false, logging: false });

  console.log(`Server is running on port ${PORT}`);
});
