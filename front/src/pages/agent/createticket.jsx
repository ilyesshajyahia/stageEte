import React, { useState } from 'react';
import axios from 'axios';
import './createticket.css';

const CreateTicket = () => {
  const [type, setType] = useState('');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState('moyenne');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type || !comment.trim() || !priority) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const created_by = user?.id;
      await axios.post('http://localhost:5000/tickets', {
        type,
        description: comment,
        created_by,
        priority,
      });
      alert("✅ Ticket créé avec succès !");
      setType('');
      setComment('');
      setPriority('moyenne');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-container">
      <h2>Créer un ticket d'intervention</h2>
      <form className="create-ticket-form" onSubmit={handleSubmit}>
        <label htmlFor="type">Type d'intervention <span className="required">*</span></label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="">-- Sélectionner --</option>
          <option value="réseau">Problème Réseau</option>
          <option value="logiciel">Problème Logiciel</option>
          <option value="matériel">Problème Matériel</option>
          <option value="autre">Autre</option>
        </select>

        <label htmlFor="comment">Description de l'intervention <span className="required">*</span></label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Décrivez le problème rencontré..."
          rows="5"
          required
        />

        <label htmlFor="priority">Priorité <span className="required">*</span></label>
        <select
          id="priority"
          value={priority}
          onChange={e => setPriority(e.target.value)}
          required
        >
          <option value="basse">Basse</option>
          <option value="moyenne">Moyenne</option>
          <option value="elevee">Élevée</option>
        </select>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>{loading ? 'Soumission...' : 'Soumettre'}</button>
      </form>
    </div>
  );
};

export default CreateTicket;
