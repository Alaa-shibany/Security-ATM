const configMiddleware = (req, res, next) => {
  req.final = { data: {}, status: 0 };
  next();
};

module.exports = { configMiddleware };
