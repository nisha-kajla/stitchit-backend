const moment = require('moment-timezone');

// https://momentjs.com/timezone/docs/#/using-timezones/default-timezone/
moment.tz.setDefault();

const getCurrentTimestamp = () => {
  return formatTimestamp(moment(), 'ms');
};

const convertUTCtoPST = (utcDate) => {
  return formatTimestamp(moment(utcDate), 'ms');
};

const convertPSTtoUTC = (pstDate) => { // not used yet
  return formatTimestamp(moment(pstDate).utc(), 'ms');
};

const formatDatabaseDate = (dt) => {
  // input value is: '2019-01-13T16:03:19.123Z'
  // return value should be: '2019-01-13T16:03:19-08:00'
  if (dt && dt.getFullYear) {
    return formatTimestamp(moment(dt));
  } else {
    return dt;
  }
};

const formatDatabaseDateWithMS = (dt) => {
  // input value is: '2019-01-13T16:03:19.123Z'
  // return value should be: '2019-01-13T16:03:19-08:00'
  if (dt && dt.getFullYear) {
    return formatTimestamp(moment(dt), 'ms');
  } else {
    return dt;
  }
};

const formatTimestamp = (_moment, _withMS) => {
  if (_withMS) {
    return _moment.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  } else {
    return _moment.format('YYYY-MM-DDTHH:mm:ssZ');
  }
};

const getCronTime = (hours, minutes, day) => {
  if (day) {
    return `${minutes} ${hours} ${day} * *`; // used by Monthly Permit autoload
  } else if (minutes === undefined) {
    return moment().hours(hours).format('* H * * *');
  } else {
    return moment().hours(hours).minutes(minutes).format('m H * * *');
  }
};

/**
* @params
* timeString type string ,example 05:00 AM or 06:00 PM
* 
* @return type integer, example 18000000
*/
const convertTimeStringToMilliseconds = (timeString) => {
  let splitTime = timeString.split(' ');

  if (splitTime.length !== 2 || ['AM','PM'].indexOf(splitTime[1]) === -1) {
    throw 'Please send valid time string,example 05:00 AM.';
  }

  let hourAndMinute = splitTime[0].split(':');

  if (hourAndMinute.length !== 2) {
    throw 'Please send valid time string,example 05:00 AM.';
  }

  // 3600000 = 60 * 60 * 1000
  // 60000 = 60 * 1000
  // 43200000 = 12 * 60 * 60 * 1000 -- this will be added in case of time is PM.

  return ((splitTime[1] === 'AM' && ((parseInt(hourAndMinute[0], 10) % 12) == 0)) ? 0 : parseInt(hourAndMinute[0], 10) * 3600000) + (parseInt(hourAndMinute[1], 10) * 60000) + ((splitTime[1] === 'PM' && ((parseInt(hourAndMinute[0], 10) % 12) != 0)) ? 43200000 : 0);
};



/**
* @function convertTimeStringToMinutes - This method is used to convert time string to minutes example 12:00 PM will return 720
*
* @description - In our case the day cycle is from 03:00 AM to 02:59 AM so the time after 12:00 AM will be count in next day.
*                So we will add minutes of one day directly, if the time lies between 12:00 AM to 02:00 AM .
*                By this way we will always get minutes greater for time between 12:00 AM to 02:59 AM as compared to
*                time between 03:00 AM to 11:59 PM
*
* @param {String} timeString      - This should be a valid time string example 02:00 AM , 11:45 PM
* @return {Number} timeToMinutes  - this method will return a number representing the minutes of passed timeString
*
*/
const convertTimeStringToMinutes = (timeString) => {
  let splitTime = timeString.split(' ');
  let regExpToVerifyTime = /^([1][0-2]|0?[0-9]):[0-5][0-9] (AM|PM)$/;
  let regExpToCheckNextDayTime = /^(12|0?[1-2]):[0-5][0-9] AM$/;
  let isNextDayTime = false;

  if (!regExpToVerifyTime.test(timeString)) {
    throw 'Please send valid time string,example 05:00 AM.';
  }

  if(regExpToCheckNextDayTime.test(timeString)){
    isNextDayTime = true;
  }

  let hourAndMinute = splitTime[0].split(':');
  let timeToMinutes = parseInt(hourAndMinute[1]);

  //  - 720 is complete one day minutes
  //  - we will add (720 * 2) = 1440 if the time string is between 12:00 AM to 02:59 AM
  //    because in our case the day cycle is from 03:00 AM to 02:59 AM so the time after
  //    12:00 AM will be count in next day. By this way we will always get minutes greater
  //    for time between 12:00 AM to 02:59 AM as compared to time between 03:00 AM to 11:59 PM

  if(isNextDayTime){
    if(splitTime[1] === 'AM' && ((parseInt(hourAndMinute[0], 10) % 12) == 0)){
      timeToMinutes += 720 + 720;
    }else{
      timeToMinutes += (hourAndMinute[0] * 60) + (1440);
    }
  }else{
    if(splitTime[1] === 'PM' && ((parseInt(hourAndMinute[0], 10) % 12) != 0)){
      timeToMinutes += (hourAndMinute[0] * 60) + 720 ;
    }else{
      timeToMinutes += (hourAndMinute[0] * 60);
    }
  }
  return timeToMinutes;
};


const formatDate = (date, format) => {
  return moment(date).format(format);
};

const formatDateNative = (date, format) => {
  return moment(date, format, true).format();
};

const hasLateEntryViolation = (reservation, parkingTransaction, timeAllowedToEnter, measurement, userDescription) => {
  let entry = moment(reservation.gateEntry.entry_timestamp, 'MM/DD/YYYY HH:mm:ss A')
  let payment = moment(parkingTransaction.timestamp, 'YYYY-MM-DD HH:mm:ss A')
  let entryMinutesAfterPayment = entry.diff(payment, measurement)

  return {
    hasViolation: entry.isAfter(payment) && entryMinutesAfterPayment > timeAllowedToEnter,
    description: `${userDescription} gate entry was ${entryMinutesAfterPayment} ${measurement} after payment, and limit is ${timeAllowedToEnter}`
  }
}

const getDateDifference = (date1,date2,differenceIn) => {
  return moment(date1).diff(date2,differenceIn);
};

const getStartDateBySubractingHour = (hoursToSubtract) => {
  return moment().subtract(hoursToSubtract, 'hour').startOf('hour').format();
};

const getEndDateBySubractingHour = (hoursToSubtract) => {
  return moment().subtract(hoursToSubtract, 'hour').endOf('hour').format();
};

const getStartDateBySubractingDay = (daysToSubtract) => {
  return moment().subtract(daysToSubtract, 'day').startOf('day').format();
};

const getEndDateBySubractingDay = (daysToSubtract) => {
  return moment().subtract(daysToSubtract, 'day').endOf('day').format();
};

const getStartDateBySubractingMonth = (monthToSubtract) => {
  return moment().subtract(monthToSubtract, 'month').startOf('month').format();
};

const getEndDateBySubractingMonth = (monthToSubtract) => {
  return moment().subtract(monthToSubtract, 'month').endOf('month').format();
};

const getCurrentDateTime = () => {
  return moment().format();
};

const subtractMonthFromDate = (monthToSubtract) => {
  return moment().subtract(monthToSubtract, 'month').format();
};

/**
 * Call this to get upcoming notification schedules
 * if we need to start notification process before the start time.
 */
const getUpcomingNotificationTime = () => {
  let interval = 5 // run every 5 minutes
  let now = moment().startOf('minute')
  return now.add(interval - (now.minute() % interval), 'minutes')
}

/**
 * Wait until x seconds before the next notification cycle before starting the notification process.
 */
const startAtNotificationTime = async (callback, options) => {
  let now = moment()
  let secondsBefore = 3

  options.startTime = getUpcomingNotificationTime()
  let diffMilliSeconds = options.startTime.diff(now.add(secondsBefore, 'seconds'))
  console.log(`${now.format('HH:mm:ss.SSS')} - waiting ${moment(diffMilliSeconds).format('mm:ss.SSS')} to prepare and send ${options.notification_type} notifications at ${secondsBefore} seconds before ${options.startTime.format('HH:mm')}`)
  await delay(diffMilliSeconds)
  await callback(options)
}

/**
 * https://stackoverflow.com/questions/50091857/how-to-settimeout-on-async-await-call-node
 */
const delay = (t, val) => {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(val)
    }, t)
  })
}

const stringToDate = (dateStr) => {
  return moment(dateStr, 'YYYY-MM-DD')
};

const asMomentDate = (dt) => {
  return typeof dt === 'string' ? stringToDate(dt) : dt
}

const isDayBetween = (dt, startDate, endDate) => {
  // '[]' means "also includes from and to dates"
  return asMomentDate(dt).isBetween(asMomentDate(startDate), asMomentDate(endDate), 'day', '[]')
}

const isMonthBetween = (dt, startDate, endDate) => {
  // '[]' means "also includes from and to dates"
  return asMomentDate(dt).isBetween(asMomentDate(startDate), asMomentDate(endDate), 'month', '[]')
}

/**
 * Create an object for each day in the range, used in permits.getPermitFees()
 */
const _addDayInfo = (data, momentDate) => {
  data.days[momentDate.format('YYYY-MM-DD')] = {}
}


const _parseMonthlyPermitDateRange = (options, dateRanges) => {
  let dates = []
  let endDate = null
  let parts = dateRanges[0].split('~')
  let startDate = moment(parts[0])

  // If the purchase is done within the parking window 
  // then the prorated amount should include today, 
  // else it should bill from tomorrow.

  if (options.isAfterReservationWindow) {
    startDate = moment(startDate).add(1, 'day')
    options.date_range = startDate.format('YYYY-MM-DD')
  }

  if (startDate.date() >= options.monthlyPermitFirstAutoloadAttemptDay) { // on or after the 15th
    options.is_prorated = true
    endDate = moment(startDate).add(1, 'month').endOf('month')
  } else {
    endDate = moment(startDate).endOf('month')
  }

  dates.push({
    start_date: startDate,
    end_date: endDate
  })

  // include the computed end date
  options.end_date = endDate.format('YYYY-MM-DD')

  return dates
}

module.exports = {
  moment,
  formatDate,
  formatTimestamp,
  asMomentDate,
  isDayBetween,
  isMonthBetween,
  stringToDate,
  formatDateNative,
  formatTimestamp,
  getDateDifference,
  getCronTime,
  convertUTCtoPST,
  convertPSTtoUTC,
  getCurrentTimestamp,
  formatDatabaseDate,
  formatDatabaseDateWithMS,
  convertTimeStringToMilliseconds,
  convertTimeStringToMinutes,
  getStartDateBySubractingHour,
  getEndDateBySubractingHour,
  getStartDateBySubractingDay,
  getEndDateBySubractingDay,
  getStartDateBySubractingMonth,
  getEndDateBySubractingMonth,
  getCurrentDateTime,
  subtractMonthFromDate,
  hasLateEntryViolation,
  getUpcomingNotificationTime,
  startAtNotificationTime
};
