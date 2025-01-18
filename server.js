const https = require("https");
const fs = require("fs");
const app = require("./app");

const { sequelize } = require("./models");

const PORT = 3000;

const options = {
  key: fs.readFileSync("./certificates/server_private_key.pem"),
  cert: fs.readFileSync("./certificates/server.crt"),
  ca: fs.readFileSync("./certificates/root.crt"),
  requestCert: true, // Request client certificate
  rejectUnauthorized: true, // Only allow valid certificates
};

https.createServer(options, app).listen(PORT, async () => {
  await sequelize.sync({ force: false, alter: false, logging: false });
  console.log("Server is running on port 3000");
});
