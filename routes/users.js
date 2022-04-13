const express = require('express');
const { user } = require('../controllers');
const { auth, file } = require('../middlewares');
const router = express.Router();
const appConstants = require('../config/appConstants');


router.post('/', file.upload.single('file'), user.register);
router.post('/login', user.login);

router.get('/', auth.verify, user.profile);
router.put('/', auth.verify, file.upload.single('file'), user.editProfile);

// addresses

router.post('/address/', auth.verify, user.addAddress);
router.put('/address/:addressId', auth.verify, user.editAddress);
router.get('/address/', auth.verify, user.listAddresss);
router.delete('/address/:addressId', auth.verify, user.deleteAddress);

router.use((req, res, next) => {
  req.type = appConstants.ENUMS.USER_TYPE.SERVICE_PROVIDER;
  next();
});

// tailor categories
router.post('/category/', auth.verify, user.addTailorCategory);
router.put('/category/:tailorCategoryId', auth.verify, user.editTailorCategory);
router.get('/category/', auth.verify, user.listTailorCategory);
router.delete('/category/:tailorCategoryId', auth.verify, user.deleteTailorCategory);


router.use((req, res, next) => {
  req.type = appConstants.ENUMS.USER_TYPE.ADMIN;
  next();
});

router.put('/update/:userId', auth.verify, user.updateUser);
router.get('/list', auth.verify, user.listUsers);

module.exports = router;
