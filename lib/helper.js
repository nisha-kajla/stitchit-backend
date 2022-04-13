const validator = require("email-validator");
const md5 = require('md5');

function isValidEmail(email){
    return validator.validate(email);
}

function hashPassword(password){
    return md5(password.trim());
}

module.exports = {
    isValidEmail,
    hashPassword
}