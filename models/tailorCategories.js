const tm = require('../lib').timeManager;
const appConstants = require('../config/appConstants');
const ENUMS = appConstants.ENUMS;

module.exports = (sequelize, DataTypes) => {
    const tailorCategories = sequelize.define('tailorCategories', {
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
        minPrice: {
            type: DataTypes.DECIMAL(7, 2),
            allowNull: false
        },
        maxPrice: {
            type: DataTypes.DECIMAL(7, 2),
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
        freezeTableName: true
    });

    // Associations
    tailorCategories.associate = function (models) {
        // users
        tailorCategories.belongsTo(models.users, { as: "tailor", foreignKey: "tailorId", sourceKey: "id", onDelete: "RESTRICT" });
        // category
        tailorCategories.belongsTo(models.category, { as: "category", foreignKey: "categoryId", sourceKey: "id", onDelete: "RESTRICT" });
    };

    // Methods

    tailorCategories.getOneByCriteria = async (criteria, t) => {
        return await tailorCategories.findOne({
            where: criteria,
            include: [{
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

    tailorCategories.getListByCriteria = async (criteria, sort, pagination, t) => {
        return await tailorCategories.findAndCountAll({
            where: criteria,
            include: [{
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

    tailorCategories.getAlreadyAddedCategoryIds = async (userId, t) => {
        const categories = await tailorCategories.findAll({
            where: {
                tailorId: userId
            },
            transaction: t
        });

        if (categories && categories.length) {
            return categories.map(category => category.id);
        } else {
            return [];
        }
    };

    tailorCategories.getTailorListByByCategory = async (criteria, sort, pagination, t) => {
        return await tailorCategories.findAndCountAll({
            where: {
                categoryId: criteria.categoryId
            },
            include: [{
                as: 'tailor',
                model: global.db.users,
                attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'phoneNo',
                    'password',
                    'profilePicName',
                    'lat',
                    'long',
                    'status',
                    'totalRating',
                    'totalRatingUsers',
                    'type',
                    'createdAt',
                    'updatedAt',
                    [sequelize.literal("6371 * acos(cos(radians(" + criteria.lat + ")) * cos(radians('lat')) * cos(radians(" + criteria.long + ") - radians('long')) + sin(radians(" + criteria.lat + ")) * sin(radians('lat')))"), 'distance'],

                ],
            },
            {
                as: 'category',
                model: global.db.category
            }],
            order: sequelize.literal('`tailor.distance` asc'),
            offset: pagination.skip,
            limit: pagination.limit,
            transaction: t
        });
    };

    return tailorCategories;
};