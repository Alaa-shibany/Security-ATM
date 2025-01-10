const { Parking } = require("../models");

async function all(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const parks = await Parking.findAll();

    req.final.data = { parks };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e };
    req.final.status = 500;
    return next();
  }
}

async function addPark(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { price, name, description } = req.body;
    const park = await Parking.create({
      price,
      name,
      description,
    });

    req.final.data = { park };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e };
    req.final.status = 500;
    return next();
  }
}

async function editPark(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { parkId, price, name, description } = req.body;
    const park = await Parking.update(
      {
        price,
        name,
        description,
      },
      {
        where: {
          id: parkId,
        },
      }
    );

    req.final.data = { park };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e };
    req.final.status = 500;
    return next();
  }
}

async function deletePark(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { parkId } = req.body;

    const park = await Parking.destroy({
      where: {
        id: parkId,
      },
    });

    req.final.data = { park };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e };
    req.final.status = 500;
    return next();
  }
}

module.exports = {
  all,
  addPark,
  editPark,
  deletePark,
};
