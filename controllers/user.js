const db = require('../models');
const responseManager = require('../lib').responseManager;
const { SDKResult, ValidationError } = require('../lib').errors;
const { isValidEmail } = require('../lib').helper;
const appConstants = require('../config/appConstants')


const register = async (req, res) => {
    try {
        console.log(req.body);
        const { body } = req;
        if (!body.firstName) {
            throw new ValidationError(`'firstName' required`)
        } 
        else if(!body.lastName){
            throw new ValidationError(`'lastname' required`)
        }
        else if(!body.email){
            throw new ValidationError(`'email' required`)
        }else if(!isValidEmail(body.email)){
            throw new ValidationError(`'email' is invalid`)
        }
        else if(!body.password){
            throw new ValidationError(`'password' required`)
        }
        else if(!('lat' in body)){
            throw new ValidationError(`'lat' required`)
        }
        else if(!('long' in body)){
            throw new ValidationError(`'long' required`)
        }
        else if(!body.type){
            throw new ValidationError(`type' required`)
        }else if(!Object.values(appConstants.ENUMS.USER_TYPE).includes(body.type)){
            throw new ValidationError(`type' is invalid`)
        }

        // check email exist or not in db
        const existUser = await db.users.findOne({
            where : {
                email : body.email.trim().toLowerCase()
            }
        });

        if(existUser && existUser.id){
            throw new ValidationError(`please use another email`)

        }

        // create user in db
        await db.users.create(body);


        
        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: {}
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

module.exports = {
    register
};