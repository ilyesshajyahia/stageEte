const db = require('../db');

exports.getAverageAssignmentToInterventionTime = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        AVG(EXTRACT(EPOCH FROM (i.performed_at - t.date_assigned))) AS avg_seconds
      FROM tickets t
      JOIN interventions i ON t.id = i.ticket_id
      WHERE t.date_assigned IS NOT NULL AND i.performed_at IS NOT NULL
    `);
    const avgSeconds = result.rows[0].avg_seconds;
    let avgTime = null;
    if (avgSeconds !== null) {
      // Convert seconds to HH:MM:SS
      const hours = Math.floor(avgSeconds / 3600);
      const minutes = Math.floor((avgSeconds % 3600) / 60);
      const seconds = Math.floor(avgSeconds % 60);
      avgTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    res.json({ avg_seconds: avgSeconds, avg_time: avgTime });
  } catch (err) {
    console.error('Erreur lors du calcul du temps moyen:', err);
    res.status(500).json({ error: 'Erreur serveur lors du calcul du temps moyen' });
  }
};
