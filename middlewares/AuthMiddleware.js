const jwt = require("jsonwebtoken"); // استيراد مكتبة jwt للتعامل مع رموز JWT
const { User, Token } = require("../models"); // استيراد موديل المستخدم والرموز من المجلد models

const JWT_SECRET = "JzgXh8d0B8pGVhxClL3sWeI7dR6aHU6rWenYZRCXdsiWDuBb2a"; // المفتاح السري المستخدم في توقيع وفحص رموز JWT

// Middleware للتحقق من مصداقية المستخدم
const authMiddleware = async (req, res, next) => {
  try {
    // التحقق من حالة الاستجابة النهائية
    if (req.final.status !== 0) return next();

    // استخراج الرمز من ترويسة Authorization
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>
    if (!token) {
      req.final.status = 401; // حالة غير مصدق عليه
      req.final.data = { error: "Unauthenticated" };
      return next();
    }

    const userId = token.split("|")[0]; // استخراج معرف المستخدم من الرمز
    const jwtToken = token.split("|")[1]; // استخراج رمز JWT

    // التحقق من صحة الid JWT
    jwt.verify(jwtToken, JWT_SECRET, async (err, decoded) => {
      if (err) {
        req.final.status = 401;
        req.final.data = { error: "Invalid or expired token" };
        return next();
      }

      // البحث عن المستخدم المرتبط التوكين
      const user = await User.findByPk(userId);
      if (!user) {
        req.final.status = 401;
        req.final.data = { error: "User not found" };
        return next();
      }

      // التحقق من وجود التوكين في قاعدة البيانات وصلاحيته
      const userToken = await Token.findOne({
        where: { userId: user.id, token: token },
      });

      if (!userToken) {
        req.final.status = 401;
        req.final.data = { error: "Token not found in database" };
        return next();
      }

      // التحقق من انتهاء صلاحية التوكين
      if (new Date() > new Date(userToken.expiresAt)) {
        req.final.status = 401;
        req.final.data = { error: "Token has expired" };
        return next();
      }

      // إرفاق المستخدم والتوكين بالكائن req للاستخدام لاحقًا
      req.user = user;
      req.token = userToken;
      req.sessionKey = userToken.sessionKey;
      req.userPublicKey = userToken.publicKey;

      next(); // المتابعة إلى Middleware أو المعالج التالي
    });

    req.userId = userId; // حفظ معرف المستخدم
  } catch (error) {
    req.final.status = 500; // خطأ في السيرفر الداخلي
    req.final.data = { message: "Internal server error" };
    return next();
  }
};

// Middleware للتحقق من أن المستخدم هو مشرف
const isAdminMiddleware = async (req, res, next) => {
  try {
    if (req.final.status !== 0) return next(); // التحقق من حالة الريسبونس النهائية

    if (req.user.userType !== "admin") {
      // التحقق من نوع المستخدم
      req.final.status = 403; // حالة ممنوعة
      req.final.data = { message: "Forbidden Operation" };
    }
    return next();
  } catch (error) {
    console.log(error); // طباعة الخطأ

    req.final.status = 500; // خطأ في السيرفر الداخلي
    req.final.data = { message: "Internal server error" };
    return next();
  }
};

// Middleware للتحقق من أن المستخدم هو موظف أو مشرف
const isEmployeeMiddleware = async (req, res, next) => {
  try {
    if (req.final.status !== 0) return next(); // التحقق من حالة الريسبونس النهائية

    if (req.user.userType !== "employee" && req.user.userType !== "admin") {
      // التحقق من نوع المستخدم
      req.final.status = 403; // حالة ممنوعة
      req.final.data = { message: "Forbidden Operation" };
    }
    return next();
  } catch (error) {
    console.log(error); // طباعة الخطأ

    req.final.status = 500; // خطأ في السيرفر الداخلي
    req.final.data = { message: "Internal server error" };
    return next();
  }
};

// تصدير Middleware
module.exports = { authMiddleware, isAdminMiddleware, isEmployeeMiddleware };
