const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'production';
const config = require('../config/database-config.json')[env];

config.logging = console.log

const db = {
    // sequelize: null, // assigned below
    Sequelize,
    logger : console,
    timeManager: require('../lib').timeManager
};

db.isDevMode = (env.toUpperCase() === 'DEVELOPMENT');
db.sequelize = new Sequelize(config.database, config.username, config.password, config);


db.sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

fs.readdirSync(__dirname) // import all models, name will be same as filename
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        try {
            //const model = db.sequelize['import'](path.join(__dirname, file));
            const model = require(path.join(__dirname, file))(db.sequelize, Sequelize.DataTypes)
            db[model.name] = model;
        } catch (err) {
            console.error(err)
        }
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;