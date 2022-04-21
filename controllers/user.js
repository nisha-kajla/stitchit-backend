const db = require('../models');
const responseManager = require('../lib').responseManager;
const { SDKResult, ValidationError } = require('../lib').errors;
const { isValidEmail, hashPassword } = require('../lib').helper;
const { generateToken } = require('../lib').tokenManager;
const appConstants = require('../config/appConstants');

// Aliases
const OP = db.Sequelize.Op;


const register = async (req, res) => {
    try {
        const { body, file } = req;
        if (!body.firstName) {
            throw new ValidationError(`'firstName' required`)
        }
        else if (!body.lastName) {
            throw new ValidationError(`'lastname' required`)
        }
        else if (!body.email) {
            throw new ValidationError(`'email' required`)
        } else if (!isValidEmail(body.email)) {
            throw new ValidationError(`'email' is invalid`)
        }
        else if (!body.password) {
            throw new ValidationError(`'password' required`)
        }
        else if (!('lat' in body)) {
            throw new ValidationError(`'lat' required`)
        }
        else if (!('long' in body)) {
            throw new ValidationError(`'long' required`)
        }
        else if (!body.type) {
            throw new ValidationError(`type' required`)
        } else if (!Object.values(appConstants.ENUMS.USER_TYPE).includes(body.type)) {
            throw new ValidationError(`type' is invalid`)
        }

        // check email exist or not in db
        const existUser = await db.users.getOneByCriteria({
            email: body.email.trim().toLowerCase()
        });

        if (existUser && existUser.id) {
            throw new ValidationError(`please use another email`)
        }

        // create user in db
        const user = await db.users.create({ ...body, profilePicName: file ? file.filename : null });

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: user
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};


const login = async (req, res) => {
    try {
        const { body } = req;
        if (!body.email) {
            throw new ValidationError(`'email' required`)
        } else if (!isValidEmail(body.email)) {
            throw new ValidationError(`'email' is invalid`)
        }
        else if (!body.password) {
            throw new ValidationError(`'password' required`)
        }

        // check email exist or not in db
        const user = await db.users.getOneByCriteria({
            email: body.email.trim().toLowerCase(),
            password: hashPassword(body.password.trim())
        });

        if (!user || !user.id) {
            throw new ValidationError(`invalid credentials`)
        }

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: {
                ...user.dataValues,
                token: generateToken({ id: user.id, type: user.type })
            }
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};


const profile = async (req, res) => {
    try {
        const { user } = req;
        if (!user) {
            throw new ValidationError(`'user' required`)
        }

        // check email exist or not in db
        const userProfile = await db.users.getOneByCriteria({
            id: user.id
        });

        if (!userProfile || !userProfile.id) {
            throw new ValidationError(`invalid user`)
        }

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: userProfile
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const editProfile = async (req, res) => {
    try {
        const { body, file, user } = req;

        let existingUser = await db.users.getOneByCriteria({
            id: user.id
        });

        if (!existingUser || !existingUser.id) {
            throw new ValidationError(`invalid user`)
        }

        if (body.email) {

            if (!isValidEmail(body.email)) {
                throw new ValidationError(`'email' is invalid`)
            }

            // check email exist or not in db
            const existUserWithThisEmail = await db.users.getOneByCriteria({
                email: body.email.trim().toLowerCase(),
                id: {
                    [OP.ne]: user.id
                }
            });

            if (existUserWithThisEmail && existUserWithThisEmail.id) {
                throw new ValidationError(`please use another email`)
            }
        }

        // update user in db
        let dataToUpdate = { ...body, profilePicName: file ? file.filename : null };

        existingUser = await existingUser.update(dataToUpdate);

        delete existingUser.dataValues.password;

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: existingUser
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const updateUser = async (req, res) => {
    try {
        const { body, params } = req;

        let existingUser = await db.users.getOneByCriteria({
            id: params.userId
        });

        if (!existingUser || !existingUser.id) {
            throw new ValidationError(`invalid user`)
        }

        // update user in db
        let dataToUpdate = {};

        if (body.status) {
            dataToUpdate.status = body.status
        }

        existingUser = await existingUser.update(dataToUpdate);

        delete existingUser.dataValues.password;

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: existingUser
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const listUsers = async (req, res) => {
    try {
        const { user, query, sort, pagination } = req;

        const { count, rows } = await db.users.getListByCriteria(query, sort, pagination)

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


const addAddress = async (req, res) => {
    try {
        const { body, user } = req;
        if (!body.address) {
            throw new ValidationError(`'address' required`)
        }
        else if (!body.city) {
            throw new ValidationError(`'city' required`)
        }
        else if (!body.state) {
            throw new ValidationError(`'state' required`)
        }
        else if (!body.country) {
            throw new ValidationError(`'country' required`)
        }
        else if (!body.phoneNo) {
            throw new ValidationError(`phoneNo' required`)
        }
        // make all other addresses isDefault=false if current is isDefault=true 
        if (body.isDefault) {
            await db.address.update({ isDefault: false }, { where: { isDefault: true, userId: user.id } })
        }

        body.userId = user.id;

        // create address in db
        const address = await db.address.create(body);

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: address
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const editAddress = async (req, res) => {
    try {
        const { body, user, params } = req;

        let existingAddress = await db.address.getOneByCriteria({
            id: params.addressId
        });

        if (!existingAddress || !existingAddress.id) {
            throw new ValidationError(`invalid address`)
        }

        // make all other addresses isDefault=false if current is isDefault=true 
        if (body.isDefault) {
            await db.address.update({ isDefault: false }, { where: { isDefault: true, userId: user.id } })
        }

        // update address in db
        existingAddress = await existingAddress.update(body);

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: existingAddress
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const listAddresss = async (req, res) => {
    try {
        const { user, query, sort, pagination } = req;

        const { count, rows } = await db.address.getListByCriteria(query, sort, pagination)


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

const deleteAddress = async (req, res) => {
    try {
        const { params } = req;

        await db.address.destroy({
            where: {
                id: params.addressId
            }
        });

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: {}
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};


// tailor categories
const addTailorCategory = async (req, res) => {
    try {
        const { body, user } = req;
        if (!body.categoryId) {
            throw new ValidationError(`'categoryId' required`)
        } else if (!body.minPrice) {
            throw new ValidationError(`'minPrice' required`)
        } else if (!body.maxPrice) {
            throw new ValidationError(`'maxPrice' required`)
        }

        // create in db
        const category = await db.tailorCategories.create({ ...body, tailorId: user.id });

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: category
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const editTailorCategory = async (req, res) => {
    try {
        const { body, user, params } = req;

        let existingTailorCategory = await db.tailorCategories.getOneByCriteria({
            id: params.tailorCategoryId
        });

        if (!existingTailorCategory || !existingTailorCategory.id) {
            throw new ValidationError(`invalid category`)
        }

        // update category in db
        existingTailorCategory = await existingTailorCategory.update(body);

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: existingTailorCategory
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const listTailorCategory = async (req, res) => {
    try {
        const { user, query, sort, pagination } = req;

        const { count, rows } = await db.tailorCategories.getListByCriteria(query, sort, pagination)


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

const deleteTailorCategory = async (req, res) => {
    try {
        const { params } = req;

        await db.tailorCategories.destroy({
            where: {
                id: params.tailorCategoryId
            }
        });

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: {}
        }));
    } catch (err) {
        responseManager.handleError(res, err);
    }
};

const listTailorsByCategory = async (req, res) => {
    try {
        const { user, query, params, sort, pagination } = req;

        if (!('lat' in query)) {
            throw new ValidationError(`'lat' required`)
        }
        else if (!('long' in query)) {
            throw new ValidationError(`'long' required`)
        }
        else if (!params.categoryId) {
            throw new ValidationError(`categoryId' required`)
        }

        const { count, rows } = await db.tailorCategories.getTailorListByByCategory({ ...params, ...query }, sort, pagination)

        responseManager.sendResponse(res, 200, new SDKResult(true, {
            data: {
                count,
                result: rows
            }
        }));
    } catch (err) {
        console.log(err);
        responseManager.handleError(res, err);
    }
};




module.exports = {
    register,
    login,
    profile,
    editProfile,
    updateUser,
    listUsers,
    addAddress,
    editAddress,
    listAddresss,
    deleteAddress,
    addTailorCategory,
    editTailorCategory,
    listTailorCategory,
    deleteTailorCategory,
    listTailorsByCategory
};