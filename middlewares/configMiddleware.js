// Middleware لإعداد الكائن النهائي للردود
const configMiddleware = (req, res, next) => {
  // تهيئة كائن req.final ليحتوي على البيانات وحالة الاستجابة
  req.final = { data: {}, status: 0 };
  next(); // المتابعة إلى Middleware أو المعالج التالي
};

// تصدير Middleware
module.exports = { configMiddleware };
