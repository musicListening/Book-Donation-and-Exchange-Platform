// pages/staff/VerifyDonation.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function VerifyDonation() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [isbn, setIsbn] = useState('978-955-0020-14-8');
  const [condition, setCondition] = useState('Pristine');
  const [basePoints] = useState(3500.00);

  useEffect(() => {
    // Get logged-in user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'VERIFICATION STAFF'
      });
    }
  }, []);
  
  const getMultiplier = () => {
    switch(condition) {
      case 'Pristine': return '+20%';
      case 'Very Good': return '+10%';
      case 'Good': return '-10%';
      case 'Damaged': return '-50%';
      default: return '0%';
    }
  };
  
  const getFinalPoints = () => {
    switch(condition) {
      case 'Pristine': return 4200;
      case 'Very Good': return 3850;
      case 'Good': return 3150;
      case 'Damaged': return 1750;
      default: return 3500;
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'VD';
  };

  return (
    <StaffLayout>
      {/* Header with verification lead info */}
      <div className="verification-header">
        <div className="lead-info">
          <span className="lead-name">{currentUser.name || 'Verification Staff'}</span>
          <span className="lead-role">{currentUser.role || 'VERIFICATION LEAD'}</span>
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
            {getUserInitials()}
          </div>
        </div>
      </div>

      <h1 className="page-title">Donation Verification - Sri Lanka</h1>

      {/* Two column layout for Donor Info and Manifested Items */}
      <div className="verification-two-column">
        {/* Left Column - Donor Information */}
        <div className="donor-info-card">
          <h3>DONOR INFORMATION</h3>
          <div className="donor-field">
            <label>Full Name</label>
            <p className="field-value">Malini Perera</p>
          </div>
          <div className="donor-field">
            <label>Email Address</label>
            <p className="field-value">malini.perera@example.com</p>
          </div>
          <div className="donor-field">
            <label>Location</label>
            <p className="field-value">Colombo, Sri Lanka</p>
          </div>
          <div className="donor-row">
            <div className="donor-field half">
              <label>Total Contributions</label>
              <p className="field-value large">248 Books</p>
            </div>
            <div className="donor-field half">
              <label>Status</label>
              <p className="status-gold">Platinum Donor</p>
            </div>
          </div>
          <div className="recurring-badge">
            <span className="recurring-icon">⟳</span>
            <span>RECURRING DONOR SINCE 2022</span>
          </div>
        </div>

        {/* Right Column - Manifested Items */}
        <div className="manifested-card">
          <div className="manifest-header">
            <h3>MANIFESTED ITEMS (4)</h3>
            <span className="batch-id">Batch ID: #SL-B-2024-001</span>
          </div>

          <div className="manifest-item">
            <div className="item-header">
              <h4>Madol Doowa - Martin Wickramasinghe</h4>
              <span className="item-points">4200 pts</span>
            </div>
            <p className="item-meta">Author: Martin Wickramasinghe</p>
            <p className="item-meta">ISBN: 978-955-551-123-4</p>
            <div className="item-tags">
              <span className="tag">First Edition</span>
              <span className="tag">Hardcover</span>
              <span className="tag">Sinhala Literature</span>
            </div>
          </div>

          <div className="manifest-item flagged">
            <div className="item-header">
              <h4>The History of Ceylon (Collector's Edition)</h4>
              <span className="item-points muted">-- pts</span>
            </div>
            <p className="item-meta">Author: Various Authors</p>
            <p className="item-meta">ISBN: 978-955-0020-14-8</p>
            <div className="item-tags">
              <span className="tag">Leatherbound</span>
              <span className="tag">Rare Edition</span>
              <span className="tag flagged-tag">Flagged Condition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Protocol */}
      <div className="verification-protocol">
        <h3>VERIFICATION PROTOCOL</h3>
        <div className="isbn-verification">
          <div className="isbn-label">Scan or Verify ISBN (Sri Lanka Standard)</div>
          <div className="isbn-input-group">
            <input 
              type="text" 
              className="isbn-input" 
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter ISBN"
            />
            <button className="verify-btn">Verify</button>
          </div>
          <div className="isbn-match">
            <span className="match-icon">✓</span>
            <span>Matched: The History of Ceylon (Collector's Edition)</span>
          </div>
        </div>
      </div>

      {/* Condition Assessment */}
      <div className="condition-assessment">
        <h3>Condition Assessment</h3>

        <div className="condition-options">
          {['Pristine','Very Good','Good','Damaged'].map((c) => (
            <label key={c} className={`condition-option ${condition === c ? 'selected' : ''}`}>
              <input
                type="radio"
                name="condition"
                value={c}
                checked={condition === c}
                onChange={() => setCondition(c)}
              />
              <div className="condition-content">
                <span className="condition-name">{c}</span>
                <span className="condition-desc">
                  {c === 'Pristine' && 'Like New / Unread / Collector Quality'}
                  {c === 'Very Good' && 'Minimal wear / Well maintained'}
                  {c === 'Good' && 'Readable / Aged but intact'}
                  {c === 'Damaged' && 'Unsellable / Needs restoration'}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="condition-checks">
          <label className="check-label">
            <input type="checkbox" /> Cover spine is intact and rigid
          </label>
          <label className="check-label">
            <input type="checkbox" /> No internal highlighting or notes
          </label>
          <label className="check-label">
            <input type="checkbox" /> No water damage or mold (tropical climate)
          </label>
        </div>
      </div>

      {/* Points */}
      <div className="points-calculation">
        <div className="points-row">
          <span className="points-label">Base Value Points</span>
          <span className="points-value">Rs. {basePoints.toFixed(2)}</span>
        </div>

        <div className="points-row">
          <span className="points-label">Condition Multiplier ({condition})</span>
          <span className="points-multiplier">{getMultiplier()}</span>
        </div>

        <div className="points-row total">
          <span className="points-label">Final Calculation</span>
          <span className="points-total">Rs. {getFinalPoints()} pts</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="action-buttons-verify">
        <button className="calc-points-btn">Calculate Points</button>
        <button className="flag-review-btn">Flag Review</button>
        <button className="approve-btn">Approve</button>
      </div>

      <div className="system-advisory">
        <span className="advisory-icon">ℹ️</span>
        <p>
          System Advisory: Rare Sri Lankan collector's editions require manual ISBN confirmation and expert condition assessment.
        </p>
      </div>
    </StaffLayout>
  );
}

export default VerifyDonation;