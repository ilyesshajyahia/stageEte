const db = require('../db');

exports.getReport = async (req, res) => {
  const { range, date } = req.query;

  let dateFilter;
  let params = [];
  if (!date) {
    return res.status(400).json({ error: 'La date de référence est requise (format: YYYY-MM-DD)' });
  }

  switch (range) {
    case 'daily':
      dateFilter = "created_at::date = $1";
      params = [date];
      break;
    case 'weekly':
      dateFilter = "created_at::date BETWEEN $1 AND $2";
      params = [
        new Date(new Date(date).setDate(new Date(date).getDate() - 6)).toISOString().slice(0, 10),
        date
      ];
      break;
    case 'monthly': {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      dateFilter = "EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2";
      params = [year, month];
      break;
    }
    default:
      return res.status(400).json({ error: 'Intervalle invalide (daily, weekly, monthly)' });
  }

  try {
    const totalTickets = await db.query(`SELECT COUNT(*) FROM tickets WHERE ${dateFilter}`, params);
    const ticketsByType = await db.query(
      `SELECT type, COUNT(*) FROM tickets WHERE ${dateFilter} GROUP BY type`,
      params
    );
    const ticketsByStatus = await db.query(
      `SELECT status, COUNT(*) FROM tickets WHERE ${dateFilter} GROUP BY status`,
      params
    );
    const ticketsByTechnicien = await db.query(
      `SELECT assigned_to, COUNT(*) FROM tickets WHERE ${dateFilter} AND assigned_to IS NOT NULL GROUP BY assigned_to`,
      params
    );

    res.json({
      total: parseInt(totalTickets.rows[0].count),
      byType: ticketsByType.rows,
      byStatus: ticketsByStatus.rows,
      byTechnicien: ticketsByTechnicien.rows,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
