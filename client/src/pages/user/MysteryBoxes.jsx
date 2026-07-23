import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { mysteryBoxAPI, systemConfigAPI } from '../../services/api';

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
      // First, silently auto-assign any mystery boxes the user is entitled to
      try {
        await fetch('/api/mystery-boxes/auto-assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (autoErr) {
        console.error('Error auto-assigning mystery boxes:', autoErr);
      }

      const [boxes, config] = await Promise.all([
        mysteryBoxAPI.getByUser(userId),
        systemConfigAPI.getAll()
      ]);
      const seen = new Set();
      const uniqueBoxes = (boxes || []).filter(b => {
        const key = `${b.level}-${b.status}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setMysteryBoxes(uniqueBoxes);
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
      const cost = getPointsCostForLevel(mysteryBoxes.find(b => b.id === boxId)?.level || 0);
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

  const getLevelInfo = () => {
    const booksDonated = user?.booksDonated || 0;
    if (levels.length === 0) {
      if (booksDonated >= 100) return { name: 'Legendary Reader', level: 5, min: 75, next: 100, nextName: 'Max Level', progress: 100 };
      if (booksDonated >= 75) return { name: 'Literary Elite', level: 4, min: 50, next: 75, nextName: 'Legendary Reader', progress: Math.min(100, ((booksDonated - 50) / 25) * 100) };
      if (booksDonated >= 50) return { name: 'Grand Librarian', level: 3, min: 25, next: 50, nextName: 'Literary Elite', progress: ((booksDonated - 25) / 25) * 100 };
      if (booksDonated >= 25) return { name: 'Bibliophile', level: 2, min: 10, next: 25, nextName: 'Grand Librarian', progress: ((booksDonated - 10) / 15) * 100 };
      if (booksDonated >= 10) return { name: 'Book Lover', level: 1, min: 10, next: 25, nextName: 'Bibliophile (Lvl 2)', progress: 100 };
      return { name: 'New Reader', level: 0, min: 0, next: 10, nextName: 'Book Lover (Lvl 1)', progress: Math.max(5, (booksDonated / 10) * 100) };
    }
    const sorted = [...levels].sort((a, b) => (a.minPoints || a.minBooks || 0) - (b.minPoints || b.minBooks || 0));
    const lvl1Min = sorted[0] ? (sorted[0].minBooks || sorted[0].minPoints || 10) : 10;

    if (booksDonated < lvl1Min) {
      return {
        name: 'New Reader',
        level: 0,
        min: 0,
        next: lvl1Min,
        nextName: `${sorted[0]?.name || 'Book Lover'} (Lvl 1)`,
        progress: Math.max(5, (booksDonated / lvl1Min) * 100)
      };
    }

    const currentLevel = user?.level || (booksDonated >= 10 ? 1 : 0);
    const idx = sorted.findIndex(l => l.level === currentLevel);
    const current = sorted[idx >= 0 ? idx : 0];
    const next = sorted[(idx >= 0 ? idx : 0) + 1] || current;
    const min = current.minBooks || current.minPoints || 0;
    const nextMin = next.minBooks || next.minPoints || min;
    const range = nextMin - min;
    return {
      name: current.name || `Level ${current.level}`,
      level: current.level,
      min,
      next: nextMin,
      nextName: next !== current ? (next.name || `Level ${next.level}`) : 'Max Level',
      progress: range > 0 ? Math.min(100, Math.max(5, ((booksDonated - min) / range) * 100)) : 100,
    };
  };

  const levelInfo = getLevelInfo();
  const unclaimed = mysteryBoxes.filter(b => b.status === 'UNCLAIMED');
  const claimed = mysteryBoxes.filter(b => b.status === 'CLAIMED');

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', minHeight: '100vh' }}>
      <Navbar variant="user" user={user} />
      <main style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: '#1E4D4B' }}>Mystery Boxes</h1>
          <p style={{ color: '#6C757D' }}>Claim your mystery boxes and discover surprise books!</p>
        </div>

        {/* Level Progress Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1E4D4B 0%, #2A9D8F 100%)',
          color: 'white',
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>Current Level</p>
            <h2 style={{ margin: '4px 0', fontSize: 28 }}>{levelInfo.name}</h2>
            <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
              {user?.booksDonated || 0} books donated
            </p>
          </div>
          <div style={{ width: '40%' }}>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#E9C46A', width: `${levelInfo.progress}%`, borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8, opacity: 0.8 }}>
              <span>{Math.max(0, levelInfo.next - (user?.booksDonated || 0))} books to {levelInfo.nextName}</span>
              <span>Lvl {levelInfo.level || user?.level || 1}</span>
            </div>
          </div>
        </div>

        {/* Unclaimed Boxes */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: '#1E4D4B', marginBottom: 16 }}>
            Unclaimed Boxes
            {unclaimed.length > 0 && (
              <span style={{ marginLeft: 8, background: '#9B59B6', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 13 }}>
                {unclaimed.length}
              </span>
            )}
          </h2>
          {unclaimed.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6C757D' }}>
              <i className="fa-solid fa-gift" style={{ fontSize: 32, color: '#DEE2E6', marginBottom: 12, display: 'block' }} />
              <p>No unclaimed mystery boxes yet.</p>
              <p style={{ fontSize: 13 }}>Keep donating books to earn mystery boxes from staff!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {unclaimed.map(box => (
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
                    <div style={{ fontSize: 32, marginBottom: 8 }}>&#127873;</div>
                    <h3 style={{ margin: '0 0 4px', color: '#1E4D4B' }}>{box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}</h3>
                    <p style={{ fontSize: 13, color: '#6C757D', margin: '0 0 8px' }}>
                      {box.description || `${box.books?.length || 0} books inside`}
                    </p>
                    <p style={{ fontSize: 12, color: '#999', margin: '0 0 4px' }}>
                      Assigned: {new Date(box.assignedAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#9B59B6', margin: '0 0 16px' }}>
                      {getPointsCostForLevel(box.level) > 0 ? `Cost: ${getPointsCostForLevel(box.level)} pts` : 'Free'}
                    </p>
                    <button
                      onClick={() => handleClaim(box.id)}
                      disabled={claiming === box.id}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: claiming === box.id ? '#ccc' : '#9B59B6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: claiming === box.id ? 'not-allowed' : 'pointer',
                        fontSize: 14
                      }}
                    >
                      {claiming === box.id ? 'Claiming...' : 'Claim Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claimed Boxes */}
        <div>
          <h2 style={{ color: '#1E4D4B', marginBottom: 16 }}>
            Claimed Boxes
            {claimed.length > 0 && (
              <span style={{ marginLeft: 8, background: '#2A9D8F', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 13 }}>
                {claimed.length}
              </span>
            )}
          </h2>
          {claimed.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6C757D' }}>
              <p>No claimed mystery boxes yet.</p>
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
                    <h3 style={{ margin: 0, color: '#1E4D4B', fontSize: 16 }}>{box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}</h3>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: '#E8F5E9',
                      color: '#2A9D8F'
                    }}>
                      Claimed
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6C757D', margin: '0 0 12px' }}>
                    Claimed: {box.claimedAt ? new Date(box.claimedAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {box.books && box.books.length > 0 && (
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>Books inside:</p>
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
