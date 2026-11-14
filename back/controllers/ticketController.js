const db = require('../db');
const notificationController = require('./notificationController');

exports.getAllTickets = async (req, res) => {
  const result = await db.query('SELECT * FROM tickets');
  res.json(result.rows);
};

exports.getTicketById = async (req, res) => {
  const result = await db.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
};

exports.getTicketsByUser = async (req, res) => {
  const result = await db.query('SELECT * FROM tickets WHERE created_by = $1', [req.params.userId]);
  res.json(result.rows);
};

exports.createTicket = async (req, res) => {
  const { type, description, created_by, priority } = req.body;
  // Find all techniciens ordered by id who are NOT in congé today
  const techsRes = await db.query(`
    SELECT id FROM users 
    WHERE UPPER(role) = 'TECHNICIEN' AND id NOT IN (
      SELECT technicien_id FROM conges 
      WHERE CURRENT_DATE BETWEEN start_date AND end_date
    )
    ORDER BY id ASC
  `);
  const techniciens = techsRes.rows;
  if (techniciens.length === 0) {
    return res.status(400).json({ error: 'Aucun technicien disponible (tous en congé)' });
  }
  // Find the last assigned technicien (by ticket id desc)
  const lastTicketRes = await db.query("SELECT assigned_to FROM tickets WHERE assigned_to IS NOT NULL ORDER BY id DESC LIMIT 1");
  let nextTech;
  if (!lastTicketRes.rows.length) {
    // No previous assignment, assign to first technicien
    nextTech = techniciens[0];
  } else {
    const lastTechId = lastTicketRes.rows[0].assigned_to;
    const lastIndex = techniciens.findIndex(t => t.id === lastTechId);
    if (lastIndex === -1 || lastIndex === techniciens.length - 1) {
      nextTech = techniciens[0];
    } else {
      nextTech = techniciens[lastIndex + 1];
    }
  }
  // Create the ticket and assign to next technicien
  const result = await db.query(
    `INSERT INTO tickets (type, description, status, created_by, priority, assigned_to, date_assigned)
     VALUES ($1, $2, 'EN_COURS', $3, $4, $5, NOW()) RETURNING *`,
    [type, description, created_by, priority, nextTech.id]
  );
  // Notify technicien and agent
  await notificationController.notifyTechOnTicketAssigned(result.rows[0].id);
  await notificationController.notifyAgentOnTicketStatusChange(result.rows[0].id, 'EN_COURS');
  res.status(201).json(result.rows[0]);
};

exports.updateTicket = async (req, res) => {
  const { type, description, status } = req.body;
  const result = await db.query(
    `UPDATE tickets
     SET type = $1, description = $2, status = $3, created_at = NOW()
     WHERE id = $4 RETURNING *`,
    [type, description, status, req.params.id]
  );
  // Notify agents on ticket status change
  await notificationController.notifyAgentOnTicketStatusChange(req.params.id, status);
  res.json(result.rows[0]);
};

exports.deleteTicket = async (req, res) => {
  await db.query('DELETE FROM tickets WHERE id = $1', [req.params.id]);
  res.sendStatus(204);
};

exports.assignTicket = async (req, res) => {
  const ticketId = req.params.id;
  try {
    const result = await db.query(
      `UPDATE tickets
       SET assigned_to = $1, status = 'EN_COURS', date_assigned = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.body.technicien_id, ticketId]
    );
    // Notify techniciens on ticket assignment
    await notificationController.notifyTechOnTicketAssigned(ticketId);
    // Notify agents on status change to EN_COURS
    await notificationController.notifyAgentOnTicketStatusChange(ticketId, 'EN_COURS');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur d\'assignation :', err);
    res.status(500).json({ error: 'Erreur lors de l\'assignation du ticket' });
  }
};

exports.getTicketsByAssigned = async (req, res) => {
  const assignedToId = req.params.assignedId;
  try {
    const result = await db.query('SELECT * FROM tickets WHERE assigned_to = $1', [assignedToId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des tickets assignés:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des tickets assignés' });
  }
};
