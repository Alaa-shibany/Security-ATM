const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const keysRoutes = require("./routes/keyRoutes");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api/keys", keysRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
