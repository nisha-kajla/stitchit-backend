const tm = require('../lib').timeManager;
const appConstants = require('../config/appConstants');
const ENUMS = appConstants.ENUMS;

module.exports = (sequelize, DataTypes) => {
    const order = sequelize.define('order', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tailorId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        userAddressId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        designImageName: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        serviceAmount: {
            type: DataTypes.DECIMAL(7, 2),
            allowNull: true
        },
        adminAmount: {
            type: DataTypes.DECIMAL(7, 2),
            allowNull: true
        },
        totalAmount: {
            type: DataTypes.DECIMAL(7, 2),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM(Object.values(ENUMS.ORDER_STATUS)),
            allowNull: true,
            defaultValue : ENUMS.ORDER_STATUS.PENDING
        },
        ratingForUser: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        reviewForUser: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ratingForServiceProvider: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        reviewForServiceProvider: {
            type: DataTypes.TEXT,
            allowNull: true
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
        freezeTableName: true
    });

    // Associations
    order.associate = function (models) {
        // users
        order.belongsTo(models.users, { as: "user", foreignKey: "userId", sourceKey: "id", onDelete: "RESTRICT" });
        // user address
        order.belongsTo(models.address, { as: "address", foreignKey: "userAddressId", sourceKey: "id", onDelete: "RESTRICT" });
        // users tailor
        order.belongsTo(models.users, { as: "tailor", foreignKey: "tailorId", sourceKey: "id", onDelete: "RESTRICT" });
        // category
        order.belongsTo(models.category, { as: "category", foreignKey: "categoryId", sourceKey: "id", onDelete: "RESTRICT" });
    };

    // Methods

    order.getOneByCriteria = async (criteria, t) => {
        return await order.findOne({
            where: criteria,
            include: [
                {
                    as: 'user',
                    model: global.db.users
                },
                {
                    as: 'address',
                    model: global.db.address
                }
                , {
                    as: 'tailor',
                    model: global.db.users
                },
                {
                    as: 'category',
                    model: global.db.category
                }],
            transaction: t
        });
    };

    order.getListByCriteria = async (criteria, sort, pagination, t) => {
        return await order.findAndCountAll({
            where: criteria,
            include: [
                {
                    as: 'user',
                    model: global.db.users
                },
                {
                    as: 'address',
                    model: global.db.address
                },
                {
                    as: 'tailor',
                    model: global.db.users
                },
                {
                    as: 'category',
                    model: global.db.category
                }],
            order: [
                [sort.sortBy, sort.sortOrder]
            ],
            offset: pagination.skip,
            limit: pagination.limit,
            transaction: t
        });
    };

    return order;
};