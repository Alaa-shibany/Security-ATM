const moment = require("moment");

function isTimeIntersecting(times, startTime, endTime) {
  // Convert input times to moment objects
  const start = moment(startTime);
  const end = moment(endTime);

  // Loop through each time range in the array
  for (let time of times) {
    const timeStart = moment(time.startTime);
    const timeEnd = moment(time.endTime);

    // Check for intersection: if the given time range overlaps with any element in the array
    if (start.isBefore(timeEnd) && end.isAfter(timeStart)) {
      return true; // Intersection exists
    }
  }

  return false; // No intersection
}

module.exports = { isTimeIntersecting };
