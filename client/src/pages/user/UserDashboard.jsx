import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { systemConfigAPI } from '../../services/api';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [levels, setLevels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);

    // Fetch fresh user data and level config
    const fetchData = async () => {
      try {
        const config = await systemConfigAPI.getAll();
        if (config.LEVEL_THRESHOLDS) {
          try {
            const parsed = JSON.parse(config.LEVEL_THRESHOLDS);
            setLevels(parsed);
          } catch {}
        }
        // Try to get fresh user data
        try {
          const res = await fetch(`/api/users`);
          const users = await res.json();
          const freshUser = users.find(u => u.id === storedUser.id);
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
            localStorage.setItem('ss_current_user', JSON.stringify(freshUser));
          }
        } catch {}
      } catch {}
    };
    fetchData();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('ss_current_user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Build level info from dynamic thresholds
  const getLevelInfo = () => {
    if (levels.length === 0) {
      return { name: 'Book Lover', min: 0, next: 250, nextName: 'Bibliophile', progress: 50 };
    }
    const sorted = [...levels].sort((a, b) => a.minPoints - b.minPoints);
    const currentLevel = user?.level || 1;
    const idx = sorted.findIndex(l => l.level === currentLevel);
    const current = sorted[idx] || sorted[0];
    const next = sorted[idx + 1] || sorted[idx];
    const min = parseInt(current.minPoints) || 0;
    const nextMin = parseInt(next.minPoints) || min;
    const pts = user?.points || 0;
    const range = nextMin - min;
    const progress = range > 0 ? Math.min(100, Math.max(5, ((pts - min) / range) * 100)) : 100;
    return {
      name: current.name || `Level ${current.level}`,
      min,
      next: nextMin,
      nextName: next !== current ? (next.name || `Level ${next.level}`) : 'Max Level',
      progress,
    };
  };

  const currentLevelInfo = getLevelInfo();
  const progress = currentLevelInfo.progress;

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
    featuredBundle: { background: '#1E4D4B', color: 'white', borderRadius: 16, padding: 24 },
    communityBtn: {
      background: '#E9C46A',
      color: '#343A40',
      padding: '10px 24px',
      borderRadius: 50,
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer'
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} />

      <main style={styles.mainContent}>
        <div style={styles.welcomeHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Welcome back, {user.name?.split(' ')[0]}!</h1>
              <p>Here's what's happening with your library today.</p>
            </div>
            {/* Community Button */}
            <Link to="/community-home" style={styles.communityBtn}>
              <i className="fa-solid fa-users"></i> Community
            </Link>
          </div>
        </div>

        <div style={styles.dashboardGrid}>
          <div>
            <div style={styles.pointsCard}>
              <div>
                <h3 style={{ fontSize: 16, opacity: 0.8, color: 'white' }}>Your Balance</h3>
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

              <Link to="/orders" style={styles.actionBtn}>
                <i className="fa-solid fa-box-open" style={styles.actionIcon}></i>
                <span>My Orders</span>
              </Link>
              <Link to="/profile" style={styles.actionBtn}>
                <i className="fa-solid fa-user" style={{ ...styles.actionIcon, color: '#457B9D' }}></i>
                <span>Profile</span>
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