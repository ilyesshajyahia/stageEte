const db = require('../db');

  exports.getAllInterventions = async (req, res) => {
    const result = await db.query('SELECT * FROM interventions');
    res.json(result.rows);
  };

exports.getInterventionsByTech = async (req, res) => {
  const result = await db.query(
    'SELECT * FROM interventions WHERE technicien_id = $1',
    [req.params.techId]
  );
  res.json(result.rows);
};

exports.createIntervention = async (req, res) => {
  const { ticket_id, technicien_id, diagnostic } = req.body;
  const result = await db.query(
    `INSERT INTO interventions (ticket_id, technicien_id, diagnostic)
     VALUES ($1, $2, $3) RETURNING *`,
    [ticket_id, technicien_id, diagnostic]
  );


  res.status(201).json(result.rows[0]);
};
