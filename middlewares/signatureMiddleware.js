const fs = require("fs");
const CryptoJS = require("crypto-js");
const { JSEncrypt } = require("nodejs-jsencrypt");

const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

// Middleware للتحقق من التوقيع في داتا الطلب
const verifyMiddleware = (req, res, next) => {
  const { signature, body } = req;
  const publicKey = req.userPublicKey; // استخدام المفتاح العام الخاص بالمستخدم

  if (Object.keys(body).length === 0) {
    return next(); // إذا كان الداتا فارغًا، ننتقل إلى الـ middleware التالي
  }

  const data = JSON.stringify(body); // تحويل البيانات إلى نص JSON

  try {
    if (signature) {
      // حساب الـ hash باستخدام خوارزمية SHA256
      const hash = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);

      const verifier = new JSEncrypt(); // إنشاء كائن من JSEncrypt للتحقق من التوقيع
      verifier.setPublicKey(publicKey); // تعيين المفتاح العام

      // التحقق من التوقيع
      const isValid = verifier.verify(hash, signature, (str) => str);

      if (!isValid) {
        console.error("Invalid signature");
        req.final.status = 401; // في حالة التوقيع غير صالح
        req.final.data = "Invalid signature";
        return next();
      }
    } else {
      console.error("Signature not provided in request");
      req.final.status = 400; // في حالة عدم تقديم التوقيع
      req.final.data = "Signature not provided";
    }
    return next();
  } catch (err) {
    console.error("Error decrypting request:", err);
    return res.status(400).json({ message: "Invalid encrypted data" }); // في حالة حدوث خطأ
  }
};

// Middleware لتوقيع الاستجابة
const signMiddleware = (req, res, next) => {
  try {
    const data = JSON.stringify(req.final.data); // تحويل البيانات إلى نص JSON

    // حساب الـ hash باستخدام خوارزمية SHA256
    const hash = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    const signer = new JSEncrypt(); // إنشاء كائن من JSEncrypt للتوقيع
    signer.setPrivateKey(serverPrivateKey); // تعيين المفتاح الخاص بالخادم
    const signature = signer.sign(hash, (str) => str, "SHA256"); // توقيع الـ hash

    req.signature = signature; // تعيين التوقيع في الكائن
    next(); // الانتقال إلى الـ middleware التالي
  } catch (error) {
    console.error("Error encrypting response:", error);
    res.status(500).json({
      error: "Failed to encrypt response", // في حالة حدوث خطأ
    });
  }
};

module.exports = { signMiddleware, verifyMiddleware };
