import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './respInterventions.css';

const RespInterventions = () => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterventions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/interventions');
        const interventions = res.data;
        // Fetch ticket details for each intervention
        const detailedInterventions = await Promise.all(
          interventions.map(async (interv) => {
            let ticket = {};
            let technicien = { name: '—', email: '—' };
            try {
              const ticketRes = await axios.get(`http://localhost:5000/tickets/${interv.ticket_id}`);
              ticket = ticketRes.data;
            } catch (e) {
              ticket = { type: '—', status: '—', description: '—' };
            }
            try {
              if (interv.technicien_id) {
                const techRes = await axios.get(`http://localhost:5000/users/${interv.technicien_id}`);
                const techUser = techRes.data;
                technicien = { name: techUser.name || techUser.username || '—', email: techUser.email || '—' };
              }
            } catch {}
            return {
              ...interv,
              ticketType: ticket.type || '—',
              ticketStatus: ticket.status || '—',
              ticketDescription: ticket.description || '—',
              technicien,
            };
          })
        );
        setInterventions(detailedInterventions);
      } catch (err) {
        setError('Erreur lors du chargement des interventions');
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  return (
    <div className="tech-history-page">
      <h2>Historique des interventions</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div style={{ color: '#ef4444' }}>{error}</div>
      ) : (
        <table className="tech-history-table">
          <thead>
            <tr>
              <th># Intervention</th>
              <th>ID Ticket</th>
              <th>Type</th>
              <th>Description</th>
              <th>Diagnostic</th>
              <th>Statut</th>
              <th>Effectué par</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {interventions.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.ticket_id}</td>
                <td>{t.ticketType}</td>
                <td>{t.ticketDescription}</td>
                <td>{t.diagnostic || '—'}</td>
                <td style={{
                  color:
                    t.ticketStatus === 'TERMINE' ? '#10b981' :
                    t.ticketStatus === 'REFUSE' ? '#ef4444' :
                    undefined,
                  fontWeight: 600
                }}>{t.ticketStatus}</td>
                <td>
                  {t.technicien && t.technicien.name !== '—' ? (
                    <>
                      <div>{t.technicien.name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{t.technicien.email}</div>
                    </>
                  ) : '—'}
                </td>
                <td>{t.performed_at ? new Date(t.performed_at).toLocaleString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RespInterventions;
