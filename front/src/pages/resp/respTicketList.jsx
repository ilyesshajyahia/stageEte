
// src/pages/responsable/RespTickets.jsx
import React from 'react';
import './respTicketList.css';

// ...existing code...

const RespTickets = () => {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all tickets
        const res = await fetch("http://localhost:5000/tickets");
        let data = await res.json();
        // Filter tickets with assigned_to not null
        data = data.filter((t) => t.assigned_to);
        // For each ticket, fetch the technicien's and creator's info
        const ticketsWithUsers = await Promise.all(
          data.map(async (t) => {
            let technicien = { name: '—', email: '—' };
            let creator = { name: '—', email: '—' };
            try {
              if (t.assigned_to) {
                const techRes = await fetch(`http://localhost:5000/users/${t.assigned_to}`);
                const techUser = await techRes.json();
                technicien = { name: techUser.name || techUser.username || '—', email: techUser.email || '—' };
              }
            } catch {}
            try {
              if (t.created_by) {
                const creatorRes = await fetch(`http://localhost:5000/users/${t.created_by}`);
                const creatorUser = await creatorRes.json();
                creator = { name: creatorUser.name || creatorUser.username || '—', email: creatorUser.email || '—' };
              }
            } catch {}
            return { ...t, technicien, creator };
          })
        );
        setTickets(ticketsWithUsers);
      } catch (err) {
        setError("Erreur lors du chargement des tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="ticket-page">
      <h2>Tous les tickets</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="ticket-error">{error}</p>
      ) : (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Description</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Créé par</th>
              <th>Assigné à</th>
              <th>Date de création</th>
              <th>Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t, idx) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.type}</td>
                <td>{t.description}</td>
                <td>{t.priority || t.priorite || "—"}</td>
                <td>
                  <span style={{
                    color:
                      t.status === "EN_ATTENTE" ? "#fbbf24" :
                      t.status === "EN_COURS" ? "#6366f1" :
                      t.status === "TERMINE" ? "#10b981" :
                      t.status === "REFUSE" ? "#ef4444" :
                      undefined,
                    fontWeight: 600
                  }}>
                    {t.status}
                  </span>
                </td>
                <td>
                  {t.creator && t.creator.name !== '—' ? (
                    <>
                      <div>{t.creator.name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{t.creator.email}</div>
                    </>
                  ) : '—'}
                </td>
                <td>
                  {t.technicien && t.technicien.name !== '—' ? (
                    <>
                      <div>{t.technicien.name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{t.technicien.email}</div>
                    </>
                  ) : '—'}
                </td>
                <td>{t.created_at ? new Date(t.created_at).toLocaleString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                <td>{t.updated_at ? new Date(t.updated_at).toLocaleString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RespTickets;
