const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/ticket/:ticketId', commentController.getCommentsByTicket);
router.post('/', commentController.addComment);

module.exports = router;
