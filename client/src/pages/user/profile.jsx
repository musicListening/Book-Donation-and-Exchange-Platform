import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { systemConfigAPI, mysteryBoxAPI } from '../../services/api';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', points: 0, level: 1, profileImage: '' });
  const [activeTab, setActiveTab] = useState('donations');
  const [cartCount, setCartCount] = useState(0);
  const [levels, setLevels] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '' });
  const [profileFile, setProfileFile] = useState(null);

  // Mystery Box and dynamic logs state
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [mysteryBoxConfigs, setMysteryBoxConfigs] = useState([]);
  const [defaultPointsCost, setDefaultPointsCost] = useState(200);
  const [transactions, setTransactions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || JSON.parse(localStorage.getItem('user')) || { name: 'Arjun Sharma', email: 'arjun@example.com', points: 450 };
    setUser(storedUser);
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);

    // Fetch level config, mystery boxes, and mystery box configurations
    const fetchConfigAndBoxes = async () => {
      try {
        const config = await systemConfigAPI.getAll();
        if (config.LEVEL_THRESHOLDS) {
          try {
            setLevels(JSON.parse(config.LEVEL_THRESHOLDS));
          } catch {}
        }
        if (config.MYSTERY_BOX_LEVEL_CONFIG) {
          try {
            setMysteryBoxConfigs(JSON.parse(config.MYSTERY_BOX_LEVEL_CONFIG));
          } catch {}
        }
        if (config.MYSTERY_BOX_POINTS_COST) {
          setDefaultPointsCost(parseInt(config.MYSTERY_BOX_POINTS_COST) || 200);
        }

        // Try to get fresh user data and sync with localStorage
        let activeUser = storedUser;
        try {
          const res = await fetch(`/api/users`);
          const users = await res.json();
          const freshUser = users.find(u => u.id === storedUser.id);
          if (freshUser) {
            activeUser = freshUser;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
            localStorage.setItem('ss_current_user', JSON.stringify(freshUser));
          }
        } catch (err) {
          console.error('Error fetching fresh user data:', err);
        }

        if (activeUser && activeUser.id) {
          // Silently auto-assign any mystery boxes the user is entitled to based on their level
          try {
            await fetch('/api/mystery-boxes/auto-assign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: activeUser.id })
            });
          } catch (autoErr) {
            console.error('Error auto-assigning mystery boxes:', autoErr);
          }

          // Fetch user mystery boxes (now includes any newly auto-assigned ones)
          try {
            const boxes = await mysteryBoxAPI.getByUser(activeUser.id);
            const seen = new Set();
            const uniqueBoxes = (boxes || []).filter(b => {
              const key = `${b.level}-${b.status}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setMysteryBoxes(uniqueBoxes);
          } catch (boxErr) {
            console.error('Error fetching mystery boxes:', boxErr);
          }

          // Fetch user points transactions
          try {
            const txRes = await fetch(`/api/users/${activeUser.id}/transactions`);
            if (txRes.ok) {
              const txData = await txRes.json();
              setTransactions(txData);
            }
          } catch (txErr) {
            console.error('Error fetching transactions:', txErr);
          }

          // Fetch user donation requests
          try {
            const donRes = await fetch(`/api/donations/user/${activeUser.id}`);
            if (donRes.ok) {
              const donData = await donRes.json();
              setDonations(donData);
            }
          } catch (donErr) {
            console.error('Error fetching donations:', donErr);
          }
        }
      } catch (err) {
        console.error('Error fetching configuration or boxes:', err);
      }
    };
    fetchConfigAndBoxes();
  }, []);

  const getPointsCostForLevel = (level) => {
    if (level === 0) return defaultPointsCost;
    const config = mysteryBoxConfigs.find(c => c.level === level);
    return config?.points !== undefined ? config.points : defaultPointsCost;
  };

  const handleClaimMysteryBox = async (boxId) => {
    setClaimingId(boxId);
    try {
      const box = mysteryBoxes.find(b => b.id === boxId);
      if (!box) return;
      const cost = getPointsCostForLevel(box.level);
      if (cost > 0 && (user.points || 0) < cost) {
        alert(`Not enough points. You need ${cost} points to claim this mystery box.`);
        return;
      }

      await mysteryBoxAPI.claim(boxId);

      // Fetch fresh user data to reflect point deduction
      try {
        const res = await fetch(`/api/users`);
        const users = await res.json();
        const freshUser = users.find(u => u.id === user.id);
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          localStorage.setItem('ss_current_user', JSON.stringify(freshUser));
        } else {
          const updatedUser = { ...user, points: Math.max(0, (user.points || 0) - cost) };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('ss_current_user', JSON.stringify(updatedUser));
        }
      } catch {
        const updatedUser = { ...user, points: Math.max(0, (user.points || 0) - cost) };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('ss_current_user', JSON.stringify(updatedUser));
      }

      // Refresh mystery boxes
      const boxes = await mysteryBoxAPI.getByUser(user.id);
      setMysteryBoxes(boxes);

      // Refresh point transactions
      try {
        const txRes = await fetch(`/api/users/${user.id}/transactions`);
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }
      } catch {}

      alert(`Mystery Box claimed successfully!${cost > 0 ? ` ${cost} points deducted.` : ''}`);
    } catch (err) {
      alert('Failed to claim mystery box: ' + err.message);
    } finally {
      setClaimingId(null);
    }
  };

  const getLevelName = () => {
    const books = Number(user.booksDonated) || 0;
    if (books < 10) return 'New Reader (Level 0)';
    if (levels.length === 0) return 'Level 1 (Book Lover)';
    const sorted = [...levels].sort((a, b) => (Number(a.minBooks || a.minPoints) || 0) - (Number(b.minBooks || b.minPoints) || 0));
    let current = sorted[0];
    for (const l of sorted) {
      if (books >= (Number(l.minBooks || l.minPoints) || 0)) {
        current = l;
      }
    }
    return `Level ${current.level} (${current.name || 'Donor'})`;
  };

  const getLevelProgress = () => {
    const books = Number(user.booksDonated) || 0;
    const sorted = Array.isArray(levels) && levels.length > 0
      ? [...levels].sort((a, b) => (Number(a.minBooks || a.minPoints) || 0) - (Number(b.minBooks || b.minPoints) || 0))
      : [{ level: 1, minBooks: 10, name: 'Book Lover' }];

    const firstLevel = sorted.find(l => l.level === 1) || sorted[0] || { minBooks: 10 };
    const firstMin = Number(firstLevel.minBooks || firstLevel.minPoints) || 10;

    if (books < firstMin) {
      return Math.max(5, Math.min(100, (books / firstMin) * 100));
    }

    let currentIdx = 0;
    for (let i = 0; i < sorted.length; i++) {
      const minReq = Number(sorted[i].minBooks || sorted[i].minPoints) || 0;
      if (books >= minReq) {
        currentIdx = i;
      }
    }

    const current = sorted[currentIdx];
    const next = sorted[currentIdx + 1] || current;
    const min = Number(current.minBooks || current.minPoints) || 0;
    const nextMin = Number(next.minBooks || next.minPoints) || min;
    const range = nextMin - min;
    if (range <= 0 || current === next) return 100;
    return Math.min(100, Math.max(5, ((books - min) / range) * 100));
  };

  const openEditModal = () => {
    setEditFormData({ name: user.name || '' });
    setProfileFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      if (profileFile) {
        formData.append('profileImage', profileFile);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update profile');
      }
      const updatedUser = await res.json();
      setUser(updatedUser);
      localStorage.setItem('ss_current_user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const levelName = getLevelName();
  const levelProgress = getLevelProgress();

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', paddingTop: 72, margin: 0 },
    header: { position: 'fixed', top: 0, left: 0, width: '100%', height: 72, background: 'white', borderBottom: '1px solid #DEE2E6', zIndex: 1000, padding: '0 40px' },
    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', maxWidth: 1440, margin: '0 auto' },
    logo: { fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 800, color: '#1E4D4B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 },
    navLinks: { display: 'flex', gap: 24 },
    navLink: { color: '#343A40', textDecoration: 'none', fontWeight: 600 },
    mainContent: { maxWidth: 1000, margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 },
    profileSide: { position: 'sticky', top: 112, height: 'fit-content' },
    profileCard: { background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' },
    avatar: { width: 100, height: 100, borderRadius: '50%', background: '#1E4D4B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, margin: '0 auto 20px', border: '4px solid #E9C46A' },
    pointsBox: { background: '#F1F3F5', padding: 16, borderRadius: 12, marginTop: 24 },
    pointsStrong: { display: 'block', fontSize: 24, color: '#1E4D4B' },
    levelContainer: { marginTop: 24, textAlign: 'left' },
    progressBar: { height: 6, background: '#F1F3F5', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
    progressFill: { width: '80%', height: '100%', background: '#E9C46A' },
    btn: { padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 20, background: '#1E4D4B', color: 'white' },
    mainCard: { background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    tabMenu: { display: 'flex', gap: 20, borderBottom: '1px solid #DEE2E6', marginBottom: 32 },
    tabLink: { padding: '12px 0', color: '#6C757D', textDecoration: 'none', fontWeight: 600, borderBottom: '2px solid transparent', cursor: 'pointer' },
    tabLinkActive: { color: '#1E4D4B', borderBottomColor: '#1E4D4B' },
    sectionTitle: { fontFamily: 'Playfair Display, serif', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 },
    historyTable: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: 12, borderBottom: '2px solid #F1F3F5', color: '#6C757D', fontSize: 13 },
    td: { padding: 12, borderBottom: '1px solid #F1F3F5', fontSize: 14 },
    successText: { color: '#2A9D8F', fontWeight: 700 },
    errorText: { color: '#E63946', fontWeight: 700 },
    settingsGroup: { display: 'flex', flexDirection: 'column', gap: 20 },
    deactivateBtn: { background: '#E63946', color: 'white', padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', width: 'fit-content' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modal: { background: 'white', padding: 32, borderRadius: 16, width: '90%', maxWidth: 400, position: 'relative' },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', marginBottom: 8, fontWeight: 600, color: '#343A40' },
    input: { width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #DEE2E6', outline: 'none' },
    closeBtn: { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6C757D' }
  };

  const renderTabContent = () => {
    if (activeTab === 'donations') {
      return (
        <div>
          <h3 style={styles.sectionTitle}><i className="fa-solid fa-hand-holding-heart"></i> My Donations</h3>
          {donations.length === 0 ? (
            <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 32, textAlign: 'center', color: '#6C757D', border: '1px dashed #DEE2E6' }}>
              <p style={{ margin: 0 }}>No donations found.</p>
            </div>
          ) : (
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Books Count</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => {
                  let statusStyle = { color: '#E9C46A', fontWeight: 700 };
                  if (donation.status === 'VERIFIED') statusStyle = styles.successText;
                  if (donation.status === 'REJECTED') statusStyle = styles.errorText;

                  return (
                    <tr key={donation.id}>
                      <td style={styles.td}>{donation.id.slice(0, 8).toUpperCase()}</td>
                      <td style={styles.td}>
                        {new Date(donation.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={styles.td}>
                        {donation.verifiedCount > 0 ? donation.verifiedCount : donation.requestedCount} books
                        {donation.category && <span style={{ fontSize: 12, color: '#888', marginLeft: 6 }}>({donation.category})</span>}
                      </td>
                      <td style={styles.td}>
                        <span style={statusStyle}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {donation.pointsAwarded > 0 ? `+${donation.pointsAwarded}` : '0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      );
    } else if (activeTab === 'points') {
      return (
        <div>
          <h3 style={styles.sectionTitle}><i className="fa-solid fa-coins"></i> Points Transaction Log</h3>
          {transactions.length === 0 ? (
            <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 32, textAlign: 'center', color: '#6C757D', border: '1px dashed #DEE2E6' }}>
              <p style={{ margin: 0 }}>No points transactions found.</p>
            </div>
          ) : (
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isEarned = tx.amount > 0;
                  return (
                    <tr key={tx.id}>
                      <td style={styles.td}>
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={styles.td}>{tx.description || tx.type}</td>
                      <td style={styles.td}>{isEarned ? 'Earned' : 'Spent'}</td>
                      <td style={{ ...styles.td, ...(isEarned ? styles.successText : styles.errorText) }}>
                        {isEarned ? `+${tx.amount}` : tx.amount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      );
    } else if (activeTab === 'mystery-boxes') {
      const unclaimed = mysteryBoxes.filter(b => b.status === 'UNCLAIMED');
      const claimed = mysteryBoxes.filter(b => b.status === 'CLAIMED');

      return (
        <div>
          <h3 style={styles.sectionTitle}>
            <i className="fa-solid fa-gift" style={{ color: '#9B59B6' }}></i> My Mystery Boxes
          </h3>
          
          {/* Unclaimed Boxes */}
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ color: '#1E4D4B', marginBottom: 16, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              Unclaimed Boxes
              {unclaimed.length > 0 && (
                <span style={{ background: '#9B59B6', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>
                  {unclaimed.length}
                </span>
              )}
            </h4>
            {unclaimed.length === 0 ? (
              <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6C757D', border: '1px dashed #DEE2E6' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
                <p style={{ margin: 0, fontWeight: 600, color: '#495057', fontSize: 15 }}>No Unclaimed Mystery Boxes</p>
                <p style={{ fontSize: 13, margin: '8px 0 0 0', lineHeight: '1.6' }}>
                  Mystery boxes are automatically awarded when you reach a new level.<br />
                  Keep donating books to level up and unlock yours!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {unclaimed.map(box => {
                  const cost = getPointsCostForLevel(box.level);
                  const canClaim = (user.points || 0) >= cost;
                  return (
                    <div key={box.id} style={{
                      background: 'white',
                      borderRadius: 12,
                      border: '2px solid #9B59B6',
                      padding: 16,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(155, 89, 182, 0.05)'
                    }}>
                      <div style={{
                        position: 'absolute', top: -15, right: -15,
                        width: 60, height: 60,
                        background: 'rgba(155, 89, 182, 0.1)',
                        borderRadius: '50%'
                      }} />
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>🎁</div>
                        <h5 style={{ margin: '0 0 4px', color: '#1E4D4B', fontSize: 14, fontWeight: 700 }}>
                          {box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}
                        </h5>
                        <p style={{ fontSize: 12, color: '#6C757D', margin: '0 0 8px', lineHeight: '1.4' }}>
                          {box.description || `${box.books?.length || 0} books inside`}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
                          <span style={{ fontSize: 11, color: '#999' }}>
                            {new Date(box.assignedAt).toLocaleDateString()}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#9B59B6' }}>
                            {cost > 0 ? `${cost} pts` : 'Free'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleClaimMysteryBox(box.id)}
                          disabled={claimingId === box.id}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: claimingId === box.id ? '#ccc' : (canClaim ? '#9B59B6' : '#E0E0E0'),
                            color: canClaim || claimingId === box.id ? 'white' : '#A0A0A0',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 700,
                            cursor: canClaim && claimingId !== box.id ? 'pointer' : 'not-allowed',
                            fontSize: 12,
                            transition: 'background-color 0.2s'
                          }}
                        >
                          {claimingId === box.id ? 'Claiming...' : (canClaim ? 'Claim Box' : 'Need More Points')}
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
            <h4 style={{ color: '#1E4D4B', marginBottom: 16, fontSize: 16 }}>
              Claimed Boxes
              {claimed.length > 0 && (
                <span style={{ marginLeft: 8, background: '#2A9D8F', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>
                  {claimed.length}
                </span>
              )}
            </h4>
            {claimed.length === 0 ? (
              <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 24, textAlign: 'center', color: '#6C757D', border: '1px solid #DEE2E6' }}>
                <p style={{ margin: 0, fontSize: 13 }}>No claimed mystery boxes yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {claimed.map(box => (
                  <div key={box.id} style={{
                    background: 'white',
                    borderRadius: 12,
                    border: '1px solid #DEE2E6',
                    padding: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h5 style={{ margin: 0, color: '#1E4D4B', fontSize: 14, fontWeight: 700 }}>
                        {box.level === 0 ? 'Default Mystery Box' : `Level ${box.level} Mystery Box`}
                      </h5>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 700,
                        background: '#E8F5E9',
                        color: '#2A9D8F'
                      }}>
                        Claimed
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#999', margin: '0 0 10px' }}>
                      Claimed on: {box.claimedAt ? new Date(box.claimedAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {box.books && box.books.length > 0 && (
                      <div style={{ borderTop: '1px solid #F1F3F5', paddingTop: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, margin: '0 0 6px', color: '#6C757D' }}>
                          Books Revealed:
                        </p>
                        {box.books.map((book, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 0',
                            fontSize: 12
                          }}>
                            <i className="fa-solid fa-book" style={{ color: '#2A9D8F', fontSize: 10 }} />
                            <span style={{ fontWeight: 600, color: '#333' }}>{book.title}</span>
                            {book.author && <span style={{ color: '#888', fontSize: 11 }}>by {book.author}</span>}
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
      );
    } else {
      return (
        <div>
          <h3 style={styles.sectionTitle}><i className="fa-solid fa-gear"></i> Account Settings</h3>
          <div style={styles.settingsGroup}>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Mobile Notifications</label><input type="checkbox" defaultChecked /> Receive updates about order status</div>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Newsletter</label><input type="checkbox" defaultChecked /> Monthly staff-curated book recommendations</div>
            <hr style={{ border: 'none', borderTop: '1px solid #DEE2E6' }} />
            <button style={styles.deactivateBtn}>Deactivate Account</button>
          </div>
        </div>
      );
    }
  };

  const unclaimedCount = mysteryBoxes.filter(b => b.status === 'UNCLAIMED').length;

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

      <main style={styles.mainContent}>
        <div style={styles.profileSide}>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {user.profileImage ? <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (user.name ? user.name[0] : 'U')}
            </div>
            <h2>{user.name}</h2>
            <p style={{ color: '#6C757D', fontSize: 14 }}>{user.email}</p>
            <div style={styles.pointsBox}><span style={{ fontSize: 12, fontWeight: 700, color: '#6C757D', textTransform: 'uppercase' }}>Points Balance</span><strong style={styles.pointsStrong}>{user.points} pts</strong></div>
            <div style={styles.levelContainer}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}><span>Level: <strong>{levelName}</strong></span><span style={{ color: '#1E4D4B', fontWeight: 700 }}>{Math.round(levelProgress)}%</span></div><div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${levelProgress}%` }}></div></div></div>
            <button style={styles.btn} onClick={openEditModal}>Edit Profile</button>

            {/* Unclaimed Mystery Box Alert */}
            {unclaimedCount > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #FFE8E8 0%, #FFF3F3 100%)',
                border: '1px dashed #E63946',
                borderRadius: 12,
                padding: 16,
                marginTop: 20,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{ fontSize: 24 }}>🎁</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#E63946' }}>Unclaimed Box!</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#666' }}>You have {unclaimedCount} unclaimed mystery box{unclaimedCount > 1 ? 'es' : ''}.</p>
                </div>
                <button
                  onClick={() => setActiveTab('mystery-boxes')}
                  style={{
                    background: '#E63946',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Claim
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.mainCard}>
          <div style={styles.tabMenu}>
            <div style={{ ...styles.tabLink, ...(activeTab === 'donations' ? styles.tabLinkActive : {}) }} onClick={() => setActiveTab('donations')}>Donation History</div>
            <div style={{ ...styles.tabLink, ...(activeTab === 'points' ? styles.tabLinkActive : {}) }} onClick={() => setActiveTab('points')}>Points Log</div>
            <div style={{ ...styles.tabLink, ...(activeTab === 'mystery-boxes' ? styles.tabLinkActive : {}) }} onClick={() => setActiveTab('mystery-boxes')}>
              Mystery Boxes
              {unclaimedCount > 0 && (
                <span style={{ marginLeft: 6, background: '#9B59B6', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                  {unclaimedCount}
                </span>
              )}
            </div>
            <div style={{ ...styles.tabLink, ...(activeTab === 'settings' ? styles.tabLinkActive : {}) }} onClick={() => setActiveTab('settings')}>Settings</div>
          </div>
          {renderTabContent()}
        </div>
      </main>

      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button style={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 20 }}>Edit Profile</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input style={styles.input} type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Profile Image</label>
                <input style={styles.input} type="file" accept="image/*" onChange={e => setProfileFile(e.target.files[0])} />
              </div>
              <button type="submit" style={styles.btn}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;