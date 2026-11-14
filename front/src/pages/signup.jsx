import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('AGENT');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
  e.preventDefault();

  if (!username || !email || !password || !confirmPassword) {
    setError('Tous les champs sont obligatoires');
    return;
  }

  if (password !== confirmPassword) {
    setError('Les mots de passe ne correspondent pas');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, role }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erreur d'inscription");
    }

    setError('');
    navigate('/');
  } catch (err) {
    setError(err.message);
  }
};


  return (
    <div className="signup-container">
      <h2>Créer un compte</h2>
      <form className="signup-form" onSubmit={handleSignup}>
        <label>Nom d'utilisateur</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Confirmer le mot de passe</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <label>Rôle</label>
        <select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="AGENT">Agent</option>
          <option value="TECHNICIEN">Technicien</option>
        </select>
        {error && <p className="signup-error">{error}</p>}
        <button type="submit">S'inscrire</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16 }}>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
};

export default Signup;
