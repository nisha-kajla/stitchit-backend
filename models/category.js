const tm = require('../lib').timeManager;
const appConstants = require('../config/appConstants');
const ENUMS = appConstants.ENUMS;

module.exports = (sequelize, DataTypes) => {
    const category = sequelize.define('category', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        imageName: {
            type: DataTypes.STRING(255),
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
    category.associate = function (models) {
        // tailor categories
        category.hasMany(models.tailorCategories, { as: "tailorCategories", foreignKey: "categoryId", sourceKey: "id", onDelete: "RESTRICT" });
        // clipper_export_batch_cards
        //users.hasMany(models.clipper_export_batch_cards, { as: "clipper_batch_cards", foreignKey: "card_id", sourceKey: "card_id", onDelete: "RESTRICT" });
    };

    // Methods

    category.getOneByCriteria = async (criteria, t) => {
        return await category.findOne({
            where: criteria,
            transaction: t
        });
    };

    category.getListByCriteria = async (criteria,sort,pagination, t) => {
        return await category.findAndCountAll({
            where: criteria,
            order: [
                [sort.sortBy, sort.sortOrder]
            ],
            offset: pagination.skip,
            limit: pagination.limit,
            transaction: t
        });
    };

    return category;
};