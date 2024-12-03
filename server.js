const express = require("express");
const bodyParser = require("body-parser");
const keyRoutes = require("./routes/keyRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use("/api/keys", keyRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
