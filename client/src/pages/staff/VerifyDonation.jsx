// pages/staff/VerifyDonation.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function VerifyDonation() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Verification form
  const [verifyForm, setVerifyForm] = useState({
    verifiedCount: 0,
    condition: 'good',
    notes: '',
    isComplete: true
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'OPERATIONS_STAFF'
      });
    }
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      // API call to fetch pending donations
      // const response = await fetch('/api/staff/donations/pending');
      // const data = await response.json();
      
      // Mock data
      const mockData = [
        {
          id: 1,
          donor: 'Kasun Kalhara',
          email: 'kkasun@gmail.com',
          phone: '+94771234567',
          type: 'Collection',
          bookCount: 15,
          category: 'Academic',
          collectionName: 'O/L Science Past Papers 2018-2024',
          estimatedPoints: 150,
          submittedAt: '2026-07-18T10:30:00Z',
          status: 'PENDING',
          notes: 'All books in good condition'
        },
        {
          id: 2,
          donor: 'Savinthi Minaya',
          email: 'savinthi@test.com',
          phone: '+94773456789',
          type: 'Single Book',
          bookCount: 3,
          category: 'Fiction',
          collectionName: 'Classic Literature',
          estimatedPoints: 30,
          submittedAt: '2026-07-18T09:15:00Z',
          status: 'PENDING',
          notes: 'Fragile books'
        },
        {
          id: 3,
          donor: 'Pasindu Madushan',
          email: 'pasindu@test.com',
          phone: '+94774567890',
          type: 'Collection',
          bookCount: 25,
          category: 'Children',
          collectionName: 'Children\'s Story Books',
          estimatedPoints: 250,
          submittedAt: '2026-07-18T08:00:00Z',
          status: 'PENDING',
          notes: 'Mixed condition'
        }
      ];
      
      setDonations(mockData);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'status-badge pending', label: '⏳ Pending' },
      'VERIFIED': { class: 'status-badge completed', label: '✅ Verified' },
      'REJECTED': { class: 'status-badge cancelled', label: '❌ Rejected' }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const handleVerify = (donation) => {
    setSelectedDonation(donation);
    setVerifyForm({
      verifiedCount: donation.bookCount || 0,
      condition: 'good',
      notes: '',
      isComplete: true
    });
    setShowVerifyModal(true);
  };

  const handleConfirmVerification = async () => {
    if (!selectedDonation) return;

    try {
      // API call to verify donation
      // await fetch(`/api/staff/donations/${selectedDonation.id}/verify`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(verifyForm)
      // });

      // Update local state
      const updatedDonations = donations.map(d => {
        if (d.id === selectedDonation.id) {
          return {
            ...d,
            status: 'VERIFIED',
            verifiedCount: verifyForm.verifiedCount,
            condition: verifyForm.condition,
            notes: verifyForm.notes,
            verifiedAt: new Date().toISOString()
          };
        }
        return d;
      });
      
      setDonations(updatedDonations);
      setShowVerifyModal(false);
      setSelectedDonation(null);
      
      alert(`✅ Donation verified! ${verifyForm.verifiedCount} books confirmed.`);
      
    } catch (error) {
      console.error('Error verifying donation:', error);
      alert('Failed to verify donation. Please try again.');
    }
  };

  const handleReject = async (donation) => {
    if (!window.confirm(`Reject donation from ${donation.donor}?`)) return;
    
    try {
      // API call to reject donation
      // await fetch(`/api/staff/donations/${donation.id}/reject`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' }
      // });

      const updatedDonations = donations.map(d => {
        if (d.id === donation.id) {
          return { ...d, status: 'REJECTED' };
        }
        return d;
      });
      
      setDonations(updatedDonations);
      alert('❌ Donation rejected.');
      
    } catch (error) {
      console.error('Error rejecting donation:', error);
      alert('Failed to reject donation.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'SU';
  };

  const filteredDonations = donations.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter.toUpperCase();
  });

  const stats = {
    total: donations.length,
    pending: donations.filter(d => d.status === 'PENDING').length,
    verified: donations.filter(d => d.status === 'VERIFIED').length,
    rejected: donations.filter(d => d.status === 'REJECTED').length
  };

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Loading donations...</h2>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>📚 Verify Donations</h1>
          <p className="page-subtitle">Review and verify donor submissions</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <h3>Total Donations</h3>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">All submissions</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #ff9800' }}>
          <h3>Pending Review</h3>
          <div className="stat-value" style={{ color: '#ff9800' }}>{stats.pending}</div>
          <div className="stat-sub">Waiting for verification</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #4caf50' }}>
          <h3>Verified</h3>
          <div className="stat-value" style={{ color: '#4caf50' }}>{stats.verified}</div>
          <div className="stat-sub">Points awarded</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #dc3545' }}>
          <h3>Rejected</h3>
          <div className="stat-value" style={{ color: '#dc3545' }}>{stats.rejected}</div>
          <div className="stat-sub">Not accepted</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        <span 
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </span>
        <span 
          className={`filter-chip ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
          style={{ background: filter === 'pending' ? '#ff9800' : '' }}
        >
          ⏳ Pending ({stats.pending})
        </span>
        <span 
          className={`filter-chip ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
          style={{ background: filter === 'verified' ? '#4caf50' : '' }}
        >
          ✅ Verified ({stats.verified})
        </span>
        <span 
          className={`filter-chip ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
          style={{ background: filter === 'rejected' ? '#dc3545' : '' }}
        >
          ❌ Rejected ({stats.rejected})
        </span>
        <button 
          onClick={fetchDonations}
          className="refresh-btn"
          style={{ marginLeft: 'auto' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Donation Cards */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredDonations.length === 0 ? (
          <div className="card-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>No donations to display</p>
          </div>
        ) : (
          filteredDonations.map((donation) => {
            const statusInfo = getStatusBadge(donation.status);
            const isPending = donation.status === 'PENDING';
            const isVerified = donation.status === 'VERIFIED';
            
            return (
              <div 
                key={donation.id} 
                className="card-panel"
                style={{ 
                  padding: '20px',
                  borderLeft: `4px solid ${isPending ? '#ff9800' : isVerified ? '#4caf50' : '#dc3545'}`,
                  opacity: isVerified ? 0.85 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1E4D4B' }}>
                        {donation.donor}
                      </h3>
                      <span className={statusInfo.class}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
                      <span>📧 {donation.email}</span>
                      <span>📞 {donation.phone}</span>
                      <span>📅 {formatDate(donation.submittedAt)}</span>
                    </div>
                    
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#555' }}>
                      <span><strong>Type:</strong> {donation.type}</span>
                      <span><strong>Category:</strong> {donation.category}</span>
                      <span><strong>Books:</strong> {donation.bookCount}</span>
                      <span><strong>Est. Points:</strong> {donation.estimatedPoints}</span>
                    </div>

                    {donation.collectionName && (
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#1E4D4B' }}>
                        📚 Collection: {donation.collectionName}
                      </div>
                    )}

                    {donation.notes && (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                        📝 {donation.notes}
                      </div>
                    )}

                    {isVerified && donation.verifiedCount && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', background: '#e8f5e9', borderRadius: '6px', fontSize: '13px', color: '#2e7d32' }}>
                        ✅ Verified: {donation.verifiedCount} books confirmed
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isPending && (
                      <>
                        <button 
                          className="btn-small" 
                          onClick={() => handleVerify(donation)}
                          style={{ background: '#1E4D4B', padding: '8px 20px' }}
                        >
                          🔍 Verify
                        </button>
                        <button 
                          className="btn-small" 
                          onClick={() => handleReject(donation)}
                          style={{ background: '#dc3545', padding: '8px 20px' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {isVerified && (
                      <span style={{ padding: '8px 16px', background: '#e8f5e9', borderRadius: '6px', color: '#2e7d32', fontWeight: '500' }}>
                        ✅ Done
                      </span>
                    )}
                    {donation.status === 'REJECTED' && (
                      <span style={{ padding: '8px 16px', background: '#fce4ec', borderRadius: '6px', color: '#c62828', fontWeight: '500' }}>
                        ❌ Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Verification Modal */}
      {showVerifyModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2>🔍 Verify Donation</h2>
            <p className="modal-subtitle">
              Review donation from <strong>{selectedDonation.donor}</strong>
            </p>

            {/* Donor Info */}
            <div className="user-submitted-info">
              <h4>📋 Donation Summary</h4>
              <div className="info-grid">
                <p><strong>Type:</strong> {selectedDonation.type}</p>
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Books Submitted:</strong> {selectedDonation.bookCount}</p>
                <p><strong>Est. Points:</strong> {selectedDonation.estimatedPoints}</p>
                {selectedDonation.collectionName && (
                  <p><strong>Collection:</strong> {selectedDonation.collectionName}</p>
                )}
                {selectedDonation.notes && (
                  <p><strong>Notes:</strong> {selectedDonation.notes}</p>
                )}
              </div>
            </div>

            {/* Verification Form */}
            <div className="form-group">
              <label>Actual Books Received</label>
              <input
                type="number"
                className="form-control"
                value={verifyForm.verifiedCount}
                onChange={(e) => setVerifyForm({ ...verifyForm, verifiedCount: parseInt(e.target.value) || 0 })}
                min="0"
                style={{ fontSize: '18px', fontWeight: '600' }}
              />
            </div>

            <div className="form-group">
              <label>Book Condition</label>
              <select
                className="form-control"
                value={verifyForm.condition}
                onChange={(e) => setVerifyForm({ ...verifyForm, condition: e.target.value })}
              >
                <option value="excellent">📗 Excellent</option>
                <option value="good">📘 Good</option>
                <option value="fair">📙 Fair</option>
                <option value="poor">📕 Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={verifyForm.isComplete}
                  onChange={(e) => setVerifyForm({ ...verifyForm, isComplete: e.target.checked })}
                />
                Collection Complete?
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                  (10% bonus if complete)
                </span>
              </label>
            </div>

            <div className="form-group">
              <label>Staff Notes</label>
              <textarea
                className="form-control"
                value={verifyForm.notes}
                onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                placeholder="Optional notes..."
                rows="2"
              />
            </div>

            {/* Points Calculation */}
            <div style={{ 
              padding: '12px 16px', 
              background: '#e8f5e9', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '500' }}>⭐ Points to Award:</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#1E4D4B' }}>
                {verifyForm.verifiedCount * 10 + (verifyForm.isComplete ? Math.round(verifyForm.verifiedCount * 10 * 0.1) : 0)}
              </span>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { setShowVerifyModal(false); setSelectedDonation(null); }}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={handleConfirmVerification}
                style={{ background: '#1E4D4B' }}
              >
                ✅ Verify & Award Points
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default VerifyDonation;