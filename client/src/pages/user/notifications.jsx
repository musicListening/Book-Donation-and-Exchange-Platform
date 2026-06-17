import React, { useState } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Donation Verified!', message: 'Your donation of 5 Fiction books has been verified. 50 points have been added to your account.', time: '10 minutes ago', icon: 'fa-circle-check', iconBg: '#2A9D8F', unread: true },
    { id: 2, title: 'Order Shipped', message: 'Great news! Your bundle "Timeless Literature" is on its way to you.', time: '2 hours ago', icon: 'fa-truck-fast', iconBg: '#E76F51', unread: true },
    { id: 3, title: 'Bonus Points Alert', message: 'You\'ve earned a 5-point daily login bonus. Keep up the streak!', time: 'Yesterday', icon: 'fa-gift', iconBg: '#1E4D4B', unread: false },
    { id: 4, title: 'Donation Scheduled', message: 'Your drop-off for May 12th at 02:00 PM is confirmed. See you there!', time: '3 days ago', icon: 'fa-calendar-check', iconBg: '#1E4D4B', unread: false }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
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
      <header style={styles.header}>
        <nav style={styles.navbar}>
          <a href="/" style={styles.logo}><i className="fa-solid fa-book-open"></i> ShareShelf</a>
          <div style={styles.navLinks}>
            <a href="/user-dashboard" style={styles.navLink}>Dashboard</a>
            <a href="/marketplace" style={styles.navLink}>Marketplace</a>
          </div>
        </nav>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <h1 style={styles.headerH1}>Notifications</h1>
            <button style={styles.btnClear} onClick={markAllAsRead}>Mark all as read</button>
          </div>

          <div>
            {notifications.map(notif => (
              <div key={notif.id} style={{ ...styles.notifItem, ...(notif.unread ? styles.notifItemUnread : {}) }}>
                {notif.unread && <div style={styles.unreadIndicator}></div>}
                <div style={{ ...styles.notifIcon, background: `rgba(${notif.iconBg === '#2A9D8F' ? '42,157,143' : notif.iconBg === '#E76F51' ? '231,111,81' : '30,77,75'}, 0.1)`, color: notif.iconBg }}>
                  <i className={`fa-solid ${notif.icon}`}></i>
                </div>
                <div style={styles.notifContent}>
                  <h4 style={styles.notifTitle}>{notif.title}</h4>
                  <p style={styles.notifMessage}>{notif.message}</p>
                  <div style={styles.notifTime}>{notif.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;