import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './techHistory.css';


const TechHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem('id');
        if (!userId) return;
        // Fetch interventions for this technicien
        const res = await axios.get(`http://localhost:5000/interventions/technicien/${userId}`);
        const interventions = res.data;

        // For each intervention, fetch the ticket details
        const detailedHistory = await Promise.all(
          interventions.map(async (interv) => {
            let ticket = {};
            try {
              const ticketRes = await axios.get(`http://localhost:5000/tickets/${interv.ticket_id}`);
              ticket = ticketRes.data;
            } catch (e) {
              ticket = { type: '—', status: '—', description: '—' };
            }
            return {
              ...interv,
              ticketType: ticket.type || '—',
              ticketStatus: ticket.status || '—',
              ticketDescription: ticket.description || '—',
            };
          })
        );
        setHistory(detailedHistory);
      } catch (err) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="tech-history-page">
      <h2>Historique des interventions</h2>
      {loading ? (
        <div>Chargement...</div>
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
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((t) => (
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
                <td>{t.performed_at ? new Date(t.performed_at).toLocaleString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TechHistory;
