const validator = require("email-validator");

function isValidEmail(email){
    return validator.validate(email);
}

module.exports = {
    isValidEmail
}