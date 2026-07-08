const express = require('express');
const salaryCoefficientController = require('../controllers/salary_coefficient.controller');

const router = express.Router();

router.get('/', salaryCoefficientController.getSalaryCoefficients);
router.post('/', salaryCoefficientController.createSalaryCoefficient);
router.put('/:id', salaryCoefficientController.updateSalaryCoefficient);


module.exports = router;