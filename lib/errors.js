const _ = require('lodash');

/**
 * Returned by all public and some internal SDK methods.
 * @constructor
 * @param {SDKStatus} sdkStatus - PASS or FAIL
 * @param {Object} options
 * @param {boolean} options.success
 * @param {string=} options.caller - methodID of caller
 * @param {string=} options.message - returns either success or failure message
 * @param {Object=} options.data - may be returned when success=true
 * @param {Object=} err - a native Error object or one of the custom Error objects defined in this class
 * 
 * TODO: change to this format instead of setting success option:
 *  let PASS = true;
    let FAIL = false;
    let foo = new SDKResult(FAIL, {
      ...
    });
 */
let SDKResult = class SDKResult {
  constructor(sdkStatus, options, err) {
    this.success = sdkStatus;
    if (options.caller) {
      this.caller = options.caller;
    }
    if (options.message) {
      this.message = options.message;
    }
    if (options.data) {
      this.data = options.data;
    }
    if (err) {
      this.err = err;
    }
  }
};

// https://rclayton.silvrback.com/custom-errors-in-node-js

/**
 * Thrown when a requested record is not found.
 * @constructor
 * @param {string} message - contains error details
 */
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    // Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when input parameters(s) fail validation.
 * @constructor
 * @param {string} message - contains validation error message, will be comma delimited if returning multiple errors
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    // Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  SDKResult,
  NotFoundError,
  ValidationError
};