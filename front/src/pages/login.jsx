import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/users/login', {
        username,
        password,
      });
      const user = res.data;
      localStorage.setItem('role', user.role);
      localStorage.setItem('username', user.username);
      localStorage.setItem('id', user.id || user._id || '');
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User ID on login:', user.id || user._id || '');
      if (onLogin) onLogin(user.role);

      switch (user.role) {
        case 'AGENT':
          navigate('/agent/tickets');
          break;
        case 'TECHNICIEN':
          navigate('/tech/tickets');
          break;
        case 'RESPONSABLE':
          navigate('/responsable/all');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erreur de connexion'
      );
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <label>Nom d'utilisateur</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit">Se connecter</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16 }}>
        Pas de compte ? <Link to="/signup">Créer un compte</Link>
      </p>
    </div>
  );
};

export default Login;
