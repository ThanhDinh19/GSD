const express = require('express');
const userController = require('../controllers/user_test.controller');


const router = express.Router();

router.post('/', userController.addUser);
router.get('/', userController.getUser);


module.exports = router;