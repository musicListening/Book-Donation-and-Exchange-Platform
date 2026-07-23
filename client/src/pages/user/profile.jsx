import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { systemConfigAPI } from '../../services/api';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', points: 0, level: 1, profileImage: '' });
  const [activeTab, setActiveTab] = useState('donations');
  const [cartCount, setCartCount] = useState(0);
  const [levels, setLevels] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '' });
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { name: 'Arjun Sharma', email: 'arjun@example.com', points: 450 };
    setUser(storedUser);
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);

    // Fetch level config
    const fetchConfig = async () => {
      try {
        const config = await systemConfigAPI.getAll();
        if (config.LEVEL_THRESHOLDS) {
          try {
            setLevels(JSON.parse(config.LEVEL_THRESHOLDS));
          } catch {}
        }
      } catch {}
    };
    fetchConfig();
  }, []);

  const getLevelName = () => {
    if (levels.length === 0) return 'Bibliophile';
    const sorted = [...levels].sort((a, b) => a.minPoints - b.minPoints);
    const found = sorted.find(l => l.level === (user.level || 1));
    return found ? found.name : `Level ${user.level || 1}`;
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

  const getLevelProgress = () => {
    if (levels.length === 0) return 80;
    const sorted = [...levels].sort((a, b) => a.minPoints - b.minPoints);
    const idx = sorted.findIndex(l => l.level === (user.level || 1));
    const current = sorted[idx] || sorted[0];
    const next = sorted[idx + 1] || current;
    const min = parseInt(current.minPoints) || 0;
    const nextMin = parseInt(next.minPoints) || min + 1;
    const pts = user.points || 0;
    const range = nextMin - min;
    if (range <= 0) return 100;
    return Math.min(100, Math.max(5, ((pts - min) / range) * 100));
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
          <table style={styles.historyTable}>
            <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Date</th><th style={styles.th}>Books</th><th style={styles.th}>Status</th><th style={styles.th}>Points Earned</th></tr></thead>
            <tbody>
              <tr><td style={styles.td}>DON-101</td><td style={styles.td}>May 10, 2025</td><td style={styles.td}>5 Fiction</td><td style={styles.td}><span style={styles.successText}>Verified</span></td><td style={styles.td}>+50</td></tr>
              <tr><td style={styles.td}>DON-088</td><td style={styles.td}>Apr 22, 2025</td><td style={styles.td}>12 Academic</td><td style={styles.td}><span style={styles.successText}>Verified</span></td><td style={styles.td}>+150</td></tr>
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'points') {
      return (
        <div>
          <h3 style={styles.sectionTitle}><i className="fa-solid fa-coins"></i> Points Transaction Log</h3>
          <table style={styles.historyTable}>
            <thead><tr><th style={styles.th}>Date</th><th style={styles.th}>Description</th><th style={styles.th}>Type</th><th style={styles.th}>Amount</th></tr></thead>
            <tbody>
              <tr><td style={styles.td}>May 10</td><td style={styles.td}>Donation #DON-101 Verification</td><td style={styles.td}>Earned</td><td style={{ ...styles.td, ...styles.successText }}>+50</td></tr>
              <tr><td style={styles.td}>May 07</td><td style={styles.td}>Purchase: Cozy Winter Reads</td><td style={styles.td}>Spent</td><td style={{ ...styles.td, ...styles.errorText }}>-250</td></tr>
            </tbody>
          </table>
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

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

      <main style={styles.mainContent}>
        <div style={styles.profileSide}>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {user.profileImage ? <img src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (user.name ? user.name[0] : 'U')}
            </div>
            <h2>{user.name}</h2>
            <p style={{ color: '#6C757D', fontSize: 14 }}>{user.email}</p>
            <div style={styles.pointsBox}><span style={{ fontSize: 12, fontWeight: 700, color: '#6C757D', textTransform: 'uppercase' }}>Points Balance</span><strong style={styles.pointsStrong}>{user.points} pts</strong></div>
            <div style={styles.levelContainer}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}><span>Level: <strong>{levelName}</strong></span><span style={{ color: '#1E4D4B', fontWeight: 700 }}>{Math.round(levelProgress)}%</span></div><div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${levelProgress}%` }}></div></div></div>
            <button style={styles.btn} onClick={openEditModal}>Edit Profile</button>
          </div>
        </div>

        <div style={styles.mainCard}>
          <div style={styles.tabMenu}>
            <div style={{ ...styles.tabLink, ...(activeTab === 'donations' ? styles.tabLinkActive : {}) }} onClick={() => setActiveTab('donations')}>Donation History</div>
            <div style={{ ...styles.tabLink, ...(activeTab === 'points' ? styles.tabLinkActive : {}) }} onClick={() => setActiveTab('points')}>Points Log</div>
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