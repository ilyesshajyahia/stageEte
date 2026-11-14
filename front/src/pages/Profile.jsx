import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const userId = localStorage.getItem('id');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/users/${userId}`);
        const data = await res.json();
        setForm({ username: data.username, email: data.email, password: '', role: data.role });
      } catch (err) {
        setError('Erreur lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password && form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password || undefined,
          role: form.role
        })
      });
      if (res.ok) {
        
        setSuccess('Profil mis à jour avec succès.');
        setForm({ ...form, password: '', confirmPassword: '' });
      } else {
        const errData = await res.json();
        setError(errData.error || 'Erreur lors de la mise à jour.');
      }
    } catch (err) {
      setError('Erreur serveur.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Mon Profil</h2>
      {loading ? <div>Chargement...</div> : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Nom d'utilisateur
            <input type="text" name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Mot de passe (laisser vide pour ne pas changer)
            <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
          </label>
          <label>
            Confirmer le mot de passe
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
          </label>
          <label>
            Rôle
            <input type="text" name="role" value={form.role} onChange={handleChange} disabled />
          </label>
          <button type="submit">Mettre à jour</button>
          {error && <div className="profile-error">{error}</div>}
          {success && <div className="profile-success">{success}</div>}
        </form>
      )}
    </div>
  );
};

export default Profile;
