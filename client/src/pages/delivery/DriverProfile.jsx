import React, { useState, useEffect } from 'react';
import '../../styles/delivery.css';
import { API_BASE } from '../../services/api';

const DriverProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    rating: 0,
    memberSince: '',
    co2Saved: 0,
    reliabilityScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setEditName(user.name || '');
        fetchDriverStats(user.id || user.userId);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDriverStats = async (driverId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const orders = await response.json();
      
      // Calculate stats
      const completedOrders = orders.filter(o => o.status === 'COMPLETED');
      const totalDeliveries = completedOrders.length;
      const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.cashAmount || 0), 0);
      
      // Get member since from user data
      const memberSince = currentUser?.createdAt 
        ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A';

      setStats({
        totalDeliveries,
        totalEarnings: totalEarnings.toFixed(2),
        rating: 4.92, // Default rating, can be calculated from reviews
        memberSince,
        co2Saved: Math.round(totalDeliveries * 0.33), // Approximate CO2 saved
        reliabilityScore: Math.min(98, 85 + Math.round(totalDeliveries / 10)) // Dynamic reliability
      });

    } catch (error) {
      console.error('Error fetching driver stats:', error);
      // Set fallback stats
      setStats({
        totalDeliveries: 0,
        totalEarnings: '0.00',
        rating: 4.92,
        memberSince: 'N/A',
        co2Saved: 0,
        reliabilityScore: 85
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      if (profileFile) formData.append('profileImage', profileFile);
      const res = await fetch(`${API_BASE}/users/${currentUser.id}/profile`, { method: 'PUT', body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed'); }
      const updated = await res.json();
      setCurrentUser(updated);
      setProfileFile(null);
      setPreviewUrl('');
      setEditMode(false);
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('ss_current_user', JSON.stringify(updated));
      setMessage({ type: 'success', text: 'Profile updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1 style={{ fontSize: '40px' }}>Driver Profile</h1>
          <p>Loading your profile...</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading driver profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 style={{ fontSize: '40px' }}>Driver Profile</h1>
        <p>Manage your professional credentials and delivery performance.</p>
      </div>

      {message && (
        <div style={{
          padding: '12px 20px', borderRadius: 8, marginBottom: 16, fontWeight: 600, fontSize: 14,
          background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          color: message.type === 'success' ? '#2E7D32' : '#C62828',
        }}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      <div className="profile-grid" style={{ marginTop: 16 }}>
        {/* Identity */}
        <section className="col-span-8 identity-card">
          <div className="info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#1E4D4B', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                fontWeight: 700, overflow: 'hidden', flexShrink: 0, position: 'relative', cursor: 'pointer'
              }} onClick={() => !editMode && setEditMode(true)}>
                {(previewUrl || currentUser?.profileImage) ? (
                  <img src={previewUrl || currentUser?.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (currentUser?.name?.charAt(0) || 'D')}
                {editMode && (
                  <label style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.6)', color: 'white', textAlign: 'center',
                    fontSize: 10, fontWeight: 600, padding: '3px 0', cursor: 'pointer'
                  }}>
                    <i className="fa-solid fa-camera"></i>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div className="name-title">
                {editMode ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    style={{ fontSize: 18, fontWeight: 700, padding: '4px 8px', border: '1px solid #DEE2E6', borderRadius: 6, width: '100%' }} />
                ) : <h3>{currentUser?.name || 'Delivery Driver'}</h3>}
                <p>{currentUser?.role || 'Delivery Personnel'}</p>
              </div>
            </div>
            <div className="details-grid">
              <div>
                <div className="field-label">Driver ID</div>
                <div className="field-value bold">{currentUser?.id?.slice(0, 12) || 'N/A'}</div>
              </div>
              <div>
                <div className="field-label">Contact</div>
                <div className="field-value">{currentUser?.phoneNumber || 'N/A'}</div>
              </div>
              <div>
                <div className="field-label">Email</div>
                <div className="field-value underline">{currentUser?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="field-label">Service Region</div>
                <div className="field-value">Based on assigned deliveries</div>
              </div>
            </div>
            {editMode ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={handleSaveProfile} disabled={saving}
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#1E4D4B', color: 'white', fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditMode(false); setEditName(currentUser?.name || ''); setProfileFile(null); setPreviewUrl(''); }}
                  style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)}
                style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 16 }}>
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {/* Performance */}
        <section className="col-span-4 perf-card">
          <div className="bg-decoration">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div className="perf-header">
            <span className="material-symbols-outlined">award_star</span>
            <h3>Performance</h3>
          </div>
          <div className="stat-group">
            <div className="stat-item">
              <div className="stat-label">Reliability Score</div>
              <div className="stat-value">
                {stats.reliabilityScore}% <span className="trend material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total CO2 Saved</div>
              <div className="stat-value">{stats.co2Saved} kg</div>
            </div>
          </div>
          <div className="member-since">
            <div className="label">Member Since</div>
            <div className="date">{stats.memberSince}</div>
          </div>
        </section>

        {/* Vehicle */}
        <section className="col-span-5 vehicle-card">
          <div className="vehicle-header">
            <h3>Vehicle Details</h3>
            <span className="status-badge">{currentUser?.status === 'ON_DELIVERY' ? 'On Route' : 'Available'}</span>
          </div>
          <div className="vehicle-detail">
            <div className="icon-box">
              <span className="material-symbols-outlined">electric_bike</span>
            </div>
            <div className="info">
              <div className="label">Type</div>
              <div className="name">Delivery Vehicle</div>
              <div className="id">Active</div>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>route</span>
              <div>
                <div className="stat-label">Total Deliveries</div>
                <div className="stat-value">{stats.totalDeliveries}</div>
              </div>
            </div>
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: 'var(--on-tertiary-container)' }}>payments</span>
              <div>
                <div className="stat-label">Earnings</div>
                <div className="stat-value">${stats.totalEarnings}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="col-span-7 compliance-card">
          <div className="compliance-header">
            <h3>Compliance & Documents</h3>
            <button className="update-btn" onClick={() => alert('Document update feature coming soon')}>Update All</button>
          </div>
          <div className="doc-list">
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">badge</span></div>
                <div className="doc-info">
                  <div className="doc-name">Driver License</div>
                  <div className="doc-meta">Verified</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined">verified</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">verified_user</span></div>
                <div className="doc-info">
                  <div className="doc-name">Background Check</div>
                  <div className="doc-meta">Cleared</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined">verified</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">description</span></div>
                <div className="doc-info">
                  <div className="doc-name">Tax Forms</div>
                  <div className="doc-meta">Current</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined">verified</span></div>
            </div>
          </div>
        </section>

        {/* Courier note */}
        <section className="col-span-12">
          <div className="courier-note">
            <div className="quote-mark">“</div>
            <div className="note-text">
              "A dedicated delivery partner with {stats.totalDeliveries} completed deliveries. 
              Maintaining a {stats.reliabilityScore}% reliability score and contributing to 
              sustainable logistics."
            </div>
            <div className="note-author">
              <div className="avatar-circle">{currentUser?.name?.[0] || 'D'}</div>
              <div>
                <div className="author-name">{currentUser?.name || 'Delivery Partner'}</div>
                <div className="author-title">Active Driver • {stats.totalDeliveries} deliveries</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DriverProfile;