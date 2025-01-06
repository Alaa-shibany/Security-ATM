const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { sequelize } = require("./models");

const {
  decryptRequestBody,
  encryptResponseBody,
  authMiddleware,
} = require("./middlewares");

const keyRoutes = require("./routes/keyRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/keys", keyRoutes);
app.use("/api/users", decryptRequestBody, authRoutes, encryptResponseBody);
app.use(
  "/api",
  decryptRequestBody,
  authMiddleware,
  userRoutes,
  transactionRoutes,
  encryptResponseBody
);

app.listen(PORT, async () => {
  await sequelize.sync({ force: false, alter: false });

  console.log(`Server is running on port ${PORT}`);
});
