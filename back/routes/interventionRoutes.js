const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');

router.get('/', interventionController.getAllInterventions);
router.get('/technicien/:techId', interventionController.getInterventionsByTech);
router.post('/', interventionController.createIntervention);

module.exports = router;
