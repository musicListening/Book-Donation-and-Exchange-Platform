import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { systemConfigAPI, mysteryBoxAPI } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [levels, setLevels] = useState([]);
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [mysteryBoxConfigs, setMysteryBoxConfigs] = useState([]);
  const [defaultPointsCost, setDefaultPointsCost] = useState(200);
  const [claiming, setClaiming] = useState(null);
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' });
  const [reviewSaving, setReviewSaving] = useState(false);
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
        try {
          await fetch(`${API_BASE}/mystery-boxes/auto-assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: storedUser.id })
          });
        } catch (autoErr) {}

        const [freshUsers, boxes, config] = await Promise.all([
          fetch(`/api/users`).then(r => r.ok ? r.json() : []),
          mysteryBoxAPI.getByUser(storedUser.id).catch(() => []),
          systemConfigAPI.getAll()
        ]);

        if (config.LEVEL_THRESHOLDS) {
          try { setLevels(JSON.parse(config.LEVEL_THRESHOLDS)); } catch {}
        }
        if (config.MYSTERY_BOX_LEVEL_CONFIG) {
          try { setMysteryBoxConfigs(JSON.parse(config.MYSTERY_BOX_LEVEL_CONFIG)); } catch {}
        }
        if (config.MYSTERY_BOX_POINTS_COST) {
          setDefaultPointsCost(parseInt(config.MYSTERY_BOX_POINTS_COST) || 200);
        }

        const freshUser = Array.isArray(freshUsers) ? freshUsers.find(u => u.id === storedUser.id) : null;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          localStorage.setItem('ss_current_user', JSON.stringify(freshUser));
        }

        // Fetch user review
        try {
          const revRes = await fetch(`${API_BASE}/reviews/me/${storedUser.id}`);
          if (revRes.ok) {
            const data = await revRes.json();
            if (data) {
              setUserReview({ rating: data.rating, comment: data.comment || '' });
            }
          }
        } catch (err) {
          console.error("Error fetching review", err);
        }

        const seen = new Set();
        const uniqueBoxes = (boxes || []).filter(b => {
          if (seen.has(b.id)) return false;
          seen.add(b.id);
          return true;
        });
        setMysteryBoxes(uniqueBoxes);
      } catch (err) {}
    };
    fetchData();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('ss_current_user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getPointsCostForLevel = (level) => {
    if (level === 0) return defaultPointsCost;
    const config = mysteryBoxConfigs.find(c => c.level === level);
    return config?.points !== undefined ? config.points : defaultPointsCost;
  };

  const handleClaim = async (boxId) => {
    setClaiming(boxId);
    try {
      await mysteryBoxAPI.claim(boxId);
      const response = await mysteryBoxAPI.claim(boxId);
      const updatedBox = response.box || response;
      const cost = getPointsCostForLevel(updatedBox?.level || 0);
      const updatedUser = { ...user, points: (user.points || 0) - cost };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMysteryBoxes(prev => prev.map(b => b.id === boxId ? updatedBox : b));
      alert('Mystery box claimed successfully! Check the contents.');
      window.location.reload();
    } catch (error) {
      console.error('Error claiming:', error);
      alert('Error claiming box: ' + error.message);
    } finally {
      setClaiming(null);
    }
  };

  const handleSaveReview = async () => {
    if (userReview.rating === 0) return alert('Please select a rating star first!');
    if (!user) return alert('Please log in first.');
    setReviewSaving(true);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, rating: userReview.rating, comment: userReview.comment })
      });
      if (!res.ok) throw new Error('Failed to save review');
      alert('Review saved successfully! Thank you.');
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Error saving review. Please try again.');
    } finally {
      setReviewSaving(false);
    }
  };

  // Build level info from dynamic thresholds (based on books donated)
  const getLevelInfo = () => {
    const booksDonated = Number(user?.booksDonated) || 0;
    
    const sorted = Array.isArray(levels) && levels.length > 0
      ? [...levels].sort((a, b) => (Number(a.minBooks || a.minPoints) || 0) - (Number(b.minBooks || b.minPoints) || 0))
      : [
          { level: 1, minBooks: 10, name: 'Book Lover' },
          { level: 2, minBooks: 25, name: 'Bibliophile' },
          { level: 3, minBooks: 50, name: 'Grand Librarian' },
          { level: 4, minBooks: 75, name: 'Literary Elite' },
          { level: 5, minBooks: 100, name: 'Legendary Reader' }
        ];

    const firstLevel = sorted[0] || { level: 1, minBooks: 10, name: 'Book Lover' };
    const firstMin = Number(firstLevel.minBooks || firstLevel.minPoints) || 10;

    // Level 0: User has not reached Level 1 threshold (10 books)
    if (booksDonated < firstMin) {
      return {
        name: 'New Reader (Level 0)',
        shortName: 'New Reader',
        level: 0,
        min: 0,
        next: firstMin,
        nextName: `${firstLevel.name || 'Book Lover'} (Lvl 1)`,
        booksNeeded: firstMin - booksDonated,
        progress: Math.max(5, Math.min(100, (booksDonated / firstMin) * 100))
      };
    }

    let currentIdx = 0;
    for (let i = 0; i < sorted.length; i++) {
      const minReq = Number(sorted[i].minBooks || sorted[i].minPoints) || 0;
      if (booksDonated >= minReq) {
        currentIdx = i;
      }
    }

    const current = sorted[currentIdx];
    const next = sorted[currentIdx + 1] || current;

    const min = Number(current.minBooks || current.minPoints) || 0;
    const nextMin = Number(next.minBooks || next.minPoints) || min;
    const isMaxLevel = current === next;

    const range = nextMin - min;
    const progress = isMaxLevel || range <= 0
      ? 100
      : Math.min(100, Math.max(5, ((booksDonated - min) / range) * 100));

    return {
      name: `Level ${current.level} (${current.name || 'Donor'})`,
      shortName: current.name || `Level ${current.level}`,
      level: current.level,
      min,
      next: nextMin,
      nextName: isMaxLevel ? 'Max Level' : `${next.name || `Level ${next.level}`} (Lvl ${next.level})`,
      booksNeeded: isMaxLevel ? 0 : Math.max(0, nextMin - booksDonated),
      progress
    };
  };

  const currentLevelInfo = getLevelInfo();
  const progress = currentLevelInfo.progress;

  const unclaimed = mysteryBoxes.filter(b => b.status === 'UNCLAIMED');
  const claimed = mysteryBoxes.filter(b => b.status === 'CLAIMED');

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
                    <span>{currentLevelInfo.booksNeeded} books to {currentLevelInfo.nextName}</span>
                    <span>Lvl {currentLevelInfo.level}</span>
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
            {/* Unclaimed Boxes */}
            <div style={{ marginTop: 32 }}>
              <h2 style={{ color: '#1E4D4B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                Unclaimed Boxes
                {unclaimed.length > 0 && (
                  <span style={{ background: '#9B59B6', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 13 }}>
                    {unclaimed.length}
                  </span>
                )}
              </h2>
              {unclaimed.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 12, padding: 30, textAlign: 'center', color: '#6C757D', border: '1px dashed #DEE2E6' }}>
                  <p style={{ fontSize: 13, margin: 0 }}>Keep donating books to earn mystery boxes!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {unclaimed.map(box => {
                    const cost = getPointsCostForLevel(box.level);
                    const canAfford = (user?.points || 0) >= cost || cost === 0;
                    return (
                      <div key={box.id} style={{
                        background: 'white',
                        borderRadius: 12,
                        border: '2px solid #9B59B6',
                        padding: 16,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <h3 style={{ margin: '0 0 4px', color: '#1E4D4B', fontSize: 16 }}>
                            {box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}
                          </h3>
                          <p style={{ fontSize: 12, color: '#6C757D', margin: '0 0 12px' }}>
                            {box.description || `${box.books?.length || 0} books inside`}
                          </p>
                          <button
                            onClick={() => handleClaim(box.id)}
                            disabled={claiming === box.id || (cost > 0 && !canAfford)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: claiming === box.id ? '#ccc' : (cost > 0 && !canAfford) ? '#f0e8f7' : '#9B59B6',
                              color: (cost > 0 && !canAfford) ? '#9B59B6' : 'white',
                              border: (cost > 0 && !canAfford) ? '1px solid #9B59B6' : 'none',
                              borderRadius: 8,
                              fontWeight: 600,
                              cursor: (claiming === box.id || (cost > 0 && !canAfford)) ? 'not-allowed' : 'pointer',
                              fontSize: 13,
                              transition: 'all 0.2s'
                            }}
                          >
                            {claiming === box.id ? 'Claiming...' : (cost > 0 && !canAfford) ? `Need ${cost} pts` : `Claim (${cost > 0 ? cost + ' pts' : 'Free'})`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Claimed Boxes */}
            <div style={{ marginTop: 32 }}>
              <h2 style={{ color: '#1E4D4B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                Claimed Boxes
              </h2>
              {claimed.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 12, padding: 30, textAlign: 'center', color: '#6C757D', border: '1px dashed #DEE2E6' }}>
                  <p style={{ fontSize: 13, margin: 0 }}>No claimed boxes yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {claimed.map(box => (
                    <div key={box.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #DEE2E6', padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ margin: 0, color: '#1E4D4B', fontSize: 14 }}>
                          {box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}
                        </h3>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600, background: '#E8F5E9', color: '#2A9D8F' }}>
                          ✓ Claimed
                        </span>
                      </div>
                      {box.books && box.books.length > 0 && (
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px', color: '#343A40' }}>📚 Books inside ({box.books.length}):</p>
                          {box.books.map((book, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: idx < box.books.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                              <span style={{ fontSize: 12 }}>{book.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={styles.card}>
              <h3 style={{ marginBottom: 20 }}>Your Impact</h3>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#2A9D8F' }}>{user.booksDonated || 0}</div>
                <p style={{ color: '#6C757D', fontSize: 14 }}>Books Donated Total</p>
              </div>
              <div style={{ borderTop: '1px solid #DEE2E6', paddingTop: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#1E4D4B' }}>{((user.booksDonated || 0) * 0.1).toFixed(1)}</div>
                <p style={{ color: '#6C757D', fontSize: 14 }}>Trees Saved (Approx.)</p>
              </div>
            </div>
            <div style={{...styles.featuredBundle, background: 'white', border: '1px solid #DEE2E6', color: '#343A40', marginTop: 32}}>
              <h4 style={{ marginBottom: 12, color: '#1E4D4B' }}>My Review</h4>
              <p style={{ fontSize: 13, marginBottom: 16, color: '#6C757D' }}>Leave a review of your experience with ShareShelf. Your review might be featured on the homepage!</p>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <i 
                    key={star}
                    className="fa-solid fa-star"
                    style={{ 
                      fontSize: 24, 
                      cursor: 'pointer',
                      color: star <= userReview.rating ? '#E9C46A' : '#DEE2E6',
                      transition: 'color 0.2s'
                    }}
                    onClick={() => setUserReview(prev => ({ ...prev, rating: star }))}
                  ></i>
                ))}
              </div>

              <textarea 
                placeholder="Write a small comment (optional)..."
                value={userReview.comment}
                onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  borderRadius: 8, 
                  border: '1px solid #DEE2E6', 
                  fontFamily: 'Inter',
                  fontSize: 14,
                  minHeight: 80,
                  marginBottom: 16,
                  resize: 'vertical'
                }}
              />

              <button 
                onClick={handleSaveReview}
                disabled={reviewSaving}
                style={{ 
                  background: '#1E4D4B', 
                  color: 'white', 
                  padding: 10, 
                  width: '100%', 
                  borderRadius: 8, 
                  border: 'none',
                  cursor: reviewSaving ? 'not-allowed' : 'pointer',
                  fontWeight: 700 
                }}
              >
                {reviewSaving ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;