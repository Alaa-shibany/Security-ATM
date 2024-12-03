const express = require("express");
const bodyParser = require("body-parser");
const keyRoutes = require("./routes/keyRoutes");
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRout");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use("/api/keys", keyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

app.listen(PORT, async () => {
  await sequelize.sync({ force: false, alter: false });

  console.log(`Server is running on port ${PORT}`);
});
