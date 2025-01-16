const moment = require("moment");
const { Parking, Booking, User, Account } = require("../models");
const { isTimeIntersecting } = require("../utils");
const { Op } = require("sequelize");

async function all(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { search, date, time } = req.body;
    req.body = {};

    // Convert date and time to a moment object for filtering
    const filterDate = date ? moment(date, "YYYY-MM-DD") : null;
    const filterTime = time ? moment(time, "HH:mm") : null;

    const parks = await Parking.findAll({
      include: {
        model: Booking,
        required: false,
      },
      where: search
        ? {
            [Op.or]: {
              name: {
                [Op.like]: `%${search}%`,
              },
              description: {
                [Op.like]: `%${search}%`,
              },
            },
          }
        : {},
    });

    const currentTime = moment();

    for (const park of parks) {
      let satisfiesFilter = true;

      park.dataValues.rentTime = park.dataValues.Bookings;
      delete park.dataValues.Bookings;

      // Check if any bookings conflict with the provided date and time
      if (filterDate && filterTime) {
        const filter = moment(
          `${filterDate.format("YYYY-MM-DD")}T${filterTime.format("HH:mm")}`
        );

        const hasConflict = park.dataValues.rentTime.some((booking) => {
          const startTime = moment(booking.startTime);
          const endTime = moment(booking.endTime);

          return filter.isBetween(startTime, endTime, null, "[)");
        });

        if (hasConflict) {
          satisfiesFilter = false;
        }
      }

      park.dataValues.satisfiesFilter = satisfiesFilter;
    }

    for (const park of parks) {
      let status = "free";

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

    // Clean up rentTime details for output
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

    // Filter out reserved parks if date and time are provided
    const filteredParks =
      filterDate && filterTime
        ? parks.filter((park) => park.dataValues.satisfiesFilter)
        : parks;

    req.final.data = { parks: filteredParks };
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
