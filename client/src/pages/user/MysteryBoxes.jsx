import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { mysteryBoxAPI, systemConfigAPI } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');

const MysteryBoxes = () => {
  const [user, setUser] = useState(null);
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [mysteryBoxLocks, setMysteryBoxLocks] = useState([]);
  const [mysteryBoxConfigs, setMysteryBoxConfigs] = useState([]);
  const [defaultPointsCost, setDefaultPointsCost] = useState(200);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
    fetchData(storedUser.id);
  }, [navigate]);

  const fetchData = async (userId) => {
    try {
      // 1. First silently auto-assign any mystery boxes the user is entitled to
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/mystery-boxes/auto-assign`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId })
        });
      } catch (autoErr) {
        console.error('Error auto-assigning mystery boxes:', autoErr);
      }

      const token = localStorage.getItem('token');
      const [freshUsers, boxes, config] = await Promise.all([
        fetch(`${API_BASE}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(r => r.ok ? r.json() : []),
        mysteryBoxAPI.getByUser(userId),
        systemConfigAPI.getAll()
      ]);

      // 3. Update user with fresh server data (includes booksDonated, level, points)
      const freshUser = Array.isArray(freshUsers) ? freshUsers.find(u => u.id === userId) : null;
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }

      // 4. Deduplicate boxes by id (not by level+status) to show all boxes
      const seen = new Set();
      const uniqueBoxes = (boxes || []).filter(b => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });
      setMysteryBoxes(uniqueBoxes);

      // 5. Parse system config
      if (config.LEVEL_THRESHOLDS) {
        try { setLevels(JSON.parse(config.LEVEL_THRESHOLDS)); } catch {}
      }
      if (config.MYSTERY_BOX_LOCKS) {
        try { setMysteryBoxLocks(JSON.parse(config.MYSTERY_BOX_LOCKS)); } catch {}
      }
      if (config.MYSTERY_BOX_LEVEL_CONFIG) {
        try { setMysteryBoxConfigs(JSON.parse(config.MYSTERY_BOX_LEVEL_CONFIG)); } catch {}
      }
      if (config.MYSTERY_BOX_POINTS_COST) {
        setDefaultPointsCost(parseInt(config.MYSTERY_BOX_POINTS_COST) || 200);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
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
      const box = mysteryBoxes.find(b => b.id === boxId);
      const cost = getPointsCostForLevel(box?.level || 0);
      const updatedUser = { ...user, points: (user.points || 0) - cost };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMysteryBoxes(prev =>
        prev.map(b => b.id === boxId ? { ...b, status: 'CLAIMED', claimedAt: new Date().toISOString() } : b)
      );
      alert(`Mystery Box claimed!${cost > 0 ? ` ${cost} points deducted.` : ''} Check your books below.`);
    } catch (err) {
      alert('Failed to claim mystery box: ' + err.message);
    } finally {
      setClaiming(null);
    }
  };

  // Build level info from dynamic thresholds
  const getLevelInfo = () => {
    const booksDonated = Number(user?.booksDonated) || 0;

    // Build sorted levels array — prefer server config, fall back to defaults
    const sorted = Array.isArray(levels) && levels.length > 0
      ? [...levels].sort((a, b) => (Number(a.minBooks || a.minPoints) || 0) - (Number(b.minBooks || b.minPoints) || 0))
      : [
          { level: 1, minBooks: 10, name: 'Book Lover' },
          { level: 2, minBooks: 25, name: 'Bibliophile' },
          { level: 3, minBooks: 50, name: 'Grand Librarian' },
          { level: 4, minBooks: 75, name: 'Literary Elite' },
          { level: 5, minBooks: 100, name: 'Legendary Reader' }
        ];

    // Find the first level threshold (level 1)
    const firstLevelEntry = sorted.find(l => Number(l.level) === 1) || sorted[0] || { level: 1, minBooks: 10, name: 'Book Lover' };
    const firstMin = Number(firstLevelEntry.minBooks || firstLevelEntry.minPoints) || 10;

    // User hasn't reached Level 1 yet
    if (booksDonated < firstMin) {
      return {
        name: 'New Reader',
        fullName: 'New Reader (Level 0)',
        level: 0,
        min: 0,
        next: firstMin,
        nextName: `${firstLevelEntry.name || 'Book Lover'} (Lvl 1)`,
        booksNeeded: firstMin - booksDonated,
        progress: Math.max(5, Math.min(95, (booksDonated / firstMin) * 100))
      };
    }

    // Find current level
    let currentIdx = 0;
    for (let i = 0; i < sorted.length; i++) {
      const minReq = Number(sorted[i].minBooks || sorted[i].minPoints) || 0;
      if (booksDonated >= minReq) {
        currentIdx = i;
      }
    }

    const current = sorted[currentIdx];
    const next = sorted[currentIdx + 1] || null;
    const min = Number(current.minBooks || current.minPoints) || 0;
    const nextMin = next ? (Number(next.minBooks || next.minPoints) || min) : min;
    const isMaxLevel = !next;

    const range = nextMin - min;
    const progress = isMaxLevel || range <= 0
      ? 100
      : Math.min(100, Math.max(5, ((booksDonated - min) / range) * 100));

    const currentName = current.name || `Level ${current.level}`;

    return {
      name: currentName,
      fullName: `${currentName} (Level ${current.level})`,
      level: current.level,
      min,
      next: nextMin,
      nextName: isMaxLevel ? 'Max Level 🏆' : `${next.name || `Level ${next.level}`} (Lvl ${next.level})`,
      booksNeeded: isMaxLevel ? 0 : Math.max(0, nextMin - booksDonated),
      progress,
      isMaxLevel
    };
  };

  const levelInfo = getLevelInfo();
  const unclaimed = mysteryBoxes.filter(b => b.status === 'UNCLAIMED');
  const claimed = mysteryBoxes.filter(b => b.status === 'CLAIMED');

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: '#1E4D4B', fontSize: 18 }}>
      Loading Mystery Boxes...
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', minHeight: '100vh' }}>
      <Navbar variant="user" user={user} />
      <main style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: '#1E4D4B', margin: 0 }}>Mystery Boxes</h1>
          <p style={{ color: '#6C757D', marginTop: 8 }}>Claim your mystery boxes and discover surprise books!</p>
        </div>

        {/* Level Progress Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1E4D4B 0%, #2A9D8F 100%)',
          color: 'white',
          borderRadius: 16,
          padding: 28,
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>Current Level</p>
            <h2 style={{ margin: '6px 0 4px', fontSize: 26, fontWeight: 800 }}>{levelInfo.fullName}</h2>
            <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
              {user?.booksDonated || 0} book{(user?.booksDonated || 0) !== 1 ? 's' : ''} donated
            </p>
          </div>
          <div style={{ width: '45%', flexShrink: 0 }}>
            {levelInfo.isMaxLevel ? (
              <div style={{ textAlign: 'center', fontSize: 14, opacity: 0.9, fontWeight: 600 }}>
                🏆 Maximum Level Reached!
              </div>
            ) : (
              <>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: '#E9C46A',
                    width: `${levelInfo.progress}%`,
                    borderRadius: 5,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8, opacity: 0.85 }}>
                  <span>{levelInfo.booksNeeded} book{levelInfo.booksNeeded !== 1 ? 's' : ''} to {levelInfo.nextName}</span>
                  <span>Lvl {levelInfo.level} → {levelInfo.level + 1}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Unclaimed Boxes */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ color: '#1E4D4B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            Unclaimed Boxes
            {unclaimed.length > 0 && (
              <span style={{ background: '#9B59B6', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 13 }}>
                {unclaimed.length}
              </span>
            )}
          </h2>
          {unclaimed.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6C757D' }}>
              <i className="fa-solid fa-gift" style={{ fontSize: 36, color: '#DEE2E6', marginBottom: 14, display: 'block' }} />
              <p style={{ fontWeight: 600, marginBottom: 6 }}>No unclaimed mystery boxes yet.</p>
              <p style={{ fontSize: 13 }}>Keep donating books to earn mystery boxes!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {unclaimed.map(box => {
                const cost = getPointsCostForLevel(box.level);
                const canAfford = (user?.points || 0) >= cost || cost === 0;
                return (
                  <div key={box.id} style={{
                    background: 'white',
                    borderRadius: 12,
                    border: '2px solid #9B59B6',
                    padding: 20,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute', top: -20, right: -20,
                      width: 80, height: 80,
                      background: 'rgba(155, 89, 182, 0.1)',
                      borderRadius: '50%'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>&#127873;</div>
                      <h3 style={{ margin: '0 0 4px', color: '#1E4D4B', fontSize: 16 }}>
                        {box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}
                      </h3>
                      <p style={{ fontSize: 13, color: '#6C757D', margin: '0 0 6px' }}>
                        {box.description || `${box.books?.length || 0} books inside`}
                      </p>
                      <p style={{ fontSize: 12, color: '#999', margin: '0 0 4px' }}>
                        Assigned: {new Date(box.assignedAt || box.createdAt).toLocaleDateString()}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#9B59B6', margin: '0 0 16px' }}>
                        {cost > 0 ? `Cost: ${cost} pts` : 'Free to Claim'}
                      </p>
                      {cost > 0 && !canAfford && (
                        <p style={{ fontSize: 12, color: '#E63946', margin: '0 0 10px' }}>
                          You need {cost - (user?.points || 0)} more points
                        </p>
                      )}
                      <button
                        onClick={() => handleClaim(box.id)}
                        disabled={claiming === box.id || (cost > 0 && !canAfford)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: claiming === box.id ? '#ccc' : (cost > 0 && !canAfford) ? '#f0e8f7' : '#9B59B6',
                          color: (cost > 0 && !canAfford) ? '#9B59B6' : 'white',
                          border: (cost > 0 && !canAfford) ? '1px solid #9B59B6' : 'none',
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: (claiming === box.id || (cost > 0 && !canAfford)) ? 'not-allowed' : 'pointer',
                          fontSize: 14,
                          transition: 'all 0.2s'
                        }}
                      >
                        {claiming === box.id ? 'Claiming...' : (cost > 0 && !canAfford) ? 'Not Enough Points' : 'Claim Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Claimed Boxes */}
        <div>
          <h2 style={{ color: '#1E4D4B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            Claimed Boxes
            {claimed.length > 0 && (
              <span style={{ background: '#2A9D8F', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 13 }}>
                {claimed.length}
              </span>
            )}
          </h2>
          {claimed.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6C757D' }}>
              <p>No claimed mystery boxes yet. Claim an unclaimed box above!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {claimed.map(box => (
                <div key={box.id} style={{
                  background: 'white',
                  borderRadius: 12,
                  border: '1px solid #DEE2E6',
                  padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0, color: '#1E4D4B', fontSize: 16 }}>
                      {box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}
                    </h3>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: '#E8F5E9',
                      color: '#2A9D8F'
                    }}>
                      ✓ Claimed
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6C757D', margin: '0 0 12px' }}>
                    Claimed on: {box.claimedAt ? new Date(box.claimedAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {box.books && box.books.length > 0 && (
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: '#343A40' }}>
                        📚 Books inside ({box.books.length}):
                      </p>
                      {box.books.map((book, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 0',
                          borderBottom: idx < box.books.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}>
                          <i className="fa-solid fa-book" style={{ color: '#2A9D8F', fontSize: 12 }} />
                          <span style={{ fontSize: 13 }}>{book.title}</span>
                          {book.author && <span style={{ fontSize: 12, color: '#999' }}>by {book.author}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MysteryBoxes;
