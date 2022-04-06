const { ValidationError, SDKResult } = require('./errors');

const handleError = (res, err) => {
    if (err instanceof ValidationError) {
        return sendResponse(res, 400, new SDKResult(false, {
            message: err.message
        }, err))
    } else {
        return sendResponse(res, 500, new SDKResult(false, {
            message: err.message
        }, err))
    }
};

const sendResponse = (res, status, sdkResult) => {
    res.status(status).json(sdkResult);
};

module.exports = {
    handleError,
    sendResponse
};