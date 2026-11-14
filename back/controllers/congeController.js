const db = require('../db');

// Get all congés for all techniciens
exports.getAllConge = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.username AS technicien_username, u.email AS technicien_email
       FROM conges c
       JOIN users u ON c.technicien_id = u.id
       ORDER BY c.start_date DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching congés:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get all congés for a specific technicien
exports.getCongeByTechnicien = async (req, res) => {
  try {
    const technicienId = req.params.technicienId;
    const result = await db.query(
      `SELECT * FROM conges WHERE technicien_id = $1 ORDER BY start_date DESC`,
      [technicienId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching congés for technicien:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Responsable adds a new congé for a technicien
exports.addConge = async (req, res) => {
  try {
    const { technicien_id, start_date, end_date, reason } = req.body;
    const result = await db.query(
      `INSERT INTO conges (technicien_id, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [technicien_id, start_date, end_date, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding congé:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Delete a congé
exports.deleteConge = async (req, res) => {
  try {
    const congeId = req.params.id;
    await db.query('DELETE FROM conges WHERE id = $1', [congeId]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting congé:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
