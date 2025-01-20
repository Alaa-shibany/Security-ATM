const fs = require("fs"); // استيراد مكتبة fs للتعامل مع نظام الملفات
const { JSEncrypt } = require("nodejs-jsencrypt"); // استيراد مكتبة JSEncrypt لتوليد مفاتيح RSA

// إنشاء كائن JSEncrypt بمفتاح افتراضي بحجم 2048 بت وتوليد المفاتيح
const jsEncrypt = new JSEncrypt({ default_key_size: "2048" }).getKey();

// استخراج المفتاح العام
const publicKey = jsEncrypt.getPublicKey();

// استخراج المفتاح الخاص
const privateKey = jsEncrypt.getPrivateKey();

// كتابة المفتاح الخاص في ملف داخل مجلد keys
fs.writeFileSync("keys/private.pem", privateKey);

// كتابة المفتاح العام في ملف داخل مجلد keys
fs.writeFileSync("keys/public.pem", publicKey);

// طباعة رسالة نجاح عند إتمام العملية
console.log('RSA Key pair generated and saved in the "keys/" directory.');
