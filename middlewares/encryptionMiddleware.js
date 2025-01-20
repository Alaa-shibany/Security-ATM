const fs = require("fs"); // استيراد مكتبة fs للتعامل مع نظام الملفات
const { JSEncrypt } = require("nodejs-jsencrypt"); // استيراد مكتبة JSEncrypt لتشفير وفك التشفير باستخدام RSA

// تحميل المفتاح الخاص للسيرفر من الملف
const serverPrivateKey = fs.readFileSync("./keys/private.pem", "utf8");

// Middleware لفك تشفير بيانات الطلب
const decryptRequestBody = (req, res, next) => {
  const { encryptedData, signature } = req.body; // استخراج البيانات المشفرة والتوقيع من بيانات الطلب

  try {
    const jsEncrypt = new JSEncrypt({ default_key_size: "2048" }); // إنشاء كائن JSEncrypt
    jsEncrypt.setPrivateKey(serverPrivateKey); // تعيين المفتاح الخاص للسيرفر

    // فك تشفير البيانات المشفرة (جزء بجزء إذا كانت طويلة)
    const decryptedData = [];
    for (const chunk of encryptedData) {
      const decStr = jsEncrypt.decrypt(chunk); // فك تشفير كل جزء
      if (decStr === false) {
        throw new Error("error while encryption data."); // خطأ إذا فشل فك التشفير
      }

      decryptedData.push(decStr); // إضافة الجزء المفكوك إلى المصفوفة
    }

    // تحويل البيانات المفكوكة من نص إلى كائن JSON
    const data = JSON.parse(decryptedData.join(""));
    req.userPublicKey = data.publicKey; // حفظ المفتاح العام للمستخدم
    req.signature = signature; // حفظ التوقيع
    req.sessionKey = data.sessionKey; // حفظ مفتاح الجلسة

    // حذف البيانات الحساسة من الطلب
    delete data.publicKey;
    delete data.sessionKey;
    req.body = data; // تحديث جسم الطلب بالبيانات المفكوكة

    req.final = { data: {}, status: 0 }; // إنشاء استجابة افتراضية
    next(); // متابعة الطلب إلى Middleware التالي
  } catch (err) {
    console.error("Error decrypting request:", err); // طباعة الخطأ في فك التشفير
    return res.status(400).json({ message: "Invalid encrypted data" }); // إعادة استجابة خطأ
  }
};

// Middleware لتشفير بيانات الاستجابة
const encryptResponseBody = (req, res, next) => {
  try {
    const signature = req.signature; // استخراج التوقيع
    const data = JSON.stringify(req.final.data); // تحويل بيانات الاستجابة إلى نص

    const jsEncrypt = new JSEncrypt({ default_key_size: "2048" }); // إنشاء كائن JSEncrypt
    jsEncrypt.setPublicKey(req.userPublicKey); // تعيين المفتاح العام للمستخدم

    const encryptedData = []; // مصفوفة لتخزين البيانات المشفرة

    // تشفير البيانات (بأجزاء إذا كانت طويلة)
    for (let i = 0; i <= Math.floor(data.length / 100); i++) {
      const str = data.slice(i * 100, (i + 1) * 100); // تقسيم النص إلى أجزاء
      const encStr = jsEncrypt.encrypt(str); // تشفير كل جزء

      if (encStr === false) {
        throw new Error("error while encryption data."); // خطأ إذا فشل التشفير
      }
      encryptedData.push(encStr); // إضافة الجزء المشفر إلى المصفوفة
    }

    // إرسال الاستجابة المشفرة مع التوقيع
    res.status(req.final.status).json({ encryptedData, signature });
  } catch (error) {
    console.error("Error encrypting response:", error); // طباعة الخطأ في التشفير
    res.status(500).json({
      error: "Failed to encrypt response", // إعادة استجابة خطأ
    });
  }
};

// تصدير Middleware لفك التشفير والتشفير
module.exports = { encryptResponseBody, decryptRequestBody };
