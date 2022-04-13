const express = require('express');
const { category } = require('../controllers');
const { auth, file } = require('../middlewares');
const router = express.Router();
const appConstants = require('../config/appConstants');



router.get('/',auth.verify, category.listCategory);

router.use((req, res, next) => {
    req.type = appConstants.ENUMS.USER_TYPE.ADMIN;
    next();
});

router.post('/',auth.verify, file.upload.single('file'), category.addCategory);
router.put('/:categoryId',auth.verify, category.editCategory);
router.delete('/:categoryId',auth.verify, category.deleteCategory);

router.use((req, res, next) => {
    req.type = appConstants.ENUMS.USER_TYPE.SERVICE_PROVIDER;
    next();
});

router.get('/choose',auth.verify, category.listCategoryToAddForTailor);


module.exports = router;
