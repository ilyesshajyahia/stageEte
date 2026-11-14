import React, { useEffect, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import './NotificationBell.css';

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/notifications/user/${userId}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
    // Optionally poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const unseenCount = notifications.filter(n => !n.seen).length;

  const markAsSeen = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/notifications/${id}/seen`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, seen: true } : n));
      }
    } catch (err) {
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
    }
  };

  return (
    <div className="notification-bell-container">
      <div className="notification-bell-icon" onClick={() => setOpen(!open)}>
        <FiBell size={24} />
        {unseenCount > 0 && <span className="notification-bell-badge">{unseenCount}</span>}
      </div>
      {open && (
        <div className="notification-bell-dropdown">
          <h4>Notifications</h4>
          {loading ? <div>Chargement...</div> : notifications.length === 0 ? <div>Aucune notification</div> : (
            <ul>
              {notifications.map(n => (
                <li
                  key={n.id}
                  className={n.seen ? 'seen' : 'unseen'}
                  onClick={() => !n.seen && markAsSeen(n.id)}
                  style={{ cursor: !n.seen ? 'pointer' : 'default', position: 'relative', padding: '8px 12px 8px 8px', minHeight: 40 }}
                >
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: 16,
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1
                    }}
                    title="Supprimer"
                  >
                    &#10005;
                  </button>
                  <span>{n.message}</span>
                  <span className="notification-bell-date" style={{ marginLeft: 'auto', marginRight: 8 }}>{new Date(n.created_at).toLocaleString('fr-FR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
