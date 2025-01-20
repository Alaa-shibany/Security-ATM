const moment = require("moment");
const { Parking, Booking, User, Account } = require("../models");
const { isTimeIntersecting } = require("../utils");
const { Op } = require("sequelize");

async function createBooking(req, res, next) {
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

async function getMyBookings(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const userId = req.userId;
    const { search, date, time } = req.body;
    req.body = {};

    // Convert date and time to a moment object for filtering
    const filterDate = date ? moment(date, "YYYY-MM-DD") : null;
    const filterTime = time ? moment(time, "HH:mm") : null;

    const bookings = await Booking.findAll({
      include: [
        {
          model: Account,
          attributes: [],
          where: { userId },
          required: true,
          include: [{ model: User }],
        },
        {
          model: Parking,
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
          required: true,
        },
      ],
    });

    if (filterDate && filterTime) {
      const filter = moment(
        `${filterDate.format("YYYY-MM-DD")}T${filterTime.format("HH:mm")}`
      );
      for (const booking of bookings) {
        let satisfiesFilter = true;

        const startTime = moment(booking.startTime);
        const endTime = moment(booking.endTime);

        // Check if any bookings conflict with the provided date and time
        const hasConflict = filter.isBetween(startTime, endTime, null, "[)");

        if (hasConflict) {
          satisfiesFilter = false;
        }

        booking.dataValues.satisfiesFilter = satisfiesFilter;
      }
    }

    // Clean up rentTime details for output
    for (const booking of bookings) {
      const startTime = moment(booking.startTime);
      const endTime = moment(booking.endTime);
      booking.dataValues.startTime = startTime;
      booking.dataValues.duration = endTime.diff(startTime, "hours");
      delete booking.dataValues.endTime;
    }

    // Filter out reserved parks if date and time are provided
    const filteredBookings =
      filterDate && filterTime
        ? bookings.filter((booking) => booking.dataValues.satisfiesFilter)
        : bookings;

    req.final.data = { bookings: filteredBookings };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e.message };
    req.final.status = 500;
    return next();
  }
}

async function getUserBookings(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { userId, search, date, time } = req.body;
    req.body = {};

    // Convert date and time to a moment object for filtering
    const filterDate = date ? moment(date, "YYYY-MM-DD") : null;
    const filterTime = time ? moment(time, "HH:mm") : null;

    const bookings = await Booking.findAll({
      include: [
        {
          model: Account,
          attributes: [],
          where: { userId },
          required: true,
          include: [{ model: User }],
        },
        {
          model: Parking,
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
          required: true,
        },
      ],
    });

    if (filterDate && filterTime) {
      const filter = moment(
        `${filterDate.format("YYYY-MM-DD")}T${filterTime.format("HH:mm")}`
      );
      for (const booking of bookings) {
        let satisfiesFilter = true;

        const startTime = moment(booking.startTime);
        const endTime = moment(booking.endTime);

        // Check if any bookings conflict with the provided date and time
        const hasConflict = filter.isBetween(startTime, endTime, null, "[)");

        if (hasConflict) {
          satisfiesFilter = false;
        }

        booking.dataValues.satisfiesFilter = satisfiesFilter;
      }
    }

    // Clean up rentTime details for output
    for (const booking of bookings) {
      const startTime = moment(booking.startTime);
      const endTime = moment(booking.endTime);
      booking.dataValues.startTime = startTime;
      booking.dataValues.duration = endTime.diff(startTime, "hours");
      delete booking.dataValues.endTime;
    }

    // Filter out reserved parks if date and time are provided
    const filteredBookings =
      filterDate && filterTime
        ? bookings.filter((booking) => booking.dataValues.satisfiesFilter)
        : bookings;

    req.final.data = { bookings: filteredBookings };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e.message };
    req.final.status = 500;
    return next();
  }
}

async function getParkingBookings(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { parkId, search, date, time } = req.body;
    req.body = {};

    // Convert date and time to a moment object for filtering
    const filterDate = date ? moment(date, "YYYY-MM-DD") : null;
    const filterTime = time ? moment(time, "HH:mm") : null;

    const bookings = await Booking.findAll({
      where: { parkingId: parkId },
      include: [
        {
          model: Account,
          attributes: [],
          include: [{ model: User }],
        },
        {
          model: Parking,
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
          required: true,
        },
      ],
    });

    if (filterDate && filterTime) {
      const filter = moment(
        `${filterDate.format("YYYY-MM-DD")}T${filterTime.format("HH:mm")}`
      );
      for (const booking of bookings) {
        let satisfiesFilter = true;

        const startTime = moment(booking.startTime);
        const endTime = moment(booking.endTime);

        // Check if any bookings conflict with the provided date and time
        const hasConflict = filter.isBetween(startTime, endTime, null, "[)");

        if (hasConflict) {
          satisfiesFilter = false;
        }

        booking.dataValues.satisfiesFilter = satisfiesFilter;
      }
    }

    // Clean up rentTime details for output
    for (const booking of bookings) {
      const startTime = moment(booking.startTime);
      const endTime = moment(booking.endTime);
      booking.dataValues.startTime = startTime;
      booking.dataValues.duration = endTime.diff(startTime, "hours");
      delete booking.dataValues.endTime;
    }

    // Filter out reserved parks if date and time are provided
    const filteredBookings =
      filterDate && filterTime
        ? bookings.filter((booking) => booking.dataValues.satisfiesFilter)
        : bookings;

    req.final.data = { bookings: filteredBookings };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e.message };
    req.final.status = 500;
    return next();
  }
}

async function getAllBookings(req, res, next) {
  try {
    if (req.final.status !== 0) return next();
    const { search, date, time } = req.body;
    req.body = {};

    // Convert date and time to a moment object for filtering
    const filterDate = date ? moment(date, "YYYY-MM-DD") : null;
    const filterTime = time ? moment(time, "HH:mm") : null;

    const bookings = await Booking.findAll({
      include: [
        {
          model: Account,
          attributes: [],
          include: [{ model: User }],
        },
        {
          model: Parking,
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
          required: true,
        },
      ],
    });

    if (filterDate && filterTime) {
      const filter = moment(
        `${filterDate.format("YYYY-MM-DD")}T${filterTime.format("HH:mm")}`
      );
      for (const booking of bookings) {
        let satisfiesFilter = true;

        const startTime = moment(booking.startTime);
        const endTime = moment(booking.endTime);

        // Check if any bookings conflict with the provided date and time
        const hasConflict = filter.isBetween(startTime, endTime, null, "[)");

        if (hasConflict) {
          satisfiesFilter = false;
        }

        booking.dataValues.satisfiesFilter = satisfiesFilter;
      }
    }

    // Clean up rentTime details for output
    for (const booking of bookings) {
      const startTime = moment(booking.startTime);
      const endTime = moment(booking.endTime);
      booking.dataValues.startTime = startTime;
      booking.dataValues.duration = endTime.diff(startTime, "hours");
      delete booking.dataValues.endTime;
    }

    // Filter out reserved parks if date and time are provided
    const filteredBookings =
      filterDate && filterTime
        ? bookings.filter((booking) => booking.dataValues.satisfiesFilter)
        : bookings;

    req.final.data = { bookings: filteredBookings };
    req.final.status = 200;
    return next();
  } catch (e) {
    req.final.data = { error: e.message };
    req.final.status = 500;
    return next();
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getUserBookings,
  getParkingBookings,
  getAllBookings,
};
