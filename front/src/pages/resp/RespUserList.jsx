import React, { useEffect, useState } from "react";
import "./respUserList.css";

const RespUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:5000/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError("Erreur lors du chargement des utilisateurs");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedRole, setSelectedRole] = useState("TECHNICIEN");
  const roleOptions = [
    { label: "Techniciens", value: "TECHNICIEN" },
    { label: "Agents", value: "AGENT" },
    { label: "Responsables", value: "RESPONSABLE" },
  ];
  const shownUsers = filteredUsers.filter((u) => u.role === selectedRole);

  return (
    <div className="resp-user-page">
      <h2>Liste des utilisateurs</h2>
      <div className="resp-user-role-btns">
        {roleOptions.map((opt) => (
          <button
            key={opt.value}
            className={`resp-user-role-btn${selectedRole === opt.value ? " active" : ""}`}
            onClick={() => setSelectedRole(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <input
        className="resp-user-search"
        type="text"
        placeholder="Rechercher par nom..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="resp-user-error">{error}</p>
      ) : (
        <>
          <h3 className="resp-user-section">{roleOptions.find((r) => r.value === selectedRole).label}</h3>
          <table className="resp-user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom d'utilisateur</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {shownUsers.length === 0 ? (
                <tr><td colSpan={3}>Aucun utilisateur trouvé.</td></tr>
              ) : (
                shownUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default RespUserList;
