const tm = require('../lib').timeManager;
const { hashPassword } = require('../lib').helper;
const appConstants = require('../config/appConstants');
const ENUMS = appConstants.ENUMS;

module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define('users', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phoneNo: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        profilePicName: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        lat: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        long: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM([
                ENUMS.USER_STATUS.PENDING,
                ENUMS.USER_STATUS.APPROVED,
                ENUMS.USER_STATUS.REJECTED]),
            allowNull: true
        },
        totalRating: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: 0
        },
        totalRatingUsers: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: 0
        },
        type: {
            type: DataTypes.ENUM([
                ENUMS.USER_TYPE.ADMIN,
                ENUMS.USER_TYPE.CUSTOMER,
                ENUMS.USER_TYPE.SERVICE_PROVIDER]),
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: function () {
                return tm.moment().format();
            },
            get() {
                return tm.formatDatabaseDate(this.getDataValue('createdAt'));
            }
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: function () {
                return tm.moment().format();
            },
            get() {
                return tm.formatDatabaseDate(this.getDataValue('updatedAt'));
            }
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        defaultScope: {
            attributes: { exclude: ['password'] }
        }
    });

    // Associations
    users.associate = function (models) {
        // participant_cards
        //users.hasOne(models.participant_cards, { as: "participant_card", foreignKey: "card_id", sourceKey: "card_id", onDelete: "RESTRICT" });
        // clipper_export_batch_cards
        //users.hasMany(models.clipper_export_batch_cards, { as: "clipper_batch_cards", foreignKey: "card_id", sourceKey: "card_id", onDelete: "RESTRICT" });
    };

    // hooks
    users.beforeCreate(async (user, options) => {
        user.password = hashPassword(user.password);
        user.email = user.email.toLowerCase().trim();
        user.status = user.type === ENUMS.USER_TYPE.SERVICE_PROVIDER ? ENUMS.USER_STATUS.PENDING : ENUMS.USER_STATUS.APPROVED;
    });

    users.afterCreate(async (user, options) => {
        delete user.password;
    });

    // Methods
    users.getUserDetailById = async (userId, t) => {
        return await users.findOne({
            where: {
                id: userId
            },
            transaction: t
        });
    };

    users.getOneByCriteria = async (criteria, t) => {
        return await users.findOne({
            where: criteria,
            transaction: t
        });
    };

    users.getListByCriteria = async (criteria,sort,pagination, t) => {
        return await users.findAndCountAll({
            where: criteria,
            order: [
                [sort.sortBy, sort.sortOrder]
            ],
            offset: pagination.skip,
            limit: pagination.limit,
            transaction: t
        });
    };




    return users;
};