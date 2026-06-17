import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('ss_current_user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Level is stored as an integer (1, 2, 3) in the DB
  const levels = [
    { name: 'Book Lover',     min: 0,   next: 250,   nextName: 'Bibliophile' },
    { name: 'Bibliophile',    min: 251, next: 750,   nextName: 'Grand Librarian' },
    { name: 'Grand Librarian',min: 751, next: 10000, nextName: 'Legendary Reader' },
  ];

  const levelIndex = Math.max(0, Math.min((user?.level ?? 1) - 1, levels.length - 1));
  const currentLevelInfo = levels[levelIndex];
  const progress = user ? Math.min(100, Math.max(5, ((user.points - currentLevelInfo.min) / (currentLevelInfo.next - currentLevelInfo.min)) * 100)) : 0;

  const activities = [
    { type: 'donation', title: 'Points Credited', desc: 'Verified 5 Fiction books', points: '+50', time: '2 hours ago' },
    { type: 'order', title: 'Order Shipped', desc: 'Recycled Paper Journal', points: '-90', time: 'Yesterday' },
    { type: 'points', title: 'Daily Bonus', desc: 'Login streak reward', points: '+5', time: 'Yesterday' }
  ];

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', margin: 0 },
    mainContent: { padding: 40, maxWidth: 1440, marginLeft: 'auto', marginRight: 'auto' },
    welcomeHeader: { marginBottom: 32 },
    dashboardGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 },
    pointsCard: { background: '#1E4D4B', color: 'white', padding: 24, borderRadius: 16, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' },
    pointsValue: { fontSize: 48, fontWeight: 800, lineHeight: 1 },
    levelBadge: { background: '#E9C46A', color: '#343A40', padding: '4px 12px', borderRadius: 50, fontSize: 12, marginLeft: 8 },
    progressContainer: { marginTop: 20, width: '100%' },
    progressBar: { height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', background: '#E9C46A', width: `${progress}%` },
    actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 },
    actionBtn: { background: 'white', border: '1px solid #DEE2E6', borderRadius: 12, padding: 24, textAlign: 'center', textDecoration: 'none', color: '#343A40', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
    actionIcon: { fontSize: 32, color: '#1E4D4B' },
    card: { background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    activityList: { listStyle: 'none' },
    activityItem: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid #DEE2E6' },
    activityIcon: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
    alertCard: { background: 'linear-gradient(135deg, #FFF5EC 0%, #FFE8D6 100%)', border: '1px solid #F4A261', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', gap: 16 },
    featuredBundle: { background: '#1E4D4B', color: 'white', borderRadius: 16, padding: 24 }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} />

      <main style={styles.mainContent}>
        <div style={styles.welcomeHeader}>
          <h1>Welcome back, {user.name?.split(' ')[0]}!</h1>
          <p>Here's what's happening with your library today.</p>
        </div>

        <div style={styles.dashboardGrid}>
          <div>
            <div style={styles.pointsCard}>
              <div>
                <h3 style={{ fontSize: 16, opacity: 0.8 }}>Your Balance</h3>
                <div style={styles.pointsValue}>{user.points}</div>
                <div>Current Level: <span style={styles.levelBadge}>{currentLevelInfo.name}</span></div>
              </div>
              <div style={{ width: '40%' }}>
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}>
                    <div style={styles.progressFill}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8, opacity: 0.8 }}>
                    <span>{Math.max(0, currentLevelInfo.next - user.points)} pts to next level</span>
                    <span>{currentLevelInfo.nextName}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.actionsGrid}>
              <Link to="/donate" style={styles.actionBtn}>
                <i className="fa-solid fa-hand-holding-heart" style={{ ...styles.actionIcon, color: '#2A9D8F' }}></i>
                <span>Donate Books</span>
              </Link>
              <Link to="/marketplace" style={styles.actionBtn}>
                <i className="fa-solid fa-store" style={{ ...styles.actionIcon, color: '#E76F51' }}></i>
                <span>Browse Books</span>
              </Link>
              <Link to="/my-crafts" style={styles.actionBtn}>
                <i className="fa-solid fa-palette" style={{ ...styles.actionIcon, color: '#C4941A' }}></i>
                <span>My Crafts</span>
              </Link>
              <Link to="/orders" style={styles.actionBtn}>
                <i className="fa-solid fa-box-open" style={styles.actionIcon}></i>
                <span>My Orders</span>
              </Link>
            </div>
            <div style={{ ...styles.card, marginTop: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Recent Activity</h3>
                <a href="#" style={{ color: '#1E4D4B', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>View All</a>
              </div>
              <ul style={styles.activityList}>
                {activities.map((act, idx) => (
                  <li key={idx} style={styles.activityItem}>
                    <div style={{ 
                      ...styles.activityIcon, 
                      background: act.type === 'donation' ? 'rgba(42,157,143,0.1)' : 
                                  act.type === 'order' ? 'rgba(30,77,75,0.1)' : 
                                  'rgba(233,196,106,0.2)', 
                      color: act.type === 'donation' ? '#2A9D8F' : 
                             act.type === 'order' ? '#1E4D4B' : 
                             '#C4941A' 
                    }}>
                      <i className={`fa-solid ${
                        act.type === 'donation' ? 'fa-hand-holding-heart' : 
                        act.type === 'order' ? 'fa-box' : 
                        'fa-coins'
                      }`}></i>
                    </div>
                    <div>
                      <h4>{act.title}</h4>
                      <p style={{ fontSize: 13, color: '#6C757D' }}>{act.desc}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: act.points.startsWith('+') ? '#2A9D8F' : '#E63946' }}>
                        {act.points}
                      </div>
                      <div style={{ fontSize: 12, color: '#6C757D' }}>{act.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div style={styles.alertCard}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#F4A261', fontSize: 24 }}></i>
              <div>
                <h4>Points Expiring Soon</h4>
                <p>50 points from your December donation will expire in 5 days. Use them in the marketplace!</p>
              </div>
            </div>
            <div style={styles.card}>
              <h3 style={{ marginBottom: 20 }}>Your Impact</h3>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#2A9D8F' }}>12</div>
                <p style={{ color: '#6C757D', fontSize: 14 }}>Books Donated Total</p>
              </div>
              <div style={{ borderTop: '1px solid #DEE2E6', paddingTop: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#1E4D4B' }}>1.2</div>
                <p style={{ color: '#6C757D', fontSize: 14 }}>Trees Saved (Approx.)</p>
              </div>
            </div>
            <div style={styles.featuredBundle}>
              <h4 style={{ marginBottom: 12, opacity: 0.9 }}>Curated For You</h4>
              <p style={{ fontSize: 14, marginBottom: 16 }}>The "Mindfulness Collection" bundle is perfect for your reading history.</p>
              <Link to="/marketplace" style={{ 
                background: '#E9C46A', 
                color: '#343A40', 
                padding: 10, 
                width: '100%', 
                borderRadius: 8, 
                textDecoration: 'none', 
                display: 'block', 
                textAlign: 'center', 
                fontWeight: 700 
              }}>
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;