import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { notificationAPI } from '../../services/api';
import { io } from 'socket.io-client';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({ name: 'User', points: 0, id: null });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { name: 'User', points: 0, id: null };
    setUser(storedUser);
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);

    // Fetch notifications
    const fetchNotifications = async () => {
      if (!storedUser.id) return;
      try {
        const data = await notificationAPI.getAllForUser(storedUser.id);
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    if (storedUser.id) {
      const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
      
      socket.emit('joinRoom', storedUser.id);
      
      socket.on('newNotification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  const markAllAsRead = async () => {
    if (!user.id) return;
    try {
      await notificationAPI.markAllAsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', paddingTop: 72, margin: 0 },
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
    notifTitle: { fontSize: 16, marginBottom: 4 },
    notifMessage: { fontSize: 14, color: '#6C757D', lineHeight: 1.5 },
    notifTime: { fontSize: 12, color: '#6C757D', marginTop: 8 }
  };

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

      <main style={styles.mainContent}>
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <h1 style={styles.headerH1}>Notifications</h1>
            <button style={styles.btnClear} onClick={markAllAsRead}>Mark all as read</button>
          </div>

          <div>
            {notifications.map(notif => {
              const unread = !notif.isRead;
              // Map types to icons and colors
              let icon = 'fa-bell';
              let iconBg = '#1E4D4B';
              
              if (notif.type === 'LEVEL_UP') { icon = 'fa-arrow-up-right-dots'; iconBg = '#2A9D8F'; }
              else if (notif.type === 'MYSTERY_BOX_REWARD') { icon = 'fa-gift'; iconBg = '#E9C46A'; }
              else if (notif.type === 'SYSTEM_ALERT') { icon = 'fa-circle-exclamation'; iconBg = '#E76F51'; }
              else if (notif.type === 'ORDER_STATUS_UPDATE') { icon = 'fa-truck-fast'; iconBg = '#2A9D8F'; }

              return (
                <div key={notif.id} style={{ ...styles.notifItem, ...(unread ? styles.notifItemUnread : {}) }}>
                  {unread && <div style={styles.unreadIndicator}></div>}
                  <div style={{ ...styles.notifIcon, background: `rgba(${iconBg === '#2A9D8F' ? '42,157,143' : iconBg === '#E76F51' ? '231,111,81' : iconBg === '#E9C46A' ? '233,196,106' : '30,77,75'}, 0.1)`, color: iconBg }}>
                    <i className={`fa-solid ${icon}`}></i>
                  </div>
                  <div style={styles.notifContent}>
                    <h4 style={styles.notifTitle}>{notif.title}</h4>
                    <p style={styles.notifMessage}>{notif.message}</p>
                    <div style={styles.notifTime}>{new Date(notif.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
            
            {notifications.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#6C757D' }}>
                <i className="fa-regular fa-bell-slash" style={{ fontSize: 32, marginBottom: 16, color: '#DEE2E6' }}></i>
                <p>You have no notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;