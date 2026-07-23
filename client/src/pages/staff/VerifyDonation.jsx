// pages/staff/VerifyDonation.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function VerifyDonation() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [isbn, setIsbn] = useState('978-3-16-148410-0');
  const [condition, setCondition] = useState('Pristine');
  const [basePoints] = useState(3500.00);
  const [flaggedItems] = useState([
    { id: 1, title: 'The History of Ceylon (Collector\'s Edition)', author: 'Various Authors', isbn: '978-955-0020-14-8', notes: 'Water damage on spine' },
  ]);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagForm, setFlagForm] = useState({ title: '', author: '', isbn: '', notes: '' });
  const [editingFlag, setEditingFlag] = useState(null);
  const [donationImages, setDonationImages] = useState([]);

  // ====== ISBN VALIDATION STATE ======
  const [isbnError, setIsbnError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'VERIFICATION STAFF'
      });
    }

    fetch('/api/donations')
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
           const latestWithImages = data.find(d => d.images && d.images.length > 0);
           if (latestWithImages) setDonationImages(latestWithImages.images);
         }
      })
      .catch(console.error);
  }, []);

  // ====== ISBN VALIDATION FUNCTION - Works for any country ======
  const validateISBN = (isbnString) => {
    const cleanISBN = isbnString.replace(/[-\s]/g, '');
    
    // Check if it's a valid ISBN-10 or ISBN-13
    if (cleanISBN.length === 10) {
      // ISBN-10 validation
      if (!/^\d{9}[\dX]$/.test(cleanISBN)) {
        return { valid: false, error: 'Invalid ISBN-10 format' };
      }
      
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        const digit = cleanISBN[i] === 'X' ? 10 : parseInt(cleanISBN[i], 10);
        sum += digit * (10 - i);
      }
      
      if (sum % 11 !== 0) {
        return { valid: false, error: 'Invalid ISBN-10 check digit' };
      }
      
      return { valid: true, error: '' };
      
    } else if (cleanISBN.length === 13) {
      // ISBN-13 validation
      if (!/^\d{13}$/.test(cleanISBN)) {
        return { valid: false, error: 'ISBN must be exactly 13 digits' };
      }
      
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const digit = parseInt(cleanISBN[i], 10);
        sum += (i % 2 === 0) ? digit : digit * 3;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      const actualCheckDigit = parseInt(cleanISBN[12], 10);
      
      if (checkDigit !== actualCheckDigit) {
        return { valid: false, error: `Invalid check digit. Expected: ${checkDigit}` };
      }
      
      return { valid: true, error: '' };
      
    } else {
      return { valid: false, error: 'ISBN must be 10 or 13 digits' };
    }
  };

  // ====== HANDLE ISBN CHANGE WITH VALIDATION ======
  const handleIsbnChange = (e) => {
    const value = e.target.value;
    setFlagForm({...flagForm, isbn: value});
    
    const cleanValue = value.replace(/[-\s]/g, '');
    
    if (cleanValue.length === 0) {
      setIsbnError('');
    } else if (cleanValue.length < 10) {
      setIsbnError(`ISBN needs ${10 - cleanValue.length} more digit(s)`);
    } else if (cleanValue.length === 10 || cleanValue.length === 13) {
      const result = validateISBN(value);
      if (result.valid) {
        setIsbnError('');
        // Auto-detect ISBN type
        const isbnType = cleanValue.length === 10 ? 'ISBN-10' : 'ISBN-13';
        console.log(`Valid ${isbnType} detected`);
      } else {
        setIsbnError(result.error);
      }
    } else if (cleanValue.length > 13) {
      setIsbnError('ISBN cannot exceed 13 digits');
    }
  };

  // ====== GET COUNTRY FROM ISBN ======
  const getCountryFromISBN = (isbnString) => {
    const cleanISBN = isbnString.replace(/[-\s]/g, '');
    const countryCodes = {
      '0': 'English-speaking countries',
      '1': 'English-speaking countries',
      '2': 'French-speaking countries',
      '3': 'German-speaking countries',
      '4': 'Japan',
      '5': 'Russia',
      '7': 'China',
      '80': 'Czech Republic',
      '81': 'India',
      '82': 'Norway',
      '83': 'Poland',
      '84': 'Spain',
      '85': 'Brazil',
      '86': 'Yugoslavia',
      '87': 'Denmark',
      '88': 'Italy',
      '89': 'South Korea',
      '90': 'Netherlands',
      '91': 'Sweden',
      '92': 'International',
      '93': 'India',
      '94': 'Netherlands',
      '950': 'Argentina',
      '951': 'Finland',
      '952': 'Finland',
      '953': 'Croatia',
      '954': 'Bulgaria',
      '955': 'Sri Lanka',
      '956': 'Chile',
      '957': 'Taiwan',
      '958': 'Colombia',
      '959': 'Cuba',
      '960': 'Greece',
      '961': 'Slovenia',
      '962': 'Hong Kong',
      '963': 'Hungary',
      '964': 'Iran',
      '965': 'Israel',
      '966': 'Ukraine',
      '967': 'Malaysia',
      '968': 'Mexico',
      '969': 'Pakistan',
      '970': 'Mexico',
      '971': 'Philippines',
      '972': 'Portugal',
      '973': 'Romania',
      '974': 'Thailand',
      '975': 'Turkey',
      '976': 'Caribbean',
      '977': 'Egypt',
      '978': 'Nigeria',
      '979': 'Indonesia',
      '980': 'Venezuela',
      '981': 'Singapore',
      '982': 'South Pacific',
      '983': 'Malaysia',
      '984': 'Bangladesh',
      '985': 'Belarus',
      '986': 'Taiwan',
      '987': 'Argentina',
      '988': 'Hong Kong',
      '989': 'Portugal',
      '9910': 'Argentina',
      '9911': 'Colombia',
      '9912': 'Chile',
      '9913': 'Costa Rica',
      '9914': 'Ecuador',
      '9915': 'Guatemala',
      '9916': 'Honduras',
      '9917': 'Mexico',
      '9918': 'Panama',
      '9919': 'Paraguay',
      '9920': 'Peru',
      '9921': 'Uruguay',
      '9922': 'Venezuela',
      '9923': 'Bolivia',
      '9924': 'Brazil',
      '9925': 'Nicaragua',
      '9926': 'Colombia',
      '9927': 'Argentina',
      '9928': 'Chile',
      '9929': 'Ecuador',
      '9930': 'Peru',
      '9931': 'Venezuela',
      '9932': 'Mexico',
      '9933': 'Costa Rica',
      '9934': 'Panama',
      '9935': 'Guatemala',
      '9936': 'El Salvador',
      '9937': 'Honduras',
      '9938': 'Nicaragua',
      '9939': 'Paraguay',
      '9940': 'Uruguay',
      '9941': 'Bolivia',
      '9942': 'Brazil',
      '9943': 'Mexico',
      '9944': 'Argentina',
      '9945': 'Chile',
      '9946': 'Ecuador',
      '9947': 'Peru',
      '9948': 'Venezuela'
    };

    // For ISBN-13, check the first 3-4 digits after the prefix
    let prefix = '';
    if (cleanISBN.length === 13) {
      const startPrefix = cleanISBN.substring(0, 3);
      if (startPrefix === '978' || startPrefix === '979') {
        // Check the next 1-4 digits
        for (let i = 1; i <= 4; i++) {
          const code = cleanISBN.substring(3, 3 + i);
          if (countryCodes[code]) {
            return countryCodes[code];
          }
        }
        return 'Unknown country (group code not found)';
      }
      return 'Unknown country (invalid prefix)';
    } else if (cleanISBN.length === 10) {
      // For ISBN-10, check the first 1-4 digits
      for (let i = 1; i <= 4; i++) {
        const code = cleanISBN.substring(0, i);
        if (countryCodes[code]) {
          return countryCodes[code];
        }
      }
      return 'Unknown country';
    }
    return 'Invalid ISBN format';
  };

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

  // Placeholder CRUD functions
  const handleAddFlag = () => {
    // Validate ISBN before adding
    const cleanISBN = flagForm.isbn.replace(/[-\s]/g, '');
    if (![10, 13].includes(cleanISBN.length)) {
      setIsbnError('Please enter a valid 10 or 13 digit ISBN');
      return;
    }
    const result = validateISBN(flagForm.isbn);
    if (!result.valid) {
      setIsbnError(result.error);
      return;
    }
    
    // Get country info
    const country = getCountryFromISBN(flagForm.isbn);
    console.log('Add flag:', flagForm, 'Country:', country);
    setShowFlagModal(false);
  };

  const handleEditFlag = (flag) => {
    setEditingFlag(flag);
    setFlagForm(flag);
    setIsbnError('');
    setShowFlagModal(true);
  };

  const handleUpdateFlag = () => {
    // Validate ISBN before updating
    const cleanISBN = flagForm.isbn.replace(/[-\s]/g, '');
    if (![10, 13].includes(cleanISBN.length)) {
      setIsbnError('Please enter a valid 10 or 13 digit ISBN');
      return;
    }
    const result = validateISBN(flagForm.isbn);
    if (!result.valid) {
      setIsbnError(result.error);
      return;
    }
    
    console.log('Update flag:', editingFlag, flagForm);
    setShowFlagModal(false);
    setEditingFlag(null);
  };

  const handleDeleteFlag = (id) => {
    console.log('Delete flag:', id);
  };

  // Get country for main ISBN display
  const mainIsbnCountry = isbn ? getCountryFromISBN(isbn) : '';

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Donation Verification - International</h1>
          <p className="page-subtitle">Verify and assess donated books for quality and authenticity</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name || 'Verification Staff'}</span>
          <span className="user-title">{currentUser.role || 'VERIFICATION LEAD'}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="verification-two-column">
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

        <div className="manifested-card">
          <div className="manifest-header">
            <h3>MANIFESTED ITEMS ({flaggedItems.length + 3})</h3>
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

          {flaggedItems.map((flag) => (
            <div key={flag.id} className="manifest-item flagged">
              <div className="item-header">
                <h4>{flag.title}</h4>
                <span className="item-points muted">-- pts</span>
              </div>
              <p className="item-meta">Author: {flag.author}</p>
              <p className="item-meta">ISBN: {flag.isbn}</p>
              <p className="item-meta" style={{ color: '#d97706' }}>⚠️ {flag.notes}</p>
              <div className="item-tags">
                <span className="tag">Leatherbound</span>
                <span className="tag">Rare Edition</span>
                <span className="tag flagged-tag">Flagged Condition</span>
                <button className="btn-small" onClick={() => handleEditFlag(flag)} style={{ marginLeft: '8px' }}>Edit</button>
                <button className="btn-small" onClick={() => handleDeleteFlag(flag.id)} style={{ marginLeft: '4px', background: '#dc3545', color: 'white' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="verification-protocol">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>VERIFICATION PROTOCOL</h3>
          <button className="btn-secondary" onClick={() => { setEditingFlag(null); setFlagForm({ title: '', author: '', isbn: '', notes: '' }); setIsbnError(''); setShowFlagModal(true); }}>
            + Flag Item
          </button>
        </div>
        <div className="isbn-verification">
          <div className="isbn-label">Scan or Verify ISBN (International Standard)</div>
          <div className="isbn-input-group">
            <input 
              type="text" 
              className="isbn-input" 
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter ISBN-10 or ISBN-13"
            />
            <button className="verify-btn">Verify</button>
          </div>
          <div className="isbn-match">
            <span className="match-icon">✓</span>
            <span>Matched: The History of Ceylon (Collector's Edition)</span>
          </div>
          {mainIsbnCountry && mainIsbnCountry !== 'Invalid ISBN format' && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#1E4D4B' }}>
              <span style={{ fontWeight: '500' }}>Country/Region:</span> {mainIsbnCountry}
            </div>
          )}
        </div>
      </div>

      <div className="verification-protocol">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>DONATION IMAGES</h3>
        </div>
        {donationImages.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
             {donationImages.map((img, i) => (
                <img key={i} src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={`Donation ${i}`} style={{ height: '150px', borderRadius: '8px', border: '1px solid #ccc', objectFit: 'cover' }} />
             ))}
          </div>
        ) : (
          <p style={{ color: '#6C757D', fontSize: '14px' }}>No images provided for this donation.</p>
        )}
      </div>

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
            <input type="checkbox" /> No water damage or mold
          </label>
        </div>
      </div>

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

      <div className="action-buttons-verify">
        <button className="calc-points-btn">Calculate Points</button>
        <button className="flag-review-btn">Flag Review</button>
        <button className="approve-btn">Approve</button>
      </div>

      {/* Flag Modal - with International ISBN Validation */}
      {showFlagModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingFlag ? 'Edit Flagged Item' : 'Flag Item for Review'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Title</label>
              <input type="text" className="form-control" value={flagForm.title} onChange={(e) => setFlagForm({...flagForm, title: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Author</label>
              <input type="text" className="form-control" value={flagForm.author} onChange={(e) => setFlagForm({...flagForm, author: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>ISBN (10 or 13 digits)</label>
              <input 
                type="text" 
                className="form-control" 
                value={flagForm.isbn} 
                onChange={handleIsbnChange}
                placeholder="978-3-16-148410-0 or 0-306-40615-2"
                style={{
                  borderColor: isbnError ? '#dc3545' : '#e5e5e5'
                }}
              />
              {flagForm.isbn && flagForm.isbn.replace(/[-\s]/g, '').length > 0 && !isbnError && (
                <div style={{ color: '#28a745', fontSize: '12px', marginTop: '4px' }}>
                  ✓ Valid ISBN - {getCountryFromISBN(flagForm.isbn)}
                </div>
              )}
              {isbnError && (
                <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                  {isbnError}
                </div>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Notes (Reason for flagging)</label>
              <textarea className="form-control" value={flagForm.notes} onChange={(e) => setFlagForm({...flagForm, notes: e.target.value})} style={{ minHeight: '80px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setShowFlagModal(false); setEditingFlag(null); setIsbnError(''); }}>Cancel</button>
              <button className="btn-primary" onClick={editingFlag ? handleUpdateFlag : handleAddFlag}>{editingFlag ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="system-advisory">
        <span className="advisory-icon">ℹ️</span>
        <p>
          System Advisory: International editions require manual ISBN confirmation and expert condition assessment. Supports both ISBN-10 and ISBN-13 formats.
        </p>
      </div>
    </StaffLayout>
  );
}

export default VerifyDonation;