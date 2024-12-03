const express = require("express");
const bodyParser = require("body-parser");
const keyRoutes = require("./routes/keyRoutes");
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middlewares/AuthMiddleware");
const transactionRoutes = require("./routes/transactionRout");
const {
  decryptRequestBody,
  encryptResponseBody,
} = require("./middleware/encryptionMiddleware");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/keys", keyRoutes);
app.use("/api/users", decryptRequestBody, userRoutes, encryptResponseBody);
app.use(authMiddleware);
app.use(
  "/api/transactions",
  decryptRequestBody,
  transactionRoutes,
  encryptResponseBody
);

app.listen(PORT, async () => {
  await sequelize.sync({ force: false, alter: false });

  console.log(`Server is running on port ${PORT}`);
});
