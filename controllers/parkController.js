const moment = require("moment");
const { Parking, Booking, User, Account } = require("../models");
const { isTimeIntersecting } = require("../utils");
const { Op } = require("sequelize");

async function all(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const parks = await Parking.findAll({
      include: {
        model: Booking,
        required: false,
      },
    });

    const currentTime = moment();

    for (const park of parks) {
      let status = "free";

      park.dataValues.rentTime = park.dataValues.Bookings;
      delete park.dataValues.Bookings;
      for (const booking of park.dataValues.rentTime) {
        const startTime = moment(booking.startTime);
        const endTime = moment(booking.endTime);

        if (currentTime.isBetween(startTime, endTime, null, "[)")) {
          status = "reserved";
          break;
        }
      }

      park.dataValues.status = status;
    }
    for (const park of parks) {
      park.dataValues.rentTime = park.dataValues.rentTime.map((booking) => {
        const data = {};
        const startTime = moment(booking.startTime);
        const endTime = moment(booking.endTime);
        data.startTime = startTime;
        data.duration = endTime.diff(startTime, "hours");
        return data;
      });
    }

    req.final.data = { parks };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e.message };
    req.final.status = 500;
    return next();
  }
}

async function show(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const park = await Parking.findByPk(parkId, {
      include: {
        model: Booking,
        required: false,
      },
    });

    const currentTime = moment();

    let status = "free";

    park.dataValues.rentTime = park.dataValues.Bookings;
    delete park.dataValues.Bookings;
    for (const booking of park.dataValues.rentTime) {
      const startTime = moment(booking.startTime);
      const endTime = moment(booking.endTime);

      if (currentTime.isBetween(startTime, endTime, null, "[)")) {
        status = "reserved";
        break;
      }
    }

    park.dataValues.status = status;

    park.dataValues.rentTime = park.dataValues.rentTime.map((booking) => {
      const data = {};
      const startTime = moment(booking.startTime);
      const endTime = moment(booking.endTime);
      data.startTime = startTime;
      data.duration = endTime.diff(startTime, "hours");
      return data;
    });

    req.final.data = { park };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e.message };
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
    req.final.data = { error: e.message };
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
    req.final.data = { error: e.message };
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
    req.final.data = { error: e.message };
    req.final.status = 500;
    return next();
  }
}

async function reservePark(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { parkId, date, time, duration, cardId, pin } = req.body;

    const park = await Parking.findByPk(parkId);

    const userId = req.userId;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Account,
          required: true,
        },
      ],
    });

    const account = user.Accounts.find((e) => e.id === cardId);
    if (!account) {
      req.final.data = { error: "card doesn't exist" };
      req.final.status = 500;
      return next();
    }
    if (account.pin !== pin) {
      req.final.data = { error: "wrong pin" };
      req.final.status = 500;
      return next();
    }
    const price = duration * park.price;
    if (account.balance < price) {
      req.final.data = { error: "Insufficient Funds" };
      req.final.status = 401;
      return next();
    }

    const bookings = await Booking.findAll({
      where: {
        parkingId: parkId,
        endTime: {
          [Op.gte]: new Date(),
        },
      },
    });

    const startTime = new Date(date + " " + time).toLocaleString("sv-Se");
    const endTime = moment(new Date(startTime))
      .add(duration, "hours")
      .toLocaleString("sv-Se");

    isTimeIntersecting(
      bookings.map((e) => ({ startTime: e.startTime, endTime: e.endTime })),
      startTime,
      endTime
    );

    const booking = await Booking.create({
      parkingId: parkId,
      accountId: cardId,
      startTime,
      endTime,
      cost: duration * park.price,
    });
    Account.update(
      {
        balance: account.balance - price,
      },
      {
        where: {
          id: account.id,
        },
      }
    );

    req.final.data = { booking };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e.message };
    req.final.status = 500;
    return next();
  }
}

module.exports = {
  all,
  show,
  addPark,
  editPark,
  deletePark,
  reservePark,
};
