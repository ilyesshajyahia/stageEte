import React, { useEffect, useState } from 'react';
import './RespConge.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const RespConge = () => {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    technicien_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchConges = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch('http://localhost:5000/conges');
        if (!res.ok) throw new Error('Erreur lors du chargement des congés');
        const data = await res.json();
        setConges(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/users/role/TECHNICIEN');
        if (!res.ok) throw new Error('Erreur lors du chargement des techniciens');
        const data = await res.json();
        setUsers(data);
      } catch {}
    };
    fetchConges();
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce congé ?')) return;
    try {
      const res = await fetch(`http://localhost:5000/conges/${id}`, { method: 'DELETE' });
      if (res.ok) setConges(conges.filter(c => c.id !== id));
    } catch {}
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('http://localhost:5000/conges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const newConge = await res.json();
        setConges([newConge, ...conges]);
        setForm({ technicien_id: '', start_date: '', end_date: '', reason: '' });
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="conge-page">
      <h2>Gestion des congés techniciens</h2>
      <form className="conge-form" onSubmit={handleSubmit} style={{alignItems:'flex-end',gap:16,display:'flex',flexWrap:'wrap'}}>
        <div style={{ minWidth: 180 }}>
          <label>Technicien</label>
          <select name="technicien_id" value={form.technicien_id} onChange={handleChange} required style={{width:'100%'}}>
            <option value="">Sélectionner</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name || u.username || u.email}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 140 }}>
          <label>Début</label>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required style={{width:'100%'}} />
        </div>
        <div style={{ minWidth: 140 }}>
          <label>Fin</label>
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required style={{width:'100%'}} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label>Raison</label>
          <input type="text" name="reason" value={form.reason} onChange={handleChange} rows={1} style={{ width: '90%' }} />
        </div>
        <div style={{alignSelf:'flex-start', paddingTop: 22}}>
          <button type="submit" disabled={adding}>{adding ? 'Ajout...' : 'Ajouter'}</button>
        </div>
      </form>
      {loading ? <p>Chargement...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
        <table className="conge-table">
          <thead>
            <tr>
              <th>Technicien</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Raison</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {conges.map(c => (
              <tr key={c.id}>
                <td>{users.find(u => u.id === c.technicien_id)?.name || c.technicien_id}</td>
                <td>{formatDate(c.start_date)}</td>
                <td>{formatDate(c.end_date)}</td>
                <td>{c.reason}</td>
                <td><button onClick={() => handleDelete(c.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RespConge;
