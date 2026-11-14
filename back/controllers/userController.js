const db = require('../db');
const bcrypt = require('bcryptjs');
const notificationController = require('./notificationController');

exports.loginUser = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    let result;
    if (email) {
      result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    } else {
      result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    }
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Optionally generate token here
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAllUsers = async (req, res) => {
  const result = await db.query('SELECT id, username, email, role FROM users');
  res.json(result.rows);
};

exports.getUserById = async (req, res) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
};

exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.query(
    'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, email, hashedPassword, role]
  );
  // Notify responsables on new user
  await notificationController.notifyRespOnNewTicketOrUser('user', result.rows[0].id);
  res.status(201).json(result.rows[0]);
};

exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const result = await db.query('SELECT id, username, email, role FROM users WHERE role = $1', [role]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé pour ce rôle.' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs par rôle:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche des utilisateurs.' });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, password, role } = req.body;
  try {
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const result = await db.query(
      `UPDATE users SET
        username = COALESCE($1, username),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        role = COALESCE($4, role)
      WHERE id = $5
      RETURNING id, username, email, role`,
      [username, email, password ? hashedPassword : null, role, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'utilisateur.' });
  }
};
