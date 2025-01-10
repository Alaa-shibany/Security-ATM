const { validationResult, matchedData } = require("express-validator");

const validationMiddleware = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    req.body = matchedData(req);
  } else {
    const errors = result.array();
    req.final.status = 400;
    req.final.body = errors.map((e) => e.msg + " " + e.path);
  }
  return next();
};

module.exports = { validationMiddleware };
