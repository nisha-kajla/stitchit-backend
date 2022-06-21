const express = require('express');
const { order } = require('../controllers');
const { auth, file } = require('../middlewares');
const router = express.Router();
const appConstants = require('../config/appConstants');



router.get('/',auth.verify, order.listOrder);
router.put('/:orderId',auth.verify, file.upload.single('file'), order.editOrder);
router.delete('/:orderId',auth.verify, order.deleteOrder);

// router.use((req, res, next) => {
//     req.type = appConstants.ENUMS.USER_TYPE.CUSTOMER;
//     next();
// });

router.post('/',auth.verify, file.upload.single('file'), order.createOrder);


module.exports = router;
