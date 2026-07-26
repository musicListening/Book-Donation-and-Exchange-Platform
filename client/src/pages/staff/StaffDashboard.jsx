// pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { API_BASE } from '../../services/api';

function StaffDashboard() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0
  });
  
  // ===== MYSTERY BOX STATE =====
  const [mysteryBoxDonations, setMysteryBoxDonations] = useState([]);
  const [showMysteryBoxModal, setShowMysteryBoxModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [awardingBox, setAwardingBox] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'OPERATIONS_STAFF',
          id: user.id || user.userId || 'test-user-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({ name: 'Test Staff', role: 'OPERATIONS_STAFF', id: 'test-user-123' });
      }
    } else {
      setCurrentUser({ name: 'Test Staff', role: 'OPERATIONS_STAFF', id: 'test-user-123' });
    }
  }, []);

  // ===== LOAD DONATIONS FROM DATABASE =====
  const loadDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/donations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load donations');
      }

      const data = await response.json();
      console.log('📦 Donations loaded:', data.length);

      // Process donations
      const pending = data.filter(d => d.status === 'PENDING');
      const verified = data.filter(d => d.status === 'VERIFIED');
      const rejected = data.filter(d => d.status === 'REJECTED');
      
      setStats({
        pending: pending.length,
        verified: verified.length,
        rejected: rejected.length,
        total: data.length
      });

      // Get verified donations eligible for mystery box (not yet awarded)
      const eligibleForBox = data.filter(d => 
        d.status === 'VERIFIED' && 
        d.awardedMysteryBox !== true &&
        (d.verifiedCount || d.bookCount || 0) >= 10
      );
      
      setMysteryBoxDonations(eligibleForBox);
      setDonations(data);

    } catch (error) {
      console.error('❌ Error loading donations:', error);
      // Fallback mock data
      const mockDonations = [
        { id: '1', donor: 'Kasun Kalhara', status: 'PENDING', bookCount: 15, createdAt: new Date().toISOString() },
        { id: '2', donor: 'Savinthi Minaya', status: 'VERIFIED', bookCount: 3, createdAt: new Date().toISOString() },
        { id: '3', donor: 'Amal Perera', status: 'PENDING', bookCount: 50, createdAt: new Date().toISOString() },
        { id: '4', donor: 'Nimal Fernando', status: 'VERIFIED', bookCount: 25, createdAt: new Date().toISOString() }
      ];
      setDonations(mockDonations);
      setStats({
        pending: 2,
        verified: 2,
        rejected: 0,
        total: 4
      });
      setMysteryBoxDonations([
        { id: '4', donor: 'Nimal Fernando', verifiedCount: 25, bookCount: 25, awardedMysteryBox: false },
        { id: '2', donor: 'Savinthi Minaya', verifiedCount: 3, bookCount: 3, awardedMysteryBox: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  // ===== AWARD MYSTERY BOX =====
  const handleAwardMysteryBox = async (donation) => {
    setSelectedDonation(donation);
    setShowMysteryBoxModal(true);
  };

  const handleConfirmMysteryBox = async () => {
    if (!selectedDonation) return;
    
    setAwardingBox(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/donations/${selectedDonation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          awardedMysteryBox: true,
          status: 'VERIFIED',
          notes: (selectedDonation.notes || '') + ' 🎁 Mystery Box awarded by staff.'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to award mystery box');
      }

      alert(`🎁 Mystery Box awarded to ${selectedDonation.donor}!`);
      
      // Remove from list
      setMysteryBoxDonations(mysteryBoxDonations.filter(d => d.id !== selectedDonation.id));
      setShowMysteryBoxModal(false);
      setSelectedDonation(null);
      
      // Refresh data
      loadDonations();
      
    } catch (error) {
      console.error('Error awarding mystery box:', error);
      alert('Failed to award mystery box. Please try again.');
    } finally {
      setAwardingBox(false);
    }
  };

  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'SD';
  };

  const getFirstName = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      return names[0];
    }
    return 'Staff';
  };

  // ===== GET STATUS BADGE =====
  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'draft';
      case 'VERIFIED': return 'published';
      case 'REJECTED': return 'rejected';
      default: return 'draft';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Operations Dashboard</h1>
          <p className="page-subtitle">Welcome back, {getFirstName()}! Here's your donation overview.</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📥 PENDING</h3>
          <div className="stat-value" style={{ color: '#ffc107' }}>{stats.pending}</div>
          <div className="stat-trend">Awaiting verification</div>
          <div className="stat-sub">Donations need review</div>
        </div>

        <div className="stat-card">
          <h3>✅ VERIFIED</h3>
          <div className="stat-value" style={{ color: '#28a745' }}>{stats.verified}</div>
          <div className="stat-trend">Points awarded</div>
          <div className="stat-sub">Completed donations</div>
        </div>

        <div className="stat-card">
          <h3>❌ REJECTED</h3>
          <div className="stat-value" style={{ color: '#dc3545' }}>{stats.rejected}</div>
          <div className="stat-trend">Not accepted</div>
          <div className="stat-sub">Rejected donations</div>
        </div>

        <div className="stat-card" style={{ border: '2px solid #9c27b0' }}>
          <h3>🎁 MYSTERY BOX</h3>
          <div className="stat-value" style={{ color: '#9c27b0' }}>{mysteryBoxDonations.length}</div>
          <div className="stat-trend">Eligible donors</div>
          <div className="stat-sub">10+ books verified</div>
        </div>
      </div>

      {/* ===== TWO COLUMN LAYOUT ===== */}
      <div className="two-column">
        {/* LEFT: Recent Donations - NO VERIFY BUTTON */}
        <div className="card-panel">
          <div className="panel-header">
            <h3>📋 Recent Donations</h3>
            <span className="pending-count">{stats.pending} pending</span>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : donations.length === 0 ? (
            <p className="empty-state">No donations yet</p>
          ) : (
            donations.slice(0, 10).map((donation) => (
              <div 
                key={donation.id} 
                className="donation-item"
                style={{ 
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{donation.donor || donation.user?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {donation.bookCount || donation.verifiedCount || 0} books • {formatDate(donation.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`status-badge ${getStatusBadge(donation.status)}`}>
                    {donation.status || 'PENDING'}
                  </span>
                  {/* ✅ VERIFY BUTTON REMOVED - Only status badge remains */}
                </div>
              </div>
            ))
          )}

          <div className="table-footer">
            <span>Showing last {Math.min(10, donations.length)} of {stats.total} donations</span>
            <button 
              className="btn-small" 
              onClick={() => window.location.href = '/staff/donation-schedule'}
              style={{ background: 'transparent', border: '1px solid #1E4D4B', color: '#1E4D4B', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              View All →
            </button>
          </div>
        </div>

        {/* RIGHT: Mystery Box Eligible Donors */}
        <div className="card-panel" style={{ border: '2px solid #9c27b0' }}>
          <div className="panel-header">
            <h3>🎁 Mystery Box Eligible</h3>
            <span style={{ 
              padding: '2px 12px', 
              borderRadius: '20px', 
              background: '#f3e5f5', 
              color: '#9c27b0',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {mysteryBoxDonations.length} donors
            </span>
          </div>

          {mysteryBoxDonations.length === 0 ? (
            <div style={{ 
              padding: '30px 20px', 
              textAlign: 'center', 
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
              <p>No eligible donors yet</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Donors with 10+ verified books qualify
              </p>
            </div>
          ) : (
            mysteryBoxDonations.map((donation) => (
              <div 
                key={donation.id} 
                style={{ 
                  padding: '14px 16px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  background: '#faf5ff',
                  border: '1px solid #e8d5f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#1E4D4B' }}>
                    {donation.donor || donation.user?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    📚 {donation.verifiedCount || donation.bookCount || 0} books verified
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#9c27b0',
                    marginTop: '2px',
                    fontWeight: '500'
                  }}>
                    ⭐ Eligible for Mystery Box!
                  </div>
                </div>
                <button 
                  className="btn-small" 
                  onClick={() => handleAwardMysteryBox(donation)}
                  style={{ 
                    background: '#9c27b0', 
                    color: 'white', 
                    border: 'none', 
                    padding: '6px 16px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  🎁 Award
                </button>
              </div>
            ))
          )}

          <div style={{ 
            marginTop: '12px', 
            padding: '10px 16px', 
            background: '#fff3e0', 
            borderRadius: '6px',
            fontSize: '13px',
            color: '#e65100'
          }}>
            💡 Donors with 10+ verified books qualify for a Mystery Box
          </div>
        </div>
      </div>

      {/* ===== MYSTERY BOX AWARD MODAL ===== */}
      {showMysteryBoxModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <h2 style={{ color: '#9c27b0' }}>🎁 Award Mystery Box</h2>
            <p className="modal-subtitle">
              Award a mystery box to <strong>{selectedDonation.donor || selectedDonation.user?.name || 'Unknown'}</strong>
            </p>

            <div style={{ 
              padding: '20px', 
              background: '#faf5ff', 
              borderRadius: '12px',
              marginBottom: '20px',
              border: '2px dashed #9c27b0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '8px' }}>📦</div>
                <h3 style={{ margin: '0', color: '#1E4D4B' }}>Mystery Box</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  Contains random selection of books + bonus points
                </p>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px',
                marginTop: '12px',
                padding: '12px',
                background: 'white',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '13px' }}>
                  <strong>Donor:</strong> {selectedDonation.donor || selectedDonation.user?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '13px' }}>
                  <strong>Books:</strong> {selectedDonation.verifiedCount || selectedDonation.bookCount || 0}
                </div>
                <div style={{ fontSize: '13px' }}>
                  <strong>Bonus Points:</strong> +50
                </div>
                <div style={{ fontSize: '13px' }}>
                  <strong>Random Books:</strong> 3-5
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '12px', 
              background: '#fff3e0', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '13px'
            }}>
              ⚠️ This action will award a mystery box and cannot be undone.
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => { setShowMysteryBoxModal(false); setSelectedDonation(null); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e5e5e5', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmMysteryBox}
                disabled={awardingBox}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: '#9c27b0', 
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                {awardingBox ? 'Awarding...' : '🎁 Award Mystery Box'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default StaffDashboard;