// pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { API_BASE } from '../../services/api';
import '../../styles/StaffDashboard.css';

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

      const pending = data.filter(d => d.status === 'PENDING');
      const verified = data.filter(d => d.status === 'VERIFIED');
      const rejected = data.filter(d => d.status === 'REJECTED');
      
      setStats({
        pending: pending.length,
        verified: verified.length,
        rejected: rejected.length,
        total: data.length
      });

      const eligibleForBox = data.filter(d => 
        d.status === 'VERIFIED' && 
        d.awardedMysteryBox !== true &&
        (d.verifiedCount || d.bookCount || 0) >= 10
      );
      
      setMysteryBoxDonations(eligibleForBox);
      setDonations(data);

    } catch (error) {
      console.error('❌ Error loading donations:', error);
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
      
      setMysteryBoxDonations(mysteryBoxDonations.filter(d => d.id !== selectedDonation.id));
      setShowMysteryBoxModal(false);
      setSelectedDonation(null);
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
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📥 PENDING</h3>
          <div className="stat-value warning">{stats.pending}</div>
          <div className="stat-trend">Awaiting verification</div>
          <div className="stat-sub">Donations need review</div>
        </div>

        <div className="stat-card">
          <h3>✅ VERIFIED</h3>
          <div className="stat-value success">{stats.verified}</div>
          <div className="stat-trend">Points awarded</div>
          <div className="stat-sub">Completed donations</div>
        </div>

        <div className="stat-card">
          <h3>❌ REJECTED</h3>
          <div className="stat-value danger">{stats.rejected}</div>
          <div className="stat-trend">Not accepted</div>
          <div className="stat-sub">Rejected donations</div>
        </div>

        <div className="stat-card mystery-box-card">
          <h3>🎁 MYSTERY BOX</h3>
          <div className="stat-value mystery">{mysteryBoxDonations.length}</div>
          <div className="stat-trend">Eligible donors</div>
          <div className="stat-sub">10+ books verified</div>
        </div>
      </div>

      {/* ===== TWO COLUMN LAYOUT ===== */}
      <div className="dashboard-two-column">
        {/* LEFT: Recent Donations */}
        <div className="card-panel">
          <div className="panel-header">
            <h3>📋 Recent Donations</h3>
            <span className="pending-count">{stats.pending} pending</span>
          </div>

          {loading ? (
            <div className="loading-container">Loading...</div>
          ) : donations.length === 0 ? (
            <p className="empty-state">No donations yet</p>
          ) : (
            donations.slice(0, 10).map((donation) => (
              <div key={donation.id} className="donation-item">
                <div>
                  <div className="donor-name">{donation.donor || donation.user?.name || 'Unknown'}</div>
                  <div className="donation-meta">
                    {donation.bookCount || donation.verifiedCount || 0} books • {formatDate(donation.createdAt)}
                  </div>
                </div>
                <div className="donation-actions">
                  <span className={`status-badge ${getStatusBadge(donation.status)}`}>
                    {donation.status || 'PENDING'}
                  </span>
                </div>
              </div>
            ))
          )}

          <div className="table-footer">
            <span>Showing last {Math.min(10, donations.length)} of {stats.total} donations</span>
            <button 
              className="btn-small-outline" 
              onClick={() => window.location.href = '/staff/donation-schedule'}
            >
              View All →
            </button>
          </div>
        </div>

        {/* RIGHT: Mystery Box Eligible Donors */}
        <div className="card-panel mystery-box-panel">
          <div className="panel-header">
            <h3>🎁 Mystery Box Eligible</h3>
            <span className="mystery-box-count">
              {mysteryBoxDonations.length} donors
            </span>
          </div>

          {mysteryBoxDonations.length === 0 ? (
            <div className="mystery-box-empty">
              <div className="empty-icon">🎁</div>
              <p>No eligible donors yet</p>
              <p className="empty-sub">Donors with 10+ verified books qualify</p>
            </div>
          ) : (
            mysteryBoxDonations.map((donation) => (
              <div key={donation.id} className="mystery-box-item">
                <div>
                  <div className="donor-name">{donation.donor || donation.user?.name || 'Unknown'}</div>
                  <div className="book-count">📚 {donation.verifiedCount || donation.bookCount || 0} books verified</div>
                  <div className="eligible-badge">⭐ Eligible for Mystery Box!</div>
                </div>
                <button 
                  className="btn-award-mystery"
                  onClick={() => handleAwardMysteryBox(donation)}
                >
                  🎁 Award
                </button>
              </div>
            ))
          )}

          <div className="mystery-box-info">
            💡 Donors with 10+ verified books qualify for a Mystery Box
          </div>
        </div>
      </div>

      {/* ===== MYSTERY BOX AWARD MODAL ===== */}
      {showMysteryBoxModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content mystery-box-modal">
            <h2>🎁 Award Mystery Box</h2>
            <p className="modal-subtitle">
              Award a mystery box to <strong>{selectedDonation.donor || selectedDonation.user?.name || 'Unknown'}</strong>
            </p>

            <div className="mystery-box-preview">
              <div className="mystery-box-icon">📦</div>
              <h3>Mystery Box</h3>
              <p className="mystery-box-desc">Contains random selection of books + bonus points</p>
              
              <div className="mystery-box-details">
                <div><strong>Donor:</strong> {selectedDonation.donor || selectedDonation.user?.name || 'Unknown'}</div>
                <div><strong>Books:</strong> {selectedDonation.verifiedCount || selectedDonation.bookCount || 0}</div>
                <div><strong>Bonus Points:</strong> +50</div>
                <div><strong>Random Books:</strong> 3-5</div>
              </div>
            </div>

            <div className="mystery-box-warning">
              ⚠️ This action will award a mystery box and cannot be undone.
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { setShowMysteryBoxModal(false); setSelectedDonation(null); }}
              >
                Cancel
              </button>
              <button 
                className="btn-award"
                onClick={handleConfirmMysteryBox}
                disabled={awardingBox}
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