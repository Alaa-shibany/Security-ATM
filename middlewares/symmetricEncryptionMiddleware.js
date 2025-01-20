const CryptoJS = require("crypto-js");

// Middleware لفك تشفير الداتا الطلب
const symmetricDecrypt = (req, res, next) => {
  const { encryptedData, signature } = req.body;

  try {
    const sessionKey = req.sessionKey; // استخراج مفتاح الجلسة
    if (encryptedData) {
      // فك تشفير البيانات باستخدام TripleDES مع مفتاح الجلسة
      const decryptedData = CryptoJS.TripleDES.decrypt(
        encryptedData,
        sessionKey,
        { mode: CryptoJS.mode.ECB } // وضع التشفير ECB
      ).toString(CryptoJS.enc.Utf8); // تحويل النص إلى UTF-8

      req.body = JSON.parse(decryptedData); // تحويل البيانات المفكوكة إلى كائن JSON

      req.signature = signature; // إضافة التوقيع إلى الكائن
    }
    req.final = { data: {}, status: 0 }; // تهيئة الكائن النهائي
    next(); // الانتقال إلى الـ Middleware التالي
  } catch (err) {
    console.error("Error decrypting request:", err);
    return res.status(400).json({ message: "Invalid encrypted data" }); // في حالة حدوث خطأ
  }
};

// Middleware لتشفير الداتا الاستجابة
const symmetricEncrypt = (req, res, next) => {
  try {
    const sessionKey = req.sessionKey; // استخراج مفتاح الجلسة
    const signature = req.signature; // استخراج التوقيع
    const data = JSON.stringify(req.final.data); // تحويل البيانات إلى نص

    // تشفير البيانات باستخدام TripleDES مع مفتاح الجلسة
    const encryptedData = CryptoJS.TripleDES.encrypt(data, sessionKey, {
      mode: CryptoJS.mode.ECB, // وضع التشفير ECB
    }).toString(); // تحويل النتيجة إلى نص مشفر

    res.status(req.final.status).json({ encryptedData, signature }); // إرسال الاستجابة المشفرة
  } catch (error) {
    console.error("Error encrypting response:", error);
    res.status(500).json({
      error: "Failed to encrypt response", // في حالة حدوث خطأ
    });
  }
};

module.exports = { symmetricDecrypt, symmetricEncrypt };
