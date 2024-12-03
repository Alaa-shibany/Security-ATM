const fs = require("fs");
const crypto = require("crypto");

const generateKeys = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  fs.writeFileSync(
    "keys/private.pem",
    privateKey.export({ type: "pkcs1", format: "pem" })
  );
  fs.writeFileSync(
    "keys/public.pem",
    publicKey.export({ type: "spki", format: "pem" })
  );

  console.log('RSA Key pair generated and saved in the "keys/" directory.');
};

generateKeys();
