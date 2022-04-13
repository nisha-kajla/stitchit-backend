const db = require('../models');
const responseManager = require('../lib').responseManager;
const { SDKResult, ValidationError } = require('../lib').errors;
const { isValidEmail, hashPassword } = require('../lib').helper;
const { generateToken } = require('../lib').tokenManager;
const appConstants = require('../config/appConstants');

// Aliases
const OP = db.Sequelize.Op;

const addCategory = async (req, res) => {
    try {
        const { body, user, file } = req;
        if (!body.name) {
            throw new ValidationError(`'name' required`)
        }
        else if (!file || !file.filename) {
            throw new ValidationError(`'file' required`)
        }

        // create category in db
        const category = await db.category.create({ ...body, imageName: file.filename });

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: category
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const editCategory = async (req, res) => {
    try {
        const { body, user, params, file } = req;

        let existingCategory = await db.category.getOneByCriteria({
            id: params.categoryId
        });

        if (!existingCategory || !existingCategory.id) {
            throw new ValidationError(`invalid category`)
        }

        // update category in db
        existingCategory = await existingCategory.update({ ...body, imageName: file ? file.filename : existingCategory.imageName});

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: existingCategory
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const listCategory = async (req, res) => {
    try {
        const { user, query, sort, pagination } = req;

        const { count, rows } = await db.category.getListByCriteria(query, sort, pagination)


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

const deleteCategory = async (req, res) => {
    try {
        const { params } = req;

        await db.address.destroy({
            where: {
                id: params.categoryId
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
    addCategory,
    editCategory,
    listCategory,
    deleteCategory
};