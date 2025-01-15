const { sequelize } = require("../models");

const transactionalMiddleware = async (req, res, next) => {
  //  req.transaction = await sequelize.transaction();
  //  try {
  //    await next();
  //
  //    if (!req.final.status.toString().startsWith("20")) {
  //      throw new Error(req.final.data);
  //    }
  //    await req.transaction.commit();
  //  } catch (error) {
  //    await req.transaction.rollback();
  //    next(error);
  //  }
  next();
};

module.exports = { transactionalMiddleware };
