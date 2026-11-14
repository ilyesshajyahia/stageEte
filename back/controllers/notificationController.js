const db = require('../db');
const mailer = require('../utils/mailer');

// Get all notifications for a specific user
exports.getNotificationsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  const { user_id, message } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mark a notification as seen
exports.markAsSeen = async (req, res) => {
  const notificationId = req.params.id;

  try {
    const result = await db.query(
      `UPDATE notifications
       SET seen = TRUE
       WHERE id = $1
       RETURNING *`,
      [notificationId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error marking notification as seen:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  const notificationId = req.params.id;

  try {
    await db.query(`DELETE FROM notifications WHERE id = $1`, [notificationId]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Helper: Notify agent(s) when their ticket status changes
exports.notifyAgentOnTicketStatusChange = async (ticketId, newStatus) => {
  try {
    // Find the agent who owns the ticket
    const ticketRes = await db.query("SELECT created_by FROM tickets WHERE id = $1", [ticketId]);
    const agentId = ticketRes.rows[0]?.created_by;
    if (!agentId) return;
    const agentRes = await db.query("SELECT id, email FROM users WHERE id = $1 AND UPPER(role) = 'AGENT'", [agentId]);
    const agent = agentRes.rows[0];
    if (!agent) return;
    const message = `Le statut d'un ticket #${ticketId} a changé à : ${newStatus}`;
    await db.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [agent.id, message]
    );
    if (agent.email) {
      console.log('Sending agent email to:', agent.email);
      try {
        await mailer.sendMail({
          to: agent.email,
          subject: `Changement de statut du ticket #${ticketId}`,
          text: message
        });
      } catch (err) {
        console.error('Mailer error:', err);
      }
    }
  } catch (err) {
    console.error('Erreur notification agent:', err);
  }
};

// Helper: Notify tech(s) when assigned a new ticket
exports.notifyTechOnTicketAssigned = async (ticketId) => {
  try {
    // Find the assigned technicien for the ticket
    const ticketRes = await db.query("SELECT assigned_to FROM tickets WHERE id = $1", [ticketId]);
    const techId = ticketRes.rows[0]?.assigned_to;
    if (!techId) return;
    const techRes = await db.query("SELECT id, email FROM users WHERE id = $1 AND UPPER(role) = 'TECHNICIEN'", [techId]);
    const tech = techRes.rows[0];
    if (!tech) return;
    const message = `Un nouveau ticket #${ticketId} vous a été assigné.`;
    await db.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
      [tech.id, message]
    );
    if (tech.email) {
      console.log('Sending technicien email to:', tech.email);
      try {
        await mailer.sendMail({
          to: tech.email,
          subject: `Nouveau ticket assigné #${ticketId}`,
          text: message
        });
      } catch (err) {
        console.error('Mailer error:', err);
      }
    }
  } catch (err) {
    console.error('Erreur notification technicien:', err);
  }
};

// Helper: Notify responsable(s) when new ticket or user is added
exports.notifyRespOnNewTicketOrUser = async (type, id) => {
  try {
    // Find all RESPONSABLE users
    const resps = await db.query("SELECT id, email FROM users WHERE UPPER(role) = 'RESPONSABLE' AND email IS NOT NULL");
    const message = type === 'ticket'
      ? `Nouveau ticket créé: #${id}`
      : `Nouvel utilisateur ajouté: #${id}`;
    for (const resp of resps.rows) {
      await db.query(
        `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
        [resp.id, message]
      );
      if (resp.email) {
        console.log('Sending responsable email to:', resp.email);
        try {
          await mailer.sendMail({
            to: resp.email,
            subject: type === 'ticket' ? `Nouveau ticket créé #${id}` : `Nouvel utilisateur ajouté #${id}`,
            text: message
          });
        } catch (err) {
          console.error('Mailer error:', err);
        }
      }
    }
  } catch (err) {
    console.error('Erreur notification responsable:', err);
  }
};
