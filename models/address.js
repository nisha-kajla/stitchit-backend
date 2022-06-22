const tm = require('../lib').timeManager;
const appConstants = require('../config/appConstants');
const ENUMS = appConstants.ENUMS;

module.exports = (sequelize, DataTypes) => {
    const address = sequelize.define('address', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        address: { 
            type: DataTypes.TEXT,
            allowNull: false
        },
        city: { 
            type: DataTypes.STRING(100),
            allowNull: false
        },
        state: { 
            type: DataTypes.STRING(50),
            allowNull: false
        },
        country: { 
            type: DataTypes.STRING(50),
            allowNull: false
        },
        phoneNo: { 
            type: DataTypes.STRING(15),
            allowNull: false
        },
        userId: { 
            type: DataTypes.BIGINT,
            allowNull: false
        },
        isDefault: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue  :false
        },
        lat: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        long: {
            type: DataTypes.DECIMAL(5, 2),
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
    address.associate = function (models) {
       // users
       address.belongsTo(models.users, { as: "user", foreignKey: "userId", sourceKey: "id", onDelete: "RESTRICT" });
       // orders
       address.hasMany(models.order, { as: "orders", foreignKey: "userAddressId", sourceKey: "id", onDelete: "RESTRICT" });
    };

    // Methods

    address.getOneByCriteria = async (criteria, t) => {
        return await address.findOne({
            where: criteria,
            transaction: t
        });
    };

    address.getListByCriteria = async (criteria,sort,pagination, t) => {
        return await address.findAndCountAll({
            where: criteria,
            order: [
                [sort.sortBy, sort.sortOrder]
            ],
            offset: pagination.skip,
            limit: pagination.limit,
            transaction: t
        });
    };

    return address;
};