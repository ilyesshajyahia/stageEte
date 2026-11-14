const express = require('express');
const router = express.Router();
const congeController = require('../controllers/congeController');

// Get all congés (for responsables)
router.get('/', congeController.getAllConge);

// Get all congés for a specific technicien
router.get('/technicien/:technicienId', congeController.getCongeByTechnicien);

// Add a congé (responsable only)
router.post('/', congeController.addConge);

// Delete a congé
router.delete('/:id', congeController.deleteConge);

module.exports = router;
