const { validationResult, matchedData } = require("express-validator");

const validationMiddleware = (req, res, next) => {
  // التحقق من الأخطاء بعد تنفيذ التحقق من البيانات باستخدام express-validator
  const result = validationResult(req);

  if (result.isEmpty()) {
    // إذا لم توجد أخطاء في البيانات، نقوم باستخراج البيانات المطابقة للمعايير
    req.body = matchedData(req);
  } else {
    // إذا كان هناك أخطاء، نقوم بتحديد حالة الخطأ وتعيين الرسالة المناسبة
    const errors = result.array();
    req.final.status = 400; // تعيين الحالة إلى 400 (طلب غير صالح)
    req.final.data = { error: errors.map((e) => e.msg) }; // جمع الأخطاء في مصفوفة
  }

  // الانتقال إلى الـ middleware التالي
  return next();
};

module.exports = { validationMiddleware };
