const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /reports?range=daily|weekly|monthly
router.get('/', reportController.getReport);

module.exports = router;
