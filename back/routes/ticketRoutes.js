const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.get('/user/:userId', ticketController.getTicketsByUser);
router.get('/assigned/:assignedId', ticketController.getTicketsByAssigned);
router.post('/', ticketController.createTicket);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);
router.put('/:id/assign', ticketController.assignTicket);


module.exports = router;
