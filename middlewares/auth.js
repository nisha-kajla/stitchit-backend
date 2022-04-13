const { verifyToken } = require('../lib').tokenManager;
const { SDKResult, UnauthorizedError } = require('../lib').errors;
const responseManager = require('../lib').responseManager;
const appConstants = require('../config/appConstants');
const DefaultUnauthorizedError = `You are not authorized to perform this action`;

const verify = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            throw new UnauthorizedError(DefaultUnauthorizedError);
        } else {
            token = token.replace(/Bearer /i, '');
            const tokenData = verifyToken(token, req.type);
            if (tokenData) {
                req.user = tokenData;
                next();
            } else {
                throw new UnauthorizedError(DefaultUnauthorizedError);
            }
        }
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

module.exports = {
    verify
};