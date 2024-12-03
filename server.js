const express = require("express");
const bodyParser = require("body-parser");
const keyRoutes = require("./routes/keyRoutes");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use("/api/keys", keyRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
