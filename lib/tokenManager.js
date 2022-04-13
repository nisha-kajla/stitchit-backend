const jwt = require('jsonwebtoken');

const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_KEY)
};

const verifyToken = (token, type) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log(decoded)
        if (decoded && (!type  || decoded.type === type)) {
            return decoded;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
};

module.exports = {
    generateToken,
    verifyToken
};