// pages/staff/VerifyDonation.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function VerifyDonation() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showMysteryBoxModal, setShowMysteryBoxModal] = useState(false);
  const [mysteryBoxDonation, setMysteryBoxDonation] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Verification form
  const [verifyForm, setVerifyForm] = useState({
    verifiedCount: 0,
    condition: 'good',
    notes: '',
    isComplete: true,
    awardPoints: 0,
    awardMysteryBox: false,
    userLevel: 0,
    currentPoints: 0,
    userId: null
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'OPERATIONS_STAFF',
          id: user.id || user.userId || 'staff-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({
          name: 'Staff User',
          role: 'OPERATIONS_STAFF',
          id: 'staff-123'
        });
      }
    } else {
      setCurrentUser({
        name: 'Staff User',
        role: 'OPERATIONS_STAFF',
        id: 'staff-123'
      });
    }
    fetchDonations();
  }, []);

  // ===== FETCH DONATIONS FROM DATABASE =====
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all donation requests
      const response = await fetch('/api/donations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch donations');
      }

      const data = await response.json();
      console.log('📦 Donations from DB:', data);

      // Get all users to fetch levels and points
      const usersResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
        console.log('👤 Users from DB:', usersData);
      }

      // Map donations with user data
      const mappedDonations = data.map(donation => {
        const user = usersData?.find(u => u.id === donation.userId);
        return {
          id: donation.id,
          donor: user?.name || donation.donor || 'Unknown Donor',
          email: user?.email || donation.email || 'No email',
          phone: user?.phoneNumber || donation.phone || 'No phone',
          type: donation.type || 'Single Book',
          bookCount: donation.requestedCount || donation.verifiedCount || 0,
          category: donation.category || 'General',
          collectionName: donation.collectionName || null,
          estimatedPoints: donation.estimatedPoints || donation.bookCount * 10 || 0,
          submittedAt: donation.createdAt || new Date().toISOString(),
          status: donation.status || 'PENDING',
          notes: donation.notes || '',
          userLevel: user?.level || 0,
          currentPoints: user?.points || 0,
          userId: donation.userId || user?.id || null,
          verifiedCount: donation.verifiedCount || 0,
          pointsAwarded: donation.pointsAwarded || 0,
          awardedMysteryBox: donation.awardedMysteryBox || false,
          condition: donation.condition || null
        };
      });

      setDonations(mappedDonations);
      
    } catch (error) {
      console.error('❌ Error fetching donations:', error);
      // Fallback to mock data if API fails
      setDonations(getMockDonations());
    } finally {
      setLoading(false);
    }
  };

  // ===== MOCK DATA (Fallback) =====
  const getMockDonations = () => {
    return [
      {
        id: 'don_001',
        donor: 'Kasun Kalhara',
        email: 'kkasun@gmail.com',
        phone: '+94771234567',
        type: 'Collection',
        bookCount: 15,
        category: 'Academic',
        collectionName: 'O/L Science Past Papers 2018-2024',
        estimatedPoints: 150,
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        notes: 'All books in good condition',
        userLevel: 3,
        currentPoints: 450,
        userId: 'usr_001',
        verifiedCount: 0,
        pointsAwarded: 0,
        awardedMysteryBox: false
      },
      {
        id: 'don_002',
        donor: 'Savinthi Minaya',
        email: 'savinthi@test.com',
        phone: '+94773456789',
        type: 'Single Book',
        bookCount: 3,
        category: 'Fiction',
        collectionName: 'Classic Literature',
        estimatedPoints: 30,
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        notes: 'Fragile books',
        userLevel: 1,
        currentPoints: 120,
        userId: 'usr_002',
        verifiedCount: 0,
        pointsAwarded: 0,
        awardedMysteryBox: false
      }
    ];
  };

  // ===== GET LEVEL BADGE =====
  const getLevelBadge = (level) => {
    const levelMap = {
      1: { label: 'Book Lover', color: '#4caf50' },
      2: { label: 'Bibliophile', color: '#2196f3' },
      3: { label: 'Grand Librarian', color: '#ff9800' },
      4: { label: 'Literary Elite', color: '#9c27b0' },
      5: { label: 'Legendary Reader', color: '#f44336' }
    };
    return levelMap[level] || levelMap[1];
  };

  // ===== GET STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'status-badge pending', label: 'Pending' },
      'VERIFIED': { class: 'status-badge completed', label: 'Verified' },
      'REJECTED': { class: 'status-badge cancelled', label: 'Rejected' }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  // ===== HANDLE VERIFY =====
  const handleVerify = (donation) => {
    setSelectedDonation(donation);
    const basePoints = donation.bookCount * 10;
    const bonusPoints = donation.type === 'Collection' ? Math.round(basePoints * 0.1) : 0;
    
    setVerifyForm({
      verifiedCount: donation.bookCount || 0,
      condition: 'good',
      notes: '',
      isComplete: donation.type === 'Collection',
      awardPoints: basePoints + bonusPoints,
      awardMysteryBox: false,
      userLevel: donation.userLevel || 0,
      currentPoints: donation.currentPoints || 0,
      userId: donation.userId || null
    });
    setShowVerifyModal(true);
  };

  // ===== CONFIRM VERIFICATION - SAVE TO DATABASE =====
  const handleConfirmVerification = async () => {
    if (!selectedDonation) return;

    try {
      const token = localStorage.getItem('token');
      
      // 1. Update the donation status
      const response = await fetch(`/api/donations/${selectedDonation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'VERIFIED',
          verifiedCount: verifyForm.verifiedCount,
          condition: verifyForm.condition,
          notes: verifyForm.notes || selectedDonation.notes,
          pointsAwarded: verifyForm.awardPoints,
          awardedMysteryBox: verifyForm.awardMysteryBox
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update donation');
      }

      const updatedDonation = await response.json();
      console.log('✅ Donation verified:', updatedDonation);

      // 2. If user has a userId, update their points
      if (verifyForm.userId && verifyForm.awardPoints > 0) {
        const user = users.find(u => u.id === verifyForm.userId);
        const newPoints = (user?.points || 0) + verifyForm.awardPoints;
        
        await fetch(`/api/users/${verifyForm.userId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            points: newPoints,
            level: calculateLevel(newPoints)
          })
        });
        
        console.log(`✅ Updated user ${verifyForm.userId} points to ${newPoints}`);
      }

      // 3. Update local state
      const updatedDonations = donations.map(d => {
        if (d.id === selectedDonation.id) {
          return {
            ...d,
            status: 'VERIFIED',
            verifiedCount: verifyForm.verifiedCount,
            condition: verifyForm.condition,
            notes: verifyForm.notes || d.notes,
            pointsAwarded: verifyForm.awardPoints,
            awardedMysteryBox: verifyForm.awardMysteryBox
          };
        }
        return d;
      });
      
      setDonations(updatedDonations);
      setShowVerifyModal(false);
      setSelectedDonation(null);
      
      const mysteryBoxMsg = verifyForm.awardMysteryBox ? ' Mystery Box awarded!' : '';
      alert(`✅ Donation verified! ${verifyForm.verifiedCount} books confirmed. ${verifyForm.awardPoints} points awarded.${mysteryBoxMsg}`);
      
      // Refresh data
      fetchDonations();
      
    } catch (error) {
      console.error('❌ Error verifying donation:', error);
      alert('Failed to verify donation. Please try again.');
    }
  };

  // ===== CALCULATE LEVEL =====
  const calculateLevel = (points) => {
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 250) return 3;
    if (points >= 100) return 2;
    return 1;
  };

  // ===== HANDLE REJECT =====
  const handleReject = async (donation) => {
    if (!window.confirm(`Reject donation from ${donation.donor}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/donations/${donation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'REJECTED',
          notes: donation.notes || 'Rejected by staff'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject donation');
      }

      const updatedDonations = donations.map(d => {
        if (d.id === donation.id) {
          return { ...d, status: 'REJECTED' };
        }
        return d;
      });
      
      setDonations(updatedDonations);
      alert('Donation rejected.');
      fetchDonations();
      
    } catch (error) {
      console.error('Error rejecting donation:', error);
      alert('Failed to reject donation.');
    }
  };

  // ===== HANDLE MYSTERY BOX AWARD =====
  const handleMysteryBoxAward = (donation) => {
    setMysteryBoxDonation(donation);
    setShowMysteryBoxModal(true);
  };

  const handleConfirmMysteryBox = async () => {
    if (!mysteryBoxDonation) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Update donation with mystery box award
      const response = await fetch(`/api/donations/${mysteryBoxDonation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          awardedMysteryBox: true,
          notes: (mysteryBoxDonation.notes || '') + ' Mystery Box awarded.'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to award mystery box');
      }

      alert(`✅ Mystery Box awarded to ${mysteryBoxDonation.donor}!`);
      setShowMysteryBoxModal(false);
      setMysteryBoxDonation(null);
      fetchDonations();
      
    } catch (error) {
      console.error('Error awarding mystery box:', error);
      alert('Failed to award mystery box.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
          <h1>Verify Donations</h1>
          <p className="page-subtitle">Review and verify donor submissions with points & level management</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Donations</h3>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">All submissions</div>
        </div>
        <div className="stat-card accent-warning">
          <h3>Pending Review</h3>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-sub">Waiting for verification</div>
        </div>
        <div className="stat-card accent-success">
          <h3>Verified</h3>
          <div className="stat-value">{stats.verified}</div>
          <div className="stat-sub">Points awarded</div>
        </div>
        <div className="stat-card accent-danger">
          <h3>Rejected</h3>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-sub">Not accepted</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <span 
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </span>
        <span 
          className={`filter-chip ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pending})
        </span>
        <span 
          className={`filter-chip ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified ({stats.verified})
        </span>
        <span 
          className={`filter-chip ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({stats.rejected})
        </span>
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
            const levelInfo = getLevelBadge(donation.userLevel || 0);
            
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
                      {/* Level Badge */}
                      <span style={{ 
                        padding: '2px 12px', 
                        borderRadius: '20px', 
                        background: levelInfo.color + '20',
                        color: levelInfo.color,
                        fontSize: '12px',
                        fontWeight: '600',
                        border: `1px solid ${levelInfo.color}40`
                      }}>
                        {levelInfo.label}
                      </span>
                    </div>
                    
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
                      <span>{donation.email}</span>
                      <span>{donation.phone}</span>
                      <span>{formatDate(donation.submittedAt)}</span>
                      <span>{donation.currentPoints || 0} pts</span>
                    </div>
                    
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#555' }}>
                      <span><strong>Type:</strong> {donation.type}</span>
                      <span><strong>Category:</strong> {donation.category}</span>
                      <span><strong>Books:</strong> {donation.bookCount}</span>
                      <span><strong>Est. Points:</strong> {donation.estimatedPoints}</span>
                    </div>

                    {donation.collectionName && (
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#1E4D4B' }}>
                        Collection: {donation.collectionName}
                      </div>
                    )}

                    {donation.notes && (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                        Notes: {donation.notes}
                      </div>
                    )}

                    {isVerified && donation.verifiedCount && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', background: '#e8f5e9', borderRadius: '6px', fontSize: '13px', color: '#2e7d32' }}>
                        Verified: {donation.verifiedCount} books confirmed • {donation.pointsAwarded || 0} pts awarded
                        {donation.awardedMysteryBox && ' Mystery Box awarded'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isPending && (
                      <>
                        <button 
                          className="btn-verify" 
                          onClick={() => handleVerify(donation)}
                        >
                          Verify
                        </button>
                        <button 
                          className="btn-reject" 
                          onClick={() => handleReject(donation)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {isVerified && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ padding: '8px 16px', background: '#e8f5e9', borderRadius: '6px', color: '#2e7d32', fontWeight: '500' }}>
                          Done
                        </span>
                        <button 
                          className="btn-small" 
                          onClick={() => handleMysteryBoxAward(donation)}
                          style={{ background: '#9c27b0', padding: '8px 16px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Award Box
                        </button>
                      </div>
                    )}
                    {donation.status === 'REJECTED' && (
                      <span style={{ padding: '8px 16px', background: '#fce4ec', borderRadius: '6px', color: '#c62828', fontWeight: '500' }}>
                        Rejected
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
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2>Verify Donation</h2>
            <p className="modal-subtitle">
              Review donation from <strong>{selectedDonation.donor}</strong>
            </p>

            {/* Donor Info with Level */}
            <div className="user-submitted-info">
              <h4>Donation Summary</h4>
              <div className="info-grid">
                <p><strong>Type:</strong> {selectedDonation.type}</p>
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Books Submitted:</strong> {selectedDonation.bookCount}</p>
                <p><strong>Est. Points:</strong> {selectedDonation.estimatedPoints}</p>
                <p><strong>Current Level:</strong> {getLevelBadge(selectedDonation.userLevel || 0).label}</p>
                <p><strong>Current Points:</strong> {selectedDonation.currentPoints || 0}</p>
                {selectedDonation.collectionName && (
                  <p><strong>Collection:</strong> {selectedDonation.collectionName}</p>
                )}
                {selectedDonation.notes && (
                  <p><strong>Notes:</strong> {selectedDonation.notes}</p>
                )}
              </div>
              
              {selectedDonation.images && selectedDonation.images.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Attached Images:</strong>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '8px' }}>
                    {selectedDonation.images.map((img, i) => (
                      <img key={i} src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={`Donation ${i}`} style={{ height: '100px', borderRadius: '4px', border: '1px solid #ccc', objectFit: 'cover' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Form */}
            <div className="form-group">
              <label>Actual Books Received</label>
              <input
                type="number"
                className="form-control"
                value={verifyForm.verifiedCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0;
                  const basePoints = count * 10;
                  const bonusPoints = selectedDonation.type === 'Collection' && verifyForm.isComplete ? Math.round(basePoints * 0.1) : 0;
                  setVerifyForm({ 
                    ...verifyForm, 
                    verifiedCount: count,
                    awardPoints: basePoints + bonusPoints
                  });
                }}
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
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {selectedDonation.type === 'Collection' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={verifyForm.isComplete}
                    onChange={(e) => {
                      const isComplete = e.target.checked;
                      const basePoints = verifyForm.verifiedCount * 10;
                      const bonusPoints = isComplete ? Math.round(basePoints * 0.1) : 0;
                      setVerifyForm({ 
                        ...verifyForm, 
                        isComplete,
                        awardPoints: basePoints + bonusPoints
                      });
                    }}
                  />
                  Collection Complete? (10% bonus if complete)
                </label>
              </div>
            )}

            {/* Award Mystery Box Option */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={verifyForm.awardMysteryBox}
                  onChange={(e) => setVerifyForm({ ...verifyForm, awardMysteryBox: e.target.checked })}
                />
                Award Mystery Box (Bonus reward for exceptional donations)
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
              padding: '16px', 
              background: '#e8f5e9', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <span style={{ fontWeight: '500' }}>Points to Award:</span>
                {verifyForm.awardMysteryBox && (
                  <span style={{ marginLeft: '12px', fontSize: '12px', color: '#9c27b0', fontWeight: '600' }}>
                    + Mystery Box
                  </span>
                )}
              </div>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#1E4D4B' }}>
                {verifyForm.awardPoints}
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
              >
                Verify & Award
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mystery Box Modal */}
      {showMysteryBoxModal && mysteryBoxDonation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <h2>Award Mystery Box</h2>
            <p className="modal-subtitle">
              Award a mystery box to <strong>{mysteryBoxDonation.donor}</strong>
            </p>

            <div className="user-submitted-info">
              <h4>Donor Info</h4>
              <div className="info-grid">
                <p><strong>Name:</strong> {mysteryBoxDonation.donor}</p>
                <p><strong>Email:</strong> {mysteryBoxDonation.email}</p>
                <p><strong>Current Level:</strong> {getLevelBadge(mysteryBoxDonation.userLevel || 0).label}</p>
                <p><strong>Current Points:</strong> {mysteryBoxDonation.currentPoints || 0}</p>
                <p><strong>Books Donated:</strong> {mysteryBoxDonation.bookCount}</p>
              </div>
            </div>

            <div style={{ 
              padding: '16px', 
              background: '#f3e5f5', 
              borderRadius: '8px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎁</div>
              <p style={{ fontWeight: '600', color: '#6a1b9a' }}>Mystery Box Contents</p>
              <p style={{ fontSize: '14px', color: '#4a148c' }}>
                Random selection of books + bonus points
              </p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { setShowMysteryBoxModal(false); setMysteryBoxDonation(null); }}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={handleConfirmMysteryBox}
                style={{ background: '#9c27b0' }}
              >
                Award Mystery Box
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default VerifyDonation;