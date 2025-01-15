const fs = require("fs");
const JSEncrypt = require("node-jsencrypt");

const jsEncrypt = new JSEncrypt({ default_key_size: "2048" }).getKey();
const publicKey = jsEncrypt.getPublicKey();
const privateKey = jsEncrypt.getPrivateKey();

fs.appendFileSync("keys/private.pem", privateKey);
fs.appendFileSync("keys/public.pem", publicKey);

console.log('RSA Key pair generated and saved in the "keys/" directory.');
