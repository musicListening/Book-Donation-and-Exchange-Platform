import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', points: 0 });
  const [activeTab, setActiveTab] = useState('donations');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { name: 'Arjun Sharma', email: 'arjun@example.com', points: 450 };
    setUser(storedUser);
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);
  }, []);

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
    deactivateBtn: { background: '#E63946', color: 'white', padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }
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
            <div style={styles.avatar}>{user.name[0]}</div>
            <h2>{user.name}</h2>
            <p style={{ color: '#6C757D', fontSize: 14 }}>{user.email}</p>
            <div style={styles.pointsBox}><span style={{ fontSize: 12, fontWeight: 700, color: '#6C757D', textTransform: 'uppercase' }}>Points Balance</span><strong style={styles.pointsStrong}>{user.points} pts</strong></div>
            <div style={styles.levelContainer}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}><span>Level: <strong>Bibliophile</strong></span><span style={{ color: '#1E4D4B', fontWeight: 700 }}>80%</span></div><div style={styles.progressBar}><div style={styles.progressFill}></div></div></div>
            <button style={styles.btn}>Edit Profile</button>
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
    </div>
  );
};

export default Profile;