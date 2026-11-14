import React from 'react';
import '../styles/sidebar.css';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiLogOut,
  FiPlusCircle,
  FiList,
  FiCheckCircle,
  FiClipboard,
  FiUsers,
  FiSettings,
  FiBarChart2
} from 'react-icons/fi';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const commonLinks = [
    { label: 'Profil', icon: <FiUser />, path: '/profile' },
    { label: 'Déconnexion', icon: <FiLogOut />, path: '/logout' }
  ];

  const roleBasedLinks = {
    AGENT: [
      { label: ' Mes tickets', icon: <FiList />, path: '/agent/tickets' },
      { label: ' Créer un ticket', icon: <FiPlusCircle />, path: '/agent/create' }
    ],
    TECHNICIEN: [
      { label: ' Tickets assignés', icon: <FiClipboard />, path: '/tech/tickets' },
      { label: ' Historique', icon: <FiCheckCircle />, path: '/tech/history' }
    ],
    RESPONSABLE: [
      { label: ' Tous les tickets', icon: <FiList />, path: '/responsable/all' },
      { label: ' Interventions', icon: <FiCheckCircle />, path: '/responsable/interventions' },
      { label: ' Rapports', icon: <FiBarChart2 />, path: '/responsable/reports' },
      { label: ' Utilisateurs', icon: <FiUsers />, path: '/responsable/users' },
      { label: ' Congés techniciens', icon: <FiClipboard />, path: '/responsable/conges' },
      { label: ' Paramètres', icon: <FiSettings />, path: '/responsable/settings' }
    ],
  };

  const links = [...(roleBasedLinks[role] || []), ...commonLinks];

  const handleLinkClick = (link) => {
    if (link.label === 'Déconnexion') {
      localStorage.clear();
      window.location.href = '/'; // Force full reload to reset state
    } else {
      navigate(link.path);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">🛠 Intervention</div>
      <ul className="sidebar-menu">
        {links.map((link, idx) => (
          <li
            key={idx}
            className="sidebar-item"
            onClick={() => handleLinkClick(link)}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
