const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/average-assignment-to-intervention', statsController.getAverageAssignmentToInterventionTime);

module.exports = router;
