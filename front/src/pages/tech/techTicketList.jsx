import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './techTicketList.css';

const TechTickets = () => {
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const userId = localStorage.getItem('id');
        if (!userId) return;
        const res = await axios.get(`http://localhost:5000/tickets/assigned/${userId}`);
        const ticketsWithUser = await Promise.all(res.data.map(async (t) => {
          if (t.created_by) {
            try {
              const userRes = await axios.get(`http://localhost:5000/users/${t.created_by}`);
              return {
                ...t,
                created_by_name: userRes.data.name || userRes.data.username || '—',
                created_by_email: userRes.data.email || '—',
              };
            } catch {
              return { ...t, created_by_name: '—', created_by_email: '—' };
            }
          } else {
            return { ...t, created_by_name: '—', created_by_email: '—' };
          }
        }));
        setTickets(ticketsWithUser);
      } catch (err) {
        setTickets([]);
      }
    };
    fetchTickets();
  }, []);
  const [editedStatus, setEditedStatus] = useState({});
  const [confirmPopup, setConfirmPopup] = useState(null);
  // Refus reason state removed

  const handleStatusChange = (id, value) => {
    setEditedStatus(prev => ({ ...prev, [id]: value }));
  };

  const [diagnostic, setDiagnostic] = useState('');
  const [diagnosticError, setDiagnosticError] = useState('');

  const handleSave = (id) => {
    const ticket = tickets.find(t => t.id === id);
    setConfirmPopup({
      id,
      type: ticket.type,
      oldStatus: ticket.status,
      newStatus: editedStatus[id] || ticket.status,
      assignedAt: ticket.assignedAt
    });
    // Refus reason reset removed
    setDiagnostic('');
    setDiagnosticError('');
  };

  const handleConfirm = async () => {
    if (!confirmPopup) return;
    if ((confirmPopup.newStatus === 'REFUSE' || confirmPopup.newStatus === 'TERMINE') && !diagnostic.trim()) {
      setDiagnosticError('Veuillez saisir un diagnostic.');
      return;
    }
    // Refus reason validation removed
    try {
      // Update ticket status using the new endpoint
      const ticket = tickets.find(t => t.id === confirmPopup.id);
      await axios.put(`http://localhost:5000/tickets/${confirmPopup.id}`, {
        type: ticket.type,
        description: ticket.description,
        status: confirmPopup.newStatus
      });
      // Create intervention if status is TERMINE or REFUSE
      if (confirmPopup.newStatus === 'TERMINE' || confirmPopup.newStatus === 'REFUSE') {
        const userId = localStorage.getItem('id');
        await axios.post('http://localhost:5000/interventions', {
          ticket_id: confirmPopup.id,
          technicien_id: userId,
          diagnostic
        });
      }
      // Refresh tickets
      const userId = localStorage.getItem('id');
      const res = await axios.get(`http://localhost:5000/tickets/assigned/${userId}`);
      const ticketsWithUser = await Promise.all(res.data.map(async (t) => {
        if (t.created_by) {
          try {
            const userRes = await axios.get(`http://localhost:5000/users/${t.created_by}`);
            return {
              ...t,
              created_by_name: userRes.data.name || userRes.data.username || '—',
              created_by_email: userRes.data.email || '—',
            };
          } catch {
            return { ...t, created_by_name: '—', created_by_email: '—' };
          }
        } else {
          return { ...t, created_by_name: '—', created_by_email: '—' };
        }
      }));
      setTickets(ticketsWithUser);
    } catch (err) {
      // Optionally handle error
    }
    setEditedStatus(prev => {
      const updated = { ...prev };
      delete updated[confirmPopup.id];
      return updated;
    });
    setConfirmPopup(null);
    // Refus reason reset removed
    setDiagnostic('');
    setDiagnosticError('');
  };

  const handleCancel = () => {
    setConfirmPopup(null);
    // Refus reason reset removed
  };

  return (
    <div className="tech-ticket-page">
      <h2>Tickets assignés</h2>

      {confirmPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Confirmer la modification</h3>
            <p><b>Ticket #:</b> {confirmPopup.id}</p>
            <p><b>Type:</b> {confirmPopup.type}</p>
            <p><b>Statut actuel:</b> {confirmPopup.oldStatus}</p>
            <p><b>Nouveau statut:</b> {confirmPopup.newStatus}</p>
            <p><b>Date d'assignation:</b> {confirmPopup.assignedAt}</p>
            {(confirmPopup.newStatus === 'REFUSE' || confirmPopup.newStatus === 'TERMINE') && (
              <div style={{ width: '100%', marginTop: '1rem' }}>
                <label style={{fontWeight: 700 }}>
                  Diagnostic (obligatoire):
                </label>
                <textarea
                  value={diagnostic}
                  onChange={e => {
                    setDiagnostic(e.target.value);
                    setDiagnosticError('');
                  }}
                  rows={3}
                  style={{ width: '100%', marginTop: 6, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#e5e7eb', padding: 8 }}
                  required
                />
                {diagnosticError && <div style={{ color: '#ef4444', marginTop: 4 }}>{diagnosticError}</div>}
              </div>
            )}
            {/* Refus reason input removed as requested */}
            <div className="popup-actions">
              <button className="confirm-btn" onClick={handleConfirm}>Confirmer</button>
              <button className="cancel-btn" onClick={handleCancel}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <table className="tech-ticket-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Description</th>
            <th>Posté par</th>
            <th>Statut</th>
            <th>Date d'assignation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.filter(t => t.status === "EN_COURS" || (t.status === "EN_COURS" && editedStatus[t.id] !== undefined)).map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.type}</td>
              <td>{t.description || '—'}</td>
              <td>
                {t.created_by_name ? (
                  <>
                    <div>{t.created_by_name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{t.created_by_email}</div>
                  </>
                ) : '—'}
              </td>
              <td>
                <select
                  value={editedStatus[t.id] ?? t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  style={{
                    color:
                      (editedStatus[t.id] ?? t.status) === "EN_COURS" ? "#6366f1" :
                      (editedStatus[t.id] ?? t.status) === "TERMINE" ? "#10b981" :
                      (editedStatus[t.id] ?? t.status) === "REFUSE" ? "#ef4444" :
                      undefined,
                    fontWeight: 600
                  }}
                >
                  <option value="EN_COURS" style={{ color: '#6366f1' }}>EN_COURS</option>
                  <option value="TERMINE" style={{ color: '#10b981' }}>TERMINE</option>
                  <option value="REFUSE" style={{ color: '#ef4444' }}>REFUSE</option>
                </select>
              </td>
              <td>{t.date_assigned ? new Date(t.date_assigned).toLocaleString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
              <td>
                <button className="edit-btn" onClick={() => handleSave(t.id)}>
                  Enregistrer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TechTickets;
