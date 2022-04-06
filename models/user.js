const tm = require('../lib').timeManager;
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
            type: DataTypes.STRING(15),
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
                return tm.formatDatabaseDate(this.getDataValue('created_at'));
            }
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: function () {
                return tm.moment().format();
            },
            get() {
                return tm.formatDatabaseDate(this.getDataValue('updated_at'));
            }
        }
    }, {
        timestamps: true,
        freezeTableName: true
    });

    // Associations
    users.associate = function (models) {
        // participant_cards
        //users.hasOne(models.participant_cards, { as: "participant_card", foreignKey: "card_id", sourceKey: "card_id", onDelete: "RESTRICT" });
        // clipper_export_batch_cards
        //users.hasMany(models.clipper_export_batch_cards, { as: "clipper_batch_cards", foreignKey: "card_id", sourceKey: "card_id", onDelete: "RESTRICT" });

    };

    // Methods

    users.getUserDetailById = async (userId, t) => {
        return await users.findOne({
            where: {
                id : userId
            },
            transaction: t
        });
    };
  
   


    return users;
};