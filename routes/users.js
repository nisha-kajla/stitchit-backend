const express = require('express');
const { user } = require('../controllers');
const router = express.Router();
const controller = require('../controllers').user;


router.post('/', user.register);

router.get('/profile', function(req, res, next) {
  console.log('data',req.body);
  res.send('respond with a resource');
});

module.exports = router;
