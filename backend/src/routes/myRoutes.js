const express = require('express')

const myController = require('../controllers/myController');

const router = express.Router();

router.get('/', myController.vGSD30BizDoc);

module.exports = router;