const db = require('../db');

exports.getCommentsByTicket = async (req, res) => {
  const result = await db.query('SELECT * FROM comments WHERE ticket_id = $1', [req.params.ticketId]);
  res.json(result.rows);
};

exports.addComment = async (req, res) => {
  const { ticket_id, user_id, content } = req.body;
  const result = await db.query(
    `INSERT INTO comments (ticket_id, user_id, content)
     VALUES ($1, $2, $3) RETURNING *`,
    [ticket_id, user_id, content]
  );
  res.status(201).json(result.rows[0]);
};
