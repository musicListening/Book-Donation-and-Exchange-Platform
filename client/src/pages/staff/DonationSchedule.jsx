// pages/staff/DonationSchedule.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { systemConfigAPI, API_BASE } from '../../services/api';

function DonationSchedule() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemConfig, setSystemConfig] = useState({});
  const [levels, setLevels] = useState([]);
  const [mysteryBoxLocks, setMysteryBoxLocks] = useState([]);
  const [mysteryBoxConfigs, setMysteryBoxConfigs] = useState([]);
  const [leveledUpResult, setLeveledUpResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [marketplaceDonation, setMarketplaceDonation] = useState(null);
  const [marketplaceForm, setMarketplaceForm] = useState({
    title: '',
    price: 0,
    condition: 'good',
    description: '',
    category: 'General'
  });
  const [bundles, setBundles] = useState([]);
  const [selectedBundleId, setSelectedBundleId] = useState('');
  const [addToMarketplace, setAddToMarketplace] = useState(false);
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
      if (config.MYSTERY_BOX_LOCKS) {
        try { setMysteryBoxLocks(JSON.parse(config.MYSTERY_BOX_LOCKS)); } catch {}
      }
      if (config.MYSTERY_BOX_LEVEL_CONFIG) {
        try { setMysteryBoxConfigs(JSON.parse(config.MYSTERY_BOX_LEVEL_CONFIG)); } catch {}
      }
    } catch (err) {
      console.warn('Could not load system config');
    }
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      let usersData = [];
      const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        usersData = await usersResponse.json();
        setUsers(usersData);
      }

      const donationsResponse = await fetch(`${API_BASE}/donations?status=PENDING`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!donationsResponse.ok) {
        throw new Error('Failed to fetch donations');
      }

      const donationsData = await donationsResponse.json();
      
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
          donationImages: donation.donationImages || [],
          booksDonated: user?.booksDonated || donation.user?.booksDonated || 0
        };
      });
      
      setDonations(processedDonations);

    } catch (error) {
      console.error('Error fetching data:', error);
      setDonations([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    if (levels.length > 0) {
      const found = levels.find(l => l.level === level);
      if (found) return { label: found.name || `Level ${level}`, color: '#4caf50' };
    }
    const levelMap = {
      1: { label: 'Book Lover', color: '#4caf50' },
      2: { label: 'Bibliophile', color: '#2196f3' },
      3: { label: 'Grand Librarian', color: '#ff9800' },
      4: { label: 'Literary Elite', color: '#9c27b0' },
      5: { label: 'Legendary Reader', color: '#f44336' }
    };
    return levelMap[level] || levelMap[1];
  };

  const getMysteryBoxInfoForLevel = (level) => {
    const lock = mysteryBoxLocks.find(l => parseInt(l.level) === level);
    const config = mysteryBoxConfigs.find(c => c.level === level);
    if (!lock && !config) return null;
    return {
      unlock: lock?.unlock || null,
      points: config?.points || 0,
      books: config?.books || 0
    };
  };

  const calculatePoints = (actualCount, isCollectionComplete) => {
    const baseRate = parseInt(systemConfig.BASE_POINTS_PER_BOOK) || 10;
    const bonusPct = parseInt(systemConfig.COLLECTION_BONUS_PERCENTAGE) || 10;
    const basePoints = actualCount * baseRate;
    const bonus = isCollectionComplete ? Math.round(basePoints * (bonusPct / 100)) : 0;
    return { basePoints, bonus, total: basePoints + bonus, baseRate, bonusPct };
  };

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

  const handleVerifyDonation = async (donation) => {
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

    // Fetch available bundles for assignment
    try {
      const token = localStorage.getItem('token');
      const bundleRes = await fetch(`${API_BASE}/collections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bundleRes.ok) {
        const bundleData = await bundleRes.json();
        setBundles(bundleData);
      }
    } catch (err) {
      console.warn('Could not fetch bundles:', err);
    }
  };

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

      const response = await fetch(`${API_BASE}/donations/${selectedDonation.id}/verify`, {
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
          isCollectionComplete: verifyForm.isComplete,
          bundleId: selectedBundleId || null,
          addToMarketplace,
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
      setDonations(prevDonations => prevDonations.filter(d => d.id !== selectedDonation.id));
      setShowVerifyModal(false);
      
      const levelUpMsg = leveledUp ? ` Level up to Level ${newLevel}! Mystery Box awarded!` : '';
      const isCraftDonation = selectedDonation.category && selectedDonation.category.startsWith('Craft:');
      const itemLabel = isCraftDonation ? 'craft' : 'book';

      setVerifyForm({
        verifiedCount: 0, condition: 'good', notes: '', isComplete: true,
        awardPoints: 0, userLevel: 0, currentPoints: 0, userId: null, booksDonated: 0
      });
      
      if (addToMarketplace) {
        alert(`Verified & Listed in Marketplace! ${verifyForm.verifiedCount} ${itemLabel}(s) confirmed. ${points.total} points awarded.${levelUpMsg}`);
        setShowMarketplaceModal(false);
        setMarketplaceDonation(null);
        fetchAllData();
      } else {
        alert(`Verified! ${verifyForm.verifiedCount} ${itemLabel}(s) confirmed. ${points.total} points awarded.${levelUpMsg}`);

        const notesPointsMatch = selectedDonation.notes && selectedDonation.notes.match(/Expected Points:\s*(\d+)/i);
        const userEnteredPrice = notesPointsMatch ? parseInt(notesPointsMatch[1]) : null;

        const defaultBookLkrPrice = (
          (verifyForm.condition === 'NEW' || verifyForm.condition === 'excellent') ? 750 
          : (verifyForm.condition === 'LIKE_NEW' || verifyForm.condition === 'good') ? 500 
          : (verifyForm.condition === 'GOOD') ? 400 
          : (verifyForm.condition === 'FAIR' || verifyForm.condition === 'fair') ? 250 
          : 150
        );

        const calculatedPrice = isCraftDonation ? (userEnteredPrice || 50) : defaultBookLkrPrice;

        const displayTitle = selectedDonation.collectionName || (selectedDonation.category || '').replace(/^Craft:\s*/i, '') || 'Donated Item';

        setMarketplaceDonation(selectedDonation);
        setMarketplaceForm({
          title: displayTitle,
          price: calculatedPrice,
          condition: verifyForm.condition || 'good',
          description: '',
          category: selectedDonation.category || 'General'
        });
        setShowMarketplaceModal(true);
        fetchAllData();
      }
      
    } catch (error) {
      console.error('Error verifying donation:', error);
      alert(`Failed to verify: ${error.message}`);
    }
  };

  const handleAddToMarketplace = async () => {
    if (!marketplaceDonation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/donations/${marketplaceDonation.id}/publish-marketplace`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: marketplaceForm.title,
          price: marketplaceForm.price,
          description: marketplaceForm.description || `${marketplaceDonation.category} in ${marketplaceForm.condition} condition`,
          condition: marketplaceForm.condition
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to marketplace');
      }

      setShowMarketplaceModal(false);
      setMarketplaceDonation(null);
      alert('Item added to marketplace successfully!');
      
    } catch (error) {
      console.error('Error adding to marketplace:', error);
      alert('Error adding to marketplace. Please try again.');
    }
  };

  const handleRejectDonation = async () => {
    if (!selectedDonation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/donations/${selectedDonation.id}/reject`, {
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

      setDonations(prevDonations => prevDonations.filter(d => d.id !== selectedDonation.id));
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

  const handleSkipMarketplace = () => {
    setShowMarketplaceModal(false);
    setMarketplaceDonation(null);
  };

  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
      return currentUser.name[0].toUpperCase();
    }
    return 'SU';
  };

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
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card accent-warning">
          <h3>Pending Donations</h3>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{pendingCount}</div>
          <div className="stat-trend">Awaiting review</div>
          <div className="stat-sub">Donations waiting for staff verification</div>
        </div>
        <div className="stat-card">
          <h3>Total Pending</h3>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-trend">To be reviewed</div>
          <div className="stat-sub">Donations pending approval</div>
        </div>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: 'var(--teal)', fontFamily: 'var(--font-family)' }}>Pending Donations</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by donor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 14px',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '13px',
                width: '200px',
                outline: 'none',
                fontFamily: 'var(--font-family)'
              }}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                fontFamily: 'var(--font-family)'
              }}
            >
              <option value="ALL">All Items (Books & Crafts)</option>
              <option value="BOOKS">📚 Books Only</option>
              <option value="CRAFTS">🎨 Crafts Only</option>
            </select>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              background: '#fff3e0', 
              color: '#e65100',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-family)'
            }}>
              {donations.filter(d => {
                const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
                const isCraft = d.category && d.category.startsWith('Craft:');
                let matchesType = true;
                if (typeFilter === 'BOOKS') matchesType = !isCraft;
                if (typeFilter === 'CRAFTS') matchesType = isCraft;
                return matchesSearch && matchesType;
              }).length} pending
            </span>
          </div>
        </div>

        {donations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
            <p style={{ fontSize: '24px' }}>All caught up!</p>
            <p>No pending donations.</p>
            <p style={{ fontSize: '13px' }}>Check back later for new submissions.</p>
          </div>
        ) : donations.filter(d => {
          const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
          const isCraft = d.category && d.category.startsWith('Craft:');
          let matchesType = true;
          if (typeFilter === 'BOOKS') matchesType = !isCraft;
          if (typeFilter === 'CRAFTS') matchesType = isCraft;
          return matchesSearch && matchesType;
        }).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
            <p style={{ fontSize: '24px' }}>No donations found</p>
            <p>No donations found matching criteria.</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Category</th>
                  <th>Type & Qty</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations
                  .filter(d => {
                    const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
                    const isCraft = d.category && d.category.startsWith('Craft:');
                    let matchesType = true;
                    if (typeFilter === 'BOOKS') matchesType = !isCraft;
                    if (typeFilter === 'CRAFTS') matchesType = isCraft;
                    return matchesSearch && matchesType;
                  })
                  .map((d) => {
                  const levelInfo = getLevelBadge(d.userLevel || 0);
                  const isCraft = d.category && d.category.startsWith('Craft:');
                  return (
                    <tr key={d.id}>
                      <td>
                        <div>
                          <strong style={{ fontFamily: 'var(--font-family)' }}>{d.donor}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
                            {levelInfo.label}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-family)' }}>{d.category || 'General'}</td>
                      <td style={{ fontFamily: 'var(--font-family)' }}>
                        {isCraft ? (
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#FFF3E0',
                            color: '#E65100',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🎨 Craft • {d.requestedCount || 0}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            📚 Book • {d.requestedCount || 0}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="status-badge draft">Pending</span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="action-group">
                          <button 
                            className="btn-small"
                            onClick={() => handleVerifyDonation(d)}
                          >
                            Verify
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
          <span>Showing {donations.filter(d => {
            const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
            const isCraft = d.category && d.category.startsWith('Craft:');
            let matchesType = true;
            if (typeFilter === 'BOOKS') matchesType = !isCraft;
            if (typeFilter === 'CRAFTS') matchesType = isCraft;
            return matchesSearch && matchesType;
          }).length} pending donations</span>
        </div>
      </div>

      {showVerifyModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2 style={{ color: 'var(--teal)', marginBottom: '8px', fontFamily: 'var(--font-family)' }}>Verify Donation</h2>
            <p className="modal-subtitle" style={{ color: 'var(--text-light)', marginBottom: '20px', fontFamily: 'var(--font-family)' }}>
              Review donation from <strong>{selectedDonation.donor}</strong>
            </p>

            <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--teal)', marginBottom: '12px', fontFamily: 'var(--font-family)' }}>Donation Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', fontFamily: 'var(--font-family)' }}>
                <p><strong>Type:</strong> {selectedDonation.type || 'SINGLE_BOOK'}</p>
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Books Submitted:</strong> {selectedDonation.requestedCount}</p>
                <p><strong>Est. Points:</strong> {selectedDonation.estimatedPoints}</p>
                <p><strong>Current Level:</strong> {getLevelBadge(selectedDonation.userLevel || 0).label}</p>
                <p><strong>Current Points:</strong> {selectedDonation.userPoints || 0}</p>
                {selectedDonation.collectionName && <p><strong>Collection:</strong> {selectedDonation.collectionName}</p>}
                {selectedDonation.notes && <p><strong>Notes:</strong> {selectedDonation.notes}</p>}
              </div>

            {/* Donor Uploaded Images */}
            {selectedDonation.donationImages && selectedDonation.donationImages.length > 0 && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-family)' }}>
                  Donor Photos ({selectedDonation.donationImages.length})
                </h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedDonation.donationImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Donation photo ${i + 1}`}
                      style={{
                        width: 100, height: 100, objectFit: 'cover',
                        borderRadius: 8, border: '1px solid #DEE2E6',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
              {(() => {
                const newBooksDonated = (selectedDonation.booksDonated || 0) + (verifyForm.verifiedCount || 0);
                const predictedLevel = calculateLevelByBooks(newBooksDonated);
                const willLevelUp = predictedLevel > (selectedDonation.userLevel || 0);
                const mbInfo = getMysteryBoxInfoForLevel(predictedLevel);
                return (
                  <div style={{ marginTop: '12px', padding: '12px', background: willLevelUp ? '#FFF3E0' : '#F5F5F5', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-family)' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: '600' }}>
                      After Verification: Level {predictedLevel} ({getLevelBadge(predictedLevel).label})
                      {willLevelUp && <span style={{ color: '#E65100', marginLeft: 8 }}>Level Up!</span>}
                    </p>
                    {willLevelUp && mbInfo && (
                      <p style={{ margin: 0, color: '#E65100' }}>
                        Mystery Box: {mbInfo.unlock} ({mbInfo.books} books) - Costs {mbInfo.points} pts to claim
                      </p>
                    )}
                    {willLevelUp && !mbInfo && (
                      <p style={{ margin: 0, color: '#666' }}>No mystery box configured for Level {predictedLevel}</p>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                {selectedDonation.category && selectedDonation.category.startsWith('Craft:') ? 'Actual Crafts Received' : 'Actual Books Received'}
              </label>
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
                  border: '1px solid var(--border-light)', 
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'var(--font-family)'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>Book Condition</label>
              <select
                className="form-control"
                value={verifyForm.condition}
                onChange={(e) => setVerifyForm({ ...verifyForm, condition: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '8px', fontFamily: 'var(--font-family)' }}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Bundle Assignment */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>Assign to Bundle</label>
              <select
                value={selectedBundleId}
                onChange={(e) => setSelectedBundleId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '8px', fontFamily: 'var(--font-family)' }}
              >
                <option value="">— No Bundle (Individual Listing) —</option>
                {bundles.map((bundle) => (
                  <option key={bundle.id} value={bundle.id}>
                    {bundle.title} ({bundle.stock || 0} items)
                  </option>
                ))}
              </select>
            </div>

            {/* Add to Marketplace */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                <input
                  type="checkbox"
                  checked={addToMarketplace}
                  onChange={(e) => setAddToMarketplace(e.target.checked)}
                />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Add verified books to Marketplace</span>
              </label>
            </div>

            {selectedDonation.type === 'COLLECTION' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-family)' }}>
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

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>Staff Notes</label>
              <textarea
                className="form-control"
                value={verifyForm.notes}
                onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                placeholder="Optional notes..."
                rows="2"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '8px', fontFamily: 'var(--font-family)' }}
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
              gap: '8px',
              fontFamily: 'var(--font-family)'
            }}>
              <span style={{ fontWeight: '500' }}>Points to Award:</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--teal)' }}>
                {verifyForm.awardPoints}
              </span>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setShowVerifyModal(false); setSelectedDonation(null); }}>Cancel</button>
              <button className="btn-reject" onClick={handleRejectDonation}>Reject</button>
              <button className="btn-save" onClick={handleConfirmVerification}>Verify & Award Points</button>
            </div>
          </div>
        </div>
      )}

      {showMarketplaceModal && marketplaceDonation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2 style={{ color: 'var(--teal)', marginBottom: '8px', fontFamily: 'var(--font-family)' }}>Add to Marketplace</h2>
            <p className="modal-subtitle" style={{ color: 'var(--text-light)', marginBottom: '20px', fontFamily: 'var(--font-family)' }}>
              Would you like to list this {marketplaceDonation.category && marketplaceDonation.category.startsWith('Craft:') ? 'craft' : 'book'} in the marketplace?
            </p>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'var(--font-family)' }}>
              <p><strong>Category:</strong> {marketplaceDonation.category}</p>
              <p><strong>Donor:</strong> {marketplaceDonation.donor}</p>
              <p><strong>Condition:</strong> {marketplaceForm.condition}</p>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                {marketplaceDonation.category && marketplaceDonation.category.startsWith('Craft:') ? 'Craft Name' : 'Book Name'}
              </label>
              <input
                type="text"
                className="form-control"
                value={marketplaceForm.title}
                onChange={(e) => setMarketplaceForm({ ...marketplaceForm, title: e.target.value })}
                placeholder="Enter name..."
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-family)',
                  marginBottom: '15px'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                {marketplaceDonation.category && marketplaceDonation.category.startsWith('Craft:') ? 'Price (Points)' : 'Selling Price (LKR / Rs.)'}
              </label>
              <input
                type="number"
                className="form-control"
                value={marketplaceForm.price}
                onChange={(e) => setMarketplaceForm({ ...marketplaceForm, price: parseInt(e.target.value) || 0 })}
                min="0"
                step="1"
                placeholder={marketplaceDonation.category && marketplaceDonation.category.startsWith('Craft:') ? 'e.g. 50' : 'e.g. 500'}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-family)'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>Description</label>
              <textarea
                className="form-control"
                value={marketplaceForm.description}
                onChange={(e) => setMarketplaceForm({ ...marketplaceForm, description: e.target.value })}
                placeholder={`Brief description of the ${marketplaceDonation.category && marketplaceDonation.category.startsWith('Craft:') ? 'craft' : 'book'}...`}
                rows="3"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '8px', fontFamily: 'var(--font-family)' }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleSkipMarketplace}>Skip</button>
              <button className="btn-save" style={{ background: '#FF9800', color: 'white' }} onClick={handleAddToMarketplace}>Add to Marketplace</button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default DonationSchedule;