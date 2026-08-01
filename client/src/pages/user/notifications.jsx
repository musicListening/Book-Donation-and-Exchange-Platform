import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { API_BASE } from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({ name: 'User', points: 0 });
  const [cartCount, setCartCount] = useState(0);

  const getIconAndBg = (type) => {
    const t = type || '';
    if (t === 'ORDER_UPDATE' || t === 'DELIVERY_UPDATE') {
      return { icon: 'fa-truck-fast', bg: '#E76F51' };
    }
    if (t === 'MYSTERY_BOX_REWARD') {
      return { icon: 'fa-gift', bg: '#1E4D4B' };
    }
    if (t === 'POINT_ADJUSTMENT') {
      return { icon: 'fa-circle-check', bg: '#2A9D8F' };
    }
    if (t === 'LEVEL_UP') {
      return { icon: 'fa-star', bg: '#E9C46A' };
    }
    return { icon: 'fa-bell', bg: '#374151' };
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { name: 'User', points: 0 };
    setUser(storedUser);
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);

    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(err => console.error('Error fetching notifications:', err));
  }, []);

  const markAllAsRead = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
      })
      .catch(err => console.error('Error marking as read:', err));
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', paddingTop: 72, margin: 0, minHeight: '100vh' },
    header: { position: 'fixed', top: 0, left: 0, width: '100%', height: 72, background: 'white', borderBottom: '1px solid #DEE2E6', zIndex: 1000, padding: '0 40px' },
    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', maxWidth: 1440, margin: '0 auto' },
    logo: { fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 800, color: '#1E4D4B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 },
    navLinks: { display: 'flex', gap: 24 },
    navLink: { color: '#343A40', textDecoration: 'none', fontWeight: 600 },
    mainContent: { maxWidth: 800, margin: '40px auto', padding: '0 20px' },
    card: { background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    headerH1: { fontFamily: 'Playfair Display, serif', fontSize: 28 },
    btnClear: { background: 'none', border: 'none', color: '#1E4D4B', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
    notifItem: { padding: 20, borderBottom: '1px solid #DEE2E6', display: 'flex', gap: 20, position: 'relative' },
    notifItemUnread: { background: 'rgba(233, 196, 106, 0.05)' },
    unreadIndicator: { position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: '#E9C46A' },
    notifIcon: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
    notifContent: { flex: 1 },
    notifTitle: { fontSize: 16, marginBottom: 4, fontWeight: 700, color: '#1E4D4B' },
    notifMessage: { fontSize: 14, color: '#343A40', lineHeight: 1.5 },
    notifTime: { fontSize: 12, color: '#6C757D', marginTop: 8 }
  };

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

      <main className="notifications-main" style={styles.mainContent}>
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <h1 style={styles.headerH1}>Notifications</h1>
            {notifications.some(n => !n.isRead) && (
              <button style={styles.btnClear} onClick={markAllAsRead}>Mark all as read</button>
            )}
          </div>

          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6C757D' }}>
                <i className="fa-regular fa-bell-slash" style={{ fontSize: 40, color: '#DEE2E6', marginBottom: 12 }}></i>
                <p>You have no notifications yet.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const { icon, bg } = getIconAndBg(notif.type);
                const unread = !notif.isRead;
                
                let rgb = '30,77,75';
                if (bg === '#2A9D8F') rgb = '42,157,143';
                else if (bg === '#E76F51') rgb = '231,111,81';
                else if (bg === '#E9C46A') rgb = '233,196,106';

                return (
                  <div key={notif.id} style={{ ...styles.notifItem, ...(unread ? styles.notifItemUnread : {}) }}>
                    {unread && <div style={styles.unreadIndicator}></div>}
                    <div style={{ ...styles.notifIcon, background: `rgba(${rgb}, 0.1)`, color: bg }}>
                      <i className={`fa-solid ${icon}`}></i>
                    </div>
                    <div style={styles.notifContent}>
                      <h4 style={styles.notifTitle}>{notif.title}</h4>
                      <p style={styles.notifMessage}>{notif.message}</p>
                      <div style={styles.notifTime}>{formatTime(notif.createdAt)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;