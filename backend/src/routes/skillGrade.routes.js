const express = require('express');
const skillGradeController = require('../controllers/skillGrade.controller');

const router = express.Router();

router.get('/', skillGradeController.getSkillGrades);
router.post('/', skillGradeController.createSkillGrade);
router.put('/:id', skillGradeController.updateSkillGrade);


module.exports = router;