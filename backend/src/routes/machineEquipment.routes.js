const express = require('express');
const machineEquipmentController = require('../controllers/machineEquipment.controller');

const router = express.Router();

router.get('/', machineEquipmentController.getMachineEquipments);
router.get('/test', machineEquipmentController.getMachineEquiments_Test);
router.post('/', machineEquipmentController.createMachineEquipment);
router.put('/:id', machineEquipmentController.updateMachineEquipment);
router.delete('/:id', machineEquipmentController.deactivateMachineEquipment);

module.exports = router;