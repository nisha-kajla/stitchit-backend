const db = require('../models');
const responseManager = require('../lib').responseManager;
const { SDKResult, ValidationError } = require('../lib').errors;
const { isValidEmail, hashPassword } = require('../lib').helper;
const { generateToken } = require('../lib').tokenManager;
const appConstants = require('../config/appConstants');

// Aliases
const OP = db.Sequelize.Op;

const createOrder = async (req, res) => {
    try {
        const { body, user, file } = req;
        if (!body.categoryId) {
            throw new ValidationError(`'categoryId' required`)
        } else if (!body.tailorId) {
            throw new ValidationError(`'tailorId' required`)
        } else if (!body.userAddressId) {
            throw new ValidationError(`'userAddressId' required`)
        }
        // else if (!file || !file.filename) {
        //     throw new ValidationError(`'file' required`)
        // }

        // create order in db
        const order = await db.order.create({ ...body, designImageName: file ? file.filename : null, userId : user.id });

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: order
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const editOrder = async (req, res) => {
    try {
        const { body, user, params, file } = req;

        let existingOrder = await db.order.getOneByCriteria({
            id: params.orderId
        });

        if (!existingOrder || !existingOrder.id) {
            throw new ValidationError(`invalid order`)
        }

        let dataToUpdate = body;

        if(file && file.filename){
            dataToUpdate.designImageName = file.filename;
        }

        // update order in db
        existingOrder = await existingOrder.update(dataToUpdate);

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: existingOrder
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const listOrder = async (req, res) => {
    try {
        const { user, query, sort, pagination } = req;

        if(!query){
            query = {};
        }

        if(user.type === appConstants.ENUMS.USER_TYPE.CUSTOMER){
            query.userId = user.id;
        }else if(user.type === appConstants.ENUMS.USER_TYPE.SERVICE_PROVIDER){
            query.tailorId = user.id;
        }

        const { count, rows } = await db.order.getListByCriteria(query, sort, pagination)


        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: {
                count,
                result: rows
            }
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { params } = req;

        await db.order.destroy({
            where: {
                id: params.orderId
            }
        });

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: {}
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};




module.exports = {
    createOrder,
    editOrder,
    listOrder,
    deleteOrder
};