const express = require('express');
const { category } = require('../controllers');
const { auth, file } = require('../middlewares');
const router = express.Router();
const appConstants = require('../config/appConstants');


router.use(auth.verify);

router.get('/', category.listCategory);

router.use((req, res, next) => {
    req.type = appConstants.ENUMS.USER_TYPE.ADMIN;
    next();
});

router.post('/', file.upload.single('file'), category.addCategory);
router.put('/:categoryId', category.editCategory);
router.delete('/:categoryId', category.deleteCategory);


module.exports = router;
