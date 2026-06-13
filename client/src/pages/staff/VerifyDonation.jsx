// pages/staff/VerifyDonation.jsx
import React, { useState } from 'react';
import StaffLayout from '../../components/StaffLayout';  // Fixed import path (two levels up)

function VerifyDonation() {
  const [isbn, setIsbn] = useState('978-0062315007');
  const [condition, setCondition] = useState('Pristine');
  const [basePoints] = useState(35.00);
  
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
      case 'Pristine': return 42;
      case 'Very Good': return 38.5;
      case 'Good': return 31.5;
      case 'Damaged': return 17.5;
      default: return 35;
    }
  };

  return (
    <StaffLayout>  {/* Wrap content with StaffLayout instead of rendering separately */}
      {/* Header with verification lead info */}
      <div className="verification-header">
        <div className="lead-info">
          <span className="lead-name">Alex Rivera</span>
          <span className="lead-role">VERIFICATION LEAD</span>
        </div>
      </div>

      <h1 className="page-title">Donation Verification</h1>

      {/* Two column layout for Donor Info and Manifested Items */}
      <div className="verification-two-column">
        {/* Left Column - Donor Information */}
        <div className="donor-info-card">
          <h3>DONOR INFORMATION</h3>
          <div className="donor-field">
            <label>Full Name</label>
            <p className="field-value">Eleanor Vance</p>
          </div>
          <div className="donor-field">
            <label>Email Address</label>
            <p className="field-value">e.vance@example.com</p>
          </div>
          <div className="donor-row">
            <div className="donor-field half">
              <label>Total Contributions</label>
              <p className="field-value large">142 Books</p>
            </div>
            <div className="donor-field half">
              <label>Status</label>
              <p className="status-gold">Verified Gold</p>
            </div>
          </div>
          <div className="recurring-badge">
            <span className="recurring-icon">⟳</span>
            <span>RECURRING DONOR</span>
          </div>
        </div>

        {/* Right Column - Manifested Items */}
        <div className="manifested-card">
          <div className="manifest-header">
            <h3>MANIFESTED ITEMS (4)</h3>
            <span className="batch-id">Batch ID: #B-2024-001</span>
          </div>

          <div className="manifest-item">
            <div className="item-header">
              <h4>Principles of Modern UI</h4>
              <span className="item-points">42 pts</span>
            </div>
            <p className="item-meta">Author: Dieter Rams</p>
            <p className="item-meta">ISBN: 978-3161484100</p>
            <div className="item-tags">
              <span className="tag">Hardcover</span>
              <span className="tag">2021</span>
            </div>
          </div>

          <div className="manifest-item flagged">
            <div className="item-header">
              <h4>The Alchemist (Collector's Edition)</h4>
              <span className="item-points muted">-- pts</span>
            </div>
            <p className="item-meta">Author: Paulo Coelho</p>
            <p className="item-meta">ISBN: 978-0062315007</p>
            <div className="item-tags">
              <span className="tag">Leatherbound</span>
              <span className="tag flagged-tag">Flagged Condition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Protocol */}
      <div className="verification-protocol">
        <h3>VERIFICATION PROTOCOL</h3>
        <div className="isbn-verification">
          <div className="isbn-label">Scan or Verify ISBN</div>
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
            <span>Matched: The Alchemist (Collector's Edition)</span>
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
                  {c === 'Pristine' && 'Like New / Unread'}
                  {c === 'Very Good' && 'Minimal wear'}
                  {c === 'Good' && 'Readable / Aged'}
                  {c === 'Damaged' && 'Unsellable / Scrap'}
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
            <input type="checkbox" /> Contains water damage or mold
          </label>
        </div>
      </div>

      {/* Points */}
      <div className="points-calculation">
        <div className="points-row">
          <span className="points-label">Base Value Points</span>
          <span className="points-value">${basePoints.toFixed(2)}</span>
        </div>

        <div className="points-row">
          <span className="points-label">Condition Multiplier ({condition})</span>
          <span className="points-multiplier">{getMultiplier()}</span>
        </div>

        <div className="points-row total">
          <span className="points-label">Final Calculation</span>
          <span className="points-total">{getFinalPoints()} pts</span>
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
          System Advisory: Collector's editions require manual ISBN confirmation if the barcode is not recognized.
        </p>
      </div>
    </StaffLayout>
  );
}

export default VerifyDonation;