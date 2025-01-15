const fs = require("fs");
const crypto = require('crypto');
const privateKey = fs.readFileSync("./keys/private.pem", "utf8");

const signData = (data) => {
    const to_sign = crypto.createSign('SHA256');
    to_sign.update(data);

    const signature = to_sign.sign(privateKey, 'hex');
    return signature;
}

const verifySignature = (data, signature, publicKey) => {
    //Only uncomment for testing
    // publicKey = fs.readFileSync("./keys/public.pem", "utf8");

    const to_verify = crypto.createVerify('SHA256');
    to_verify.update(data);

    const isValid = to_verify.verify(publicKey, signature, 'hex');
    return isValid
}

const wrong_key_test = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMVCH57584w7RttihAVu5MHEyk\nh/uCL2F6Qy63atazkVJTevkhd5bVscDq+szVZyVsZ7vXY38c86ZwNqhQm0MLS79g\nXWhGUqbVw/Uml0w+Ov7e2cy87M2QgIRxbOdTPudJUNt8pJvoQIpL/JgAxOIR4DJ+\nhkWAfBdMT/iH0zpnVwIDAQAB\n-----END PUBLIC KEY-----";

const sgn = signData("yes man");
console.log(sgn);
console.log(verifySignature("yes man", signData("yes man"), key));




