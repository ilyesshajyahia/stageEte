import React, { useEffect, useState } from "react";
import axios from "axios";
import "./agentTicketList.css";

const AgentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [edited, setEdited] = useState({}); // Store temporary edits per ticket
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;
        const res = await axios.get(
          `http://localhost:5000/tickets/user/${userId}`
        );
        setTickets(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Erreur lors du chargement des tickets"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleChange = (id, field, value) => {
    setEdited((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce ticket ?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/tickets/${id}`);
        setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
        setEdited((prev) => {
          const newEdited = { ...prev };
          delete newEdited[id];
          return newEdited;
        });
      } catch (err) {
        alert(
          err.response?.data?.message || "Erreur lors de la suppression du ticket"
        );
      }
    }
  };

  const handleSave = async (id) => {
    const confirmUpdate = window.confirm(
      "Voulez-vous vraiment enregistrer les modifications de ce ticket ?"
    );
    if (!confirmUpdate) return;
    const ticket = tickets.find((t) => t.id === id);
    const update = { ...ticket, ...edited[id] };
    try {
      const res = await axios.put(`http://localhost:5000/tickets/${id}`, {
        type: update.type,
        description: update.description,
        status: update.status || ticket.status,
      });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? res.data : t))
      );
      setEdited((prev) => {
        const newEdited = { ...prev };
        delete newEdited[id];
        return newEdited;
      });
    } catch (err) {
      alert(
        err.response?.data?.message || "Erreur lors de la mise à jour du ticket"
      );
    }
  };

  const isEditable = (status) => status === "EN_ATTENTE";

  // Helper to format ISO date string to readable format
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter tickets by search (id, type, description, or date)
  const filteredTickets = tickets.filter((t) => {
    const searchLower = search.toLowerCase();
    return (
      (!search ||
        t.id.toString().includes(searchLower) ||
        (t.type && t.type.toLowerCase().includes(searchLower)) ||
        (t.description && t.description.toLowerCase().includes(searchLower)) ||
        formatDate(t.createdAt || t.created_at).toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="agent-ticket-page">
      <h2>Mes tickets</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Rechercher par id, type, description ou date..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '12px 40px 12px 40px',
            borderRadius: 24,
            border: '1.5px solid #38bdf8',
            width: '100%',
            maxWidth: 420,
            fontSize: '1.05rem',
            background: '#181f2a',
            color: '#e5e7eb',
            boxShadow: '0 2px 8px rgba(56,189,248,0.08)',
            outline: 'none',
            transition: 'border 0.2s',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2338bdf8" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '12px center',
            paddingLeft: 40,
          }}
        />
      </div>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="agent-ticket-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>
                  {isEditable(t.status) ? (
                    <select
                      value={edited[t.id]?.type ?? t.type}
                      onChange={(e) => handleChange(t.id, "type", e.target.value)}
                    >
                      <option value="Réseau">Réseau</option>
                      <option value="Logiciel">Logiciel</option>
                      <option value="Matériel">Matériel</option>
                      <option value="Autre">Autre</option>
                    </select>
                  ) : (
                    t.type
                  )}
                </td>
                <td>
                  {isEditable(t.status) ? (
                    <input
                      type="text"
                      value={edited[t.id]?.description ?? t.description}
                      onChange={(e) =>
                        handleChange(t.id, "description", e.target.value)
                      }
                    />
                  ) : (
                    t.description
                  )}
                </td>
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
                <td>{t.priority || t.priorite || '—'}</td>
                <td>{formatDate(t.createdAt || t.created_at)}</td>
                <td style={{ minWidth: 160 }}>
                  {isEditable(t.status) ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="agent-edit-btn"
                        onClick={() => handleSave(t.id)}
                      >
                        Enregistrer
                      </button>
                      <button
                        className="agent-delete-btn"
                        onClick={() => handleDelete(t.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgentTickets;
