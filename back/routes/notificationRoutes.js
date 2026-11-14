const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/user/:userId', notificationController.getNotificationsByUser);
router.post('/', notificationController.createNotification);
router.put('/:id/seen', notificationController.markAsSeen);
router.delete('/:id', notificationController.deleteNotification);

// Route to notify agent when ticket status changes
router.post('/notify/agent', async (req, res) => {
  const { ticketId, newStatus } = req.body;
  await notificationController.notifyAgentOnTicketStatusChange(ticketId, newStatus);
  res.json({ success: true });
});

// Route to notify tech when assigned a new ticket
router.post('/notify/tech', async (req, res) => {
  const { ticketId, techId } = req.body;
  await notificationController.notifyTechOnTicketAssigned(ticketId, techId);
  res.json({ success: true });
});

// Route to notify resp when new ticket or user is added
router.post('/notify/resp', async (req, res) => {
  const { type, id } = req.body;
  await notificationController.notifyRespOnNewTicketOrUser(type, id);
  res.json({ success: true });
});

module.exports = router;
