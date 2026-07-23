// pages/staff/DonationSchedule.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { systemConfigAPI } from '../../services/api';

function DonationSchedule() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemConfig, setSystemConfig] = useState({});
  const [levels, setLevels] = useState([]);
  const [leveledUpResult, setLeveledUpResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  
  // Verification form
  const [verifyForm, setVerifyForm] = useState({
    verifiedCount: 0,
    condition: 'good',
    notes: '',
    isComplete: true,
    awardPoints: 0,
    userLevel: 0,
    currentPoints: 0,
    userId: null,
    booksDonated: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'LOGISTICS STAFF',
          id: user.id || user.userId || 'staff-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({
          name: 'Staff User',
          role: 'LOGISTICS STAFF',
          id: 'staff-123'
        });
      }
    }
    fetchAllData();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const config = await systemConfigAPI.getAll();
      setSystemConfig(config);
      if (config.LEVEL_THRESHOLDS) {
        try { setLevels(JSON.parse(config.LEVEL_THRESHOLDS)); } catch {}
      }
    } catch (err) {
      console.warn('Could not load system config');
    }
  };

  // ===== FETCH ALL DATA FROM DATABASE =====
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No token found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      let usersData = [];

      // Fetch users
      const usersResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        usersData = await usersResponse.json();
        setUsers(usersData);
        console.log('👤 Users loaded:', usersData.length);
      }

      // Fetch donations - ONLY PENDING ones
      const donationsResponse = await fetch('/api/donations?status=PENDING', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!donationsResponse.ok) {
        throw new Error('Failed to fetch donations');
      }

      const donationsData = await donationsResponse.json();
      console.log('📦 Pending donations loaded:', donationsData.length);
      
      const processedDonations = donationsData.map(donation => {
        const user = usersData?.find(u => u.id === donation.userId);
        
        return {
          id: donation.id,
          userId: donation.userId,
          donor: user?.name || donation.donor || donation.user?.name || 'Unknown Donor',
          email: user?.email || donation.email || donation.user?.email || 'No email',
          phone: user?.phoneNumber || donation.phone || donation.user?.phoneNumber || 'No phone',
          userLevel: user?.level || donation.user?.level || 0,
          userPoints: user?.points || donation.user?.points || 0,
          location: user?.address || donation.location || donation.user?.address || 'Not specified',
          dropOffDate: donation.dropOffDate || donation.createdAt || new Date().toISOString(),
          timeSlot: donation.timeSlot || 'Morning (10:00 AM - 12:00 PM)',
          requestedCount: donation.requestedCount || donation.bookCount || 0,
          type: donation.type || 'SINGLE_BOOK',
          books: `${donation.requestedCount || donation.bookCount || 0} Books`,
          category: donation.category || 'General',
          notes: donation.notes || '',
          collectionName: donation.collectionName || null,
          status: donation.status || 'PENDING',
          estimatedPoints: donation.estimatedPoints || (donation.requestedCount || 0) * 10 || 0,
          verifiedCount: donation.verifiedCount || 0,
          pointsAwarded: donation.pointsAwarded || 0,
          staffNotes: donation.staffNotes || '',
          createdAt: donation.createdAt || new Date().toISOString(),
          isCollectionComplete: donation.isCollectionComplete || false,
          awardedMysteryBox: donation.awardedMysteryBox || false,
          condition: donation.condition || null,
          booksDonated: user?.booksDonated || donation.user?.booksDonated || 0
        };
      });
      
      setDonations(processedDonations);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setDonations([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
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

  // ===== CALCULATE POINTS (from system config) =====
  const calculatePoints = (actualCount, isCollectionComplete) => {
    const baseRate = parseInt(systemConfig.BASE_POINTS_PER_BOOK) || 10;
    const bonusPct = parseInt(systemConfig.COLLECTION_BONUS_PERCENTAGE) || 10;
    const basePoints = actualCount * baseRate;
    const bonus = isCollectionComplete ? Math.round(basePoints * (bonusPct / 100)) : 0;
    return { basePoints, bonus, total: basePoints + bonus, baseRate, bonusPct };
  };

  // ===== CALCULATE LEVEL (from level config, based on books donated) =====
  const calculateLevelByBooks = (booksDonated) => {
    if (levels.length === 0) {
      if (booksDonated >= 100) return 5;
      if (booksDonated >= 50) return 4;
      if (booksDonated >= 25) return 3;
      if (booksDonated >= 10) return 2;
      return 1;
    }
    const sorted = [...levels].sort((a, b) => (a.minPoints || a.minBooks || 0) - (b.minPoints || b.minBooks || 0));
    let currentLevel = 1;
    for (const lvl of sorted) {
      const threshold = lvl.minBooks || lvl.minPoints || 0;
      if (booksDonated >= threshold) currentLevel = lvl.level;
    }
    return currentLevel;
  };

  // ===== HANDLE VERIFY DONATION =====
  const handleVerifyDonation = (donation) => {
    setSelectedDonation(donation);
    const points = calculatePoints(donation.requestedCount || 0, donation.type === 'COLLECTION');
    
    setVerifyForm({
      verifiedCount: donation.requestedCount || 0,
      condition: donation.condition || 'good',
      notes: '',
      isComplete: donation.type === 'COLLECTION',
      awardPoints: points.total,
      userLevel: donation.userLevel || 0,
      currentPoints: donation.userPoints || 0,
      userId: donation.userId || null,
      booksDonated: donation.booksDonated || 0
    });
    setShowVerifyModal(true);
  };

  // ===== CONFIRM VERIFICATION - SERVER-SIDE POINTS CALCULATION =====
  const handleConfirmVerification = async () => {
    if (!selectedDonation) {
      alert('No donation selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No token found. Please login again.');
        return;
      }

      const response = await fetch(`/api/donations/${selectedDonation.id}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verifiedCount: verifyForm.verifiedCount,
          condition: verifyForm.condition,
          notes: verifyForm.notes,
          staffId: currentUser.id,
          isCollectionComplete: verifyForm.isComplete
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to verify donation';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const { points, leveledUp, newLevel, newBooksDonated } = result;

      setLeveledUpResult(leveledUp ? { newLevel, newBooksDonated } : null);

      setDonations(prevDonations => 
        prevDonations.filter(d => d.id !== selectedDonation.id)
      );
      
      setShowVerifyModal(false);
      setSelectedDonation(null);
      
      const levelUpMsg = leveledUp ? ` Level up to Level ${newLevel}! Mystery Box awarded!` : '';
      alert(`Verified! ${verifyForm.verifiedCount} books confirmed. ${points.total} points awarded.${levelUpMsg}`);
      
      setVerifyForm({
        verifiedCount: 0, condition: 'good', notes: '', isComplete: true,
        awardPoints: 0, userLevel: 0, currentPoints: 0, userId: null, booksDonated: 0
      });
      
      fetchAllData();
      
    } catch (error) {
      console.error('Error verifying donation:', error);
      alert(`Failed to verify: ${error.message}`);
    }
  };

  // ===== HANDLE REJECT DONATION - REMOVE FROM UI =====
  const handleRejectDonation = async () => {
    if (!selectedDonation) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/donations/${selectedDonation.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notes: verifyForm.notes || 'Rejected by staff'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject donation');
      }

      // ✅ REMOVE the rejected donation from UI immediately
      setDonations(prevDonations => 
        prevDonations.filter(d => d.id !== selectedDonation.id)
      );
      
      setShowVerifyModal(false);
      setSelectedDonation(null);
      
      setVerifyForm({
        verifiedCount: 0,
        condition: 'good',
        notes: '',
        isComplete: true,
        awardPoints: 0,
        userLevel: 0,
        currentPoints: 0,
        userId: null
      });

      alert('Donation rejected.');
      fetchAllData();
      
    } catch (error) {
      console.error('Error rejecting donation:', error);
      alert('Error rejecting donation. Please try again.');
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
    return 'SU';
  };

  // ===== STATS =====
  const pendingCount = donations.length;

  if (loading) {
    return (
      <StaffLayout>
        <div className="loading-container">
          <h2>Loading donations...</h2>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Donation Management</h1>
          <p className="page-subtitle">Review and award points for pending donation submissions</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      {/* Stats Cards - Only Pending */}
      <div className="cards-grid">
        <div className="stat-card accent-warning">
          <h3>⏳ Pending Donations</h3>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-trend">Awaiting review</div>
          <div className="stat-sub">Donations waiting for staff verification</div>
        </div>
        <div className="stat-card">
          <h3>📊 Total Pending</h3>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-trend">To be reviewed</div>
          <div className="stat-sub">Donations pending approval</div>
        </div>
      </div>

      {/* Donation List - Table Style */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Pending Donations</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by donor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 14px',
                border: '1px solid #DEE2E6',
                borderRadius: '8px',
                fontSize: '13px',
                width: '220px',
                outline: 'none'
              }}
            />
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              background: '#fff3e0', 
              color: '#ff9800',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {donations.filter(d => !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase())).length} pending
            </span>
          </div>
        </div>

        {donations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '24px' }}>✅</p>
            <p>All caught up! No pending donations.</p>
            <p style={{ fontSize: '13px' }}>Check back later for new submissions.</p>
          </div>
        ) : donations.filter(d => !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '24px' }}>🔍</p>
            <p>No donations found matching "{searchTerm}"</p>
            <p style={{ fontSize: '13px' }}>Try a different search term.</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Category</th>
                  <th>Books</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations
                  .filter(d => !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((d) => {
                  const levelInfo = getLevelBadge(d.userLevel || 0);
                  
                  return (
                    <tr key={d.id}>
                      <td>
                        <div>
                          <strong>{d.donor}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {levelInfo.label}
                          </div>
                        </div>
                      </td>
                      <td>{d.category || 'General'}</td>
                      <td>{d.requestedCount || 0} books</td>
                      <td>
                        <span className="status-badge draft">
                          Pending
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="action-group">
                          <button 
                            className="btn-small"
                            onClick={() => handleVerifyDonation(d)}
                          >
                            Award
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>Showing {donations.filter(d => !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase())).length} pending donations{searchTerm ? ` (filtered by "${searchTerm}")` : ''}</span>
        </div>
      </div>

      {/* ===== VERIFICATION MODAL ===== */}
      {showVerifyModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '8px' }}>Award Points</h2>
            <p className="modal-subtitle" style={{ color: '#64748b', marginBottom: '20px' }}>
              Review donation from <strong>{selectedDonation.donor}</strong>
            </p>

            <div className="user-submitted-info" style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#1E4D4B', marginBottom: '12px' }}>Donation Summary</h4>
              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <p><strong>Type:</strong> {selectedDonation.type || 'SINGLE_BOOK'}</p>
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Books Submitted:</strong> {selectedDonation.requestedCount}</p>
                <p><strong>Est. Points:</strong> {selectedDonation.estimatedPoints}</p>
                <p><strong>Current Level:</strong> {getLevelBadge(selectedDonation.userLevel || 0).label}</p>
                <p><strong>Current Points:</strong> {selectedDonation.userPoints || 0}</p>
                {selectedDonation.collectionName && (
                  <p><strong>Collection:</strong> {selectedDonation.collectionName}</p>
                )}
                {selectedDonation.notes && (
                  <p><strong>Notes:</strong> {selectedDonation.notes}</p>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Actual Books Received</label>
              <input
                type="number"
                className="form-control"
                value={verifyForm.verifiedCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0;
                  const points = calculatePoints(count, verifyForm.isComplete && selectedDonation.type === 'COLLECTION');
                  setVerifyForm({ 
                    ...verifyForm, 
                    verifiedCount: count,
                    awardPoints: points.total
                  });
                }}
                min="0"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Book Condition</label>
              <select
                className="form-control"
                value={verifyForm.condition}
                onChange={(e) => setVerifyForm({ ...verifyForm, condition: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {selectedDonation.type === 'COLLECTION' && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={verifyForm.isComplete}
                    onChange={(e) => {
                      const isComplete = e.target.checked;
                      const points = calculatePoints(verifyForm.verifiedCount, isComplete);
                      setVerifyForm({ 
                        ...verifyForm, 
                        isComplete,
                        awardPoints: points.total
                      });
                    }}
                  />
                  Collection Complete? ({parseInt(systemConfig.COLLECTION_BONUS_PERCENTAGE) || 10}% bonus if complete)
                </label>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Staff Notes</label>
              <textarea
                className="form-control"
                value={verifyForm.notes}
                onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                placeholder="Optional notes..."
                rows="2"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
            </div>

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
              </div>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#1E4D4B' }}>
                {verifyForm.awardPoints}
              </span>
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-cancel" 
                onClick={() => { setShowVerifyModal(false); setSelectedDonation(null); }}
              >
                Cancel
              </button>
              <button 
                className="btn-reject" 
                onClick={handleRejectDonation}
              >
                Reject
              </button>
              <button 
                className="btn-save" 
                onClick={handleConfirmVerification}
              >
                Award Points
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default DonationSchedule;