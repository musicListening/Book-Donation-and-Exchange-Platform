import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../services/api';

const Donate = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState({ points: 0, name: '' });
  const [formData, setFormData] = useState({
    bookTitle: '',
    bookCategory: '',
    bookCount: 1,
    bookFiles: [],
    notes: '',
    selectedDate: '',
    timeSlot: '10:00 AM'
  });
  const [pointsPerBook, setPointsPerBook] = useState(10);
  const [collectionBonusPct, setCollectionBonusPct] = useState(10);
  const [donationFiles, setDonationFiles] = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [donationCategory, setDonationCategory] = useState('books');
  const [bookCollections, setBookCollections] = useState([
    { id: Date.now(), bookCategory: '', bookTitle: '', bookCount: 1, files: [], itemFiles: {} }
  ]);
  const [craftCollections, setCraftCollections] = useState([
    { id: Date.now(), craftType: '', craftCount: 1, pointsPrice: 50, files: [], itemFiles: {} }
  ]);
  const navigate = useNavigate();
  useEffect(() => {
    const handleError = (msg, url, line) => {
      alert(`Runtime Error: ${msg}\nat ${url}:${line}`);
    };
    const handleRejection = (e) => {
      alert(`Unhandled Promise Rejection: ${e.reason}`);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    let storedUser = { points: 0, name: 'User' };
    try {
      const u = localStorage.getItem('ss_current_user');
      if (u && u !== 'undefined') storedUser = JSON.parse(u);
    } catch (e) {
      console.error('Error parsing user:', e);
    }
    setUser(storedUser);
    
    if (storedUser.id) {
      const token = localStorage.getItem('token');
      fetch(`${API_BASE}/donations?userId=${storedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            console.error('Expected array of donations but got:', data);
            setMyDonations([]);
            return;
          }
          const mappedDonations = data.map(d => ({
            id: d.id.substring(0, 8).toUpperCase(),
            fullId: d.id,
            type: d.category || d.type,
            count: d.requestedCount,
            date: d.dropOffDate ? new Date(d.dropOffDate).toLocaleDateString() : 'N/A',
            time: 'N/A', 
            status: d.status === 'VERIFIED' ? 'Completed' : d.status === 'REJECTED' ? 'Rejected' : 'Pending',
            staffNotes: d.staffNotes,
            details: null 
          }));
          setMyDonations(mappedDonations);
        })
        .catch(err => console.error('Error fetching donations:', err));
    }

    let storedCart = [];
    try {
      const c = localStorage.getItem('ss_cart');
      if (c && c !== 'undefined') storedCart = JSON.parse(c);
    } catch (e) {
      console.error('Error parsing cart:', e);
    }
    setCartCount(storedCart.length);
    
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/donations/points-preview?count=1&isCollection=false`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.baseRate) setPointsPerBook(data.baseRate);
        if (data && data.bonusPct) setCollectionBonusPct(data.bonusPct);
      })
      .catch(() => {});
  }, [navigate]);

  const updateBookCategory = (index, value) => {
    setBookCollections(prev => prev.map((col, i) => i === index ? { ...col, bookCategory: value } : col));
  };

  const updateBookTitle = (index, value) => {
    setBookCollections(prev => prev.map((col, i) => i === index ? { ...col, bookTitle: value } : col));
  };

  const updateBookCount = (index, delta) => {
    setBookCollections(prev => prev.map((col, i) => i === index ? { ...col, bookCount: Math.max(1, Math.min(100, col.bookCount + delta)) } : col));
  };

  const setExactBookCount = (index, value) => {
    const val = parseInt(value) || 1;
    setBookCollections(prev => prev.map((col, i) => i === index ? { ...col, bookCount: Math.max(1, Math.min(100, val)) } : col));
  };

  const updateBookFiles = (index, files) => {
    setBookCollections(prev => prev.map((col, i) => i === index ? { ...col, files: [...(col.files || []), ...files] } : col));
  };

  const clearBookFiles = (index) => {
    setBookCollections(prev => prev.map((col, i) => i === index ? { ...col, files: [] } : col));
  };

  const addBookCollection = () => {
    setBookCollections(prev => [...prev, { bookCategory: '', bookTitle: '', bookCount: 1, files: [] }]);
  };

  const removeBookCollection = (index) => {
    setBookCollections(prev => prev.filter((_, i) => i !== index));
  };

  const updateCraftCollectionFiles = (index, files) => {
    setCraftCollections(prev => prev.map((col, i) => i === index ? { ...col, files: [...(col.files || []), ...files] } : col));
  };

  const clearCraftFiles = (index) => {
    setCraftCollections(prev => prev.map((col, i) => i === index ? { ...col, files: [] } : col));
  };

  const updateCraftPoints = (index, value) => {
    const val = parseInt(value) || 0;
    setCraftCollections(prev => prev.map((col, i) => i === index ? { ...col, pointsPrice: Math.max(0, val) } : col));
  };

  // ===== CRAFT COLLECTION HANDLERS =====
  const updateCraftCount = (index, delta) => {
    setCraftCollections(prev => prev.map((col, i) => i === index ? { ...col, craftCount: Math.max(1, Math.min(100, col.craftCount + delta)) } : col));
  };

  const setExactCraftCount = (index, value) => {
    const val = parseInt(value) || 1;
    setCraftCollections(prev => prev.map((col, i) => i === index ? { ...col, craftCount: Math.max(1, Math.min(100, val)) } : col));
  };

  const updateCraftType = (index, value) => {
    setCraftCollections(prev => prev.map((col, i) => i === index ? { ...col, craftType: value } : col));
  };

  const addCraftCollection = () => {
    setCraftCollections(prev => [
      ...prev, 
      { 
        id: Date.now() + Math.random(), 
        craftType: '', 
        craftCount: 1, 
        pointsPrice: 50, 
        files: [],
        itemFiles: {} 
      }
    ]);
  };

  const removeCraftCollection = (index) => {
    setCraftCollections(prev => prev.filter((_, i) => i !== index));
  };

  const clearBookFilesForIndex = (index) => {
    setBookCollections(prev => prev.map((col, i) => i === index ? { ...col, files: [] } : col));
  };

  const clearCraftFilesForIndex = (index) => {
    setCraftCollections(prev => prev.map((col, i) => i === index ? { ...col, files: [] } : col));
  };

  const generateFileInputs = (count, categoryType, collectionIdx) => {
    const inputs = [];
    const collections = categoryType === 'book' ? bookCollections : craftCollections;
    const col = collections[collectionIdx];
    const files = col.files || [];

    for (let i = 0; i < count; i++) {
      const isAttached = !!files[i];
      inputs.push(
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#495057', minWidth: 60 }}>Item #{i + 1}:</span>
          <label style={{
            background: isAttached ? '#E8F5E9' : '#FFF',
            border: isAttached ? '1px solid #2E7D32' : '1px solid #DEE2E6',
            color: isAttached ? '#2E7D32' : '#495057',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <i className={isAttached ? "fa-solid fa-circle-check" : "fa-solid fa-upload"}></i>
            {isAttached ? 'Change Photo' : 'Upload Photo'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  const updatedFiles = [...files];
                  updatedFiles[i] = selectedFile;
                  if (categoryType === 'book') {
                    setBookCollections(prev => prev.map((c, idx) => idx === collectionIdx ? { ...c, files: updatedFiles } : c));
                  } else {
                    setCraftCollections(prev => prev.map((c, idx) => idx === collectionIdx ? { ...c, files: updatedFiles } : c));
                  }
                }
              }}
            />
          </label>
          {isAttached && <span style={{ fontSize: 12, color: '#6C757D', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{files[i].name}</span>}
        </div>
      );
    }
    return inputs;
  };

  const nextStep = () => {
    if (step === 1) {
      if (donationCategory === 'books' && bookCollections.some(c => !c.bookCategory)) {
        alert('Please select a category for all book collections');
        return;
      }
      if (donationCategory === 'crafts' && craftCollections.some(c => !c.craftType)) {
        alert('Please select a category for all craft collections');
        return;
      }
    }
    if (step === 2) {
      if (!formData.selectedDate) {
        alert('Please select a drop-off date');
        return;
      }
      
      const selected = new Date(formData.selectedDate);
      const minDate = new Date(Date.now() + 86400000);
      minDate.setHours(0, 0, 0, 0);
      
      if (selected < minDate) {
        alert('Drop-off date must be at least 24 hours from today.');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  // ===== FIXED: Combined Donation Submission - NO DUPLICATE IMAGES =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("Please log in to donate.");
      return;
    }
    
    // Calculate totals
    const totalBooks = donationCategory === 'books'
      ? bookCollections.reduce((sum, col) => sum + col.bookCount, 0)
      : 0;
    const totalCrafts = donationCategory === 'crafts' 
      ? craftCollections.reduce((sum, col) => sum + col.craftCount, 0) 
      : 0;
    
    // Calculate points
    const points = donationCategory === 'books' 
      ? bookCollections.reduce((sum, col) => sum + (col.bookCount * pointsPerBook) + (col.bookCount > 1 ? Math.round((col.bookCount * pointsPerBook) * (collectionBonusPct / 100)) : 0), 0)
      : (totalCrafts * 10);
    
    try {
      const bodyData = new FormData();
      bodyData.append('userId', user.id);
      bodyData.append('type', donationCategory === 'books' ? 'SINGLE_BOOK' : 'COLLECTION');
      bodyData.append('dropOffDate', formData.selectedDate);
      bodyData.append('timeSlot', formData.timeSlot);
      bodyData.append('notes', formData.notes || '');
      
      if (donationCategory === 'books') {
        // Combine all book collection details
        const collectionDetails = bookCollections.map(col => 
          `${col.bookCategory}: ${col.bookCount} book${col.bookCount > 1 ? 's' : ''}`
        ).join(' | ');
        
        bodyData.append('collectionName', collectionDetails || 'Books');
        bodyData.append('category', collectionDetails || 'Books');
        bodyData.append('requestedCount', totalBooks);
        
        // ===== FIX: Collect images - ONE PER BOOK, NO DUPLICATES =====
        const allFiles = [];
        for (const col of bookCollections) {
          if (col.files && col.files.length > 0) {
            // Only take files up to the number of books
            const filesToAdd = col.files.slice(0, col.bookCount);
            for (const file of filesToAdd) {
              // Check if file already exists (by name + size)
              const isDuplicate = allFiles.some(f => f.name === file.name && f.size === file.size);
              if (!isDuplicate) {
                allFiles.push(file);
              }
            }
          }
        }
        
        // Add each unique image to FormData (max one per book)
        if (allFiles.length > 0) {
          for (let i = 0; i < Math.min(allFiles.length, totalBooks); i++) {
            bodyData.append('images', allFiles[i]);
          }
        }
        
        console.log(`📸 Books: ${totalBooks}, Unique Images: ${Math.min(allFiles.length, totalBooks)}`);
        
      } else {
        // Crafts
        const collectionDetails = craftCollections.map(col => 
          `${col.craftType}: ${col.craftCount} item${col.craftCount > 1 ? 's' : ''}`
        ).join(' | ');
        
        bodyData.append('category', 'Craft: ' + collectionDetails);
        bodyData.append('requestedCount', totalCrafts);
        bodyData.append('collectionName', collectionDetails);
        
        // Collect images - ONE PER CRAFT, NO DUPLICATES
        const allFiles = [];
        for (const col of craftCollections) {
          if (col.files && col.files.length > 0) {
            const filesToAdd = col.files.slice(0, col.craftCount);
            for (const file of filesToAdd) {
              const isDuplicate = allFiles.some(f => f.name === file.name && f.size === file.size);
              if (!isDuplicate) {
                allFiles.push(file);
              }
            }
          }
        }
        if (allFiles.length > 0) {
          for (let i = 0; i < Math.min(allFiles.length, totalCrafts); i++) {
            bodyData.append('images', allFiles[i]);
          }
        }
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save donation');
      }

      const result = await response.json();
      console.log('Donation created with images:', result);

      // Re-fetch donations to update UI
      fetch(`${API_BASE}/donations?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch after submit');
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            console.error('Expected array of donations but got:', data);
            return;
          }
          const mappedDonations = data.map(d => ({
            id: d.id.substring(0, 8).toUpperCase(),
            fullId: d.id,
            type: d.category || d.type,
            count: d.requestedCount,
            date: d.dropOffDate ? new Date(d.dropOffDate).toLocaleDateString() : 'N/A',
            time: 'N/A',
            status: d.status === 'VERIFIED' ? 'Completed' : d.status === 'REJECTED' ? 'Rejected' : 'Pending',
            staffNotes: d.staffNotes,
            details: null
          }));
          setMyDonations(mappedDonations);
        })
        .catch(err => console.error('Error fetching donations:', err));
      
      document.getElementById('successModal').style.display = 'flex';
      document.getElementById('finalPoints').innerText = points;
    } catch (error) {
      console.error('Error creating donations:', error);
      alert('Failed to submit donations: ' + error.message);
    }
  };

  const handleCompleteDonation = async (fullId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/donations/${fullId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete donation');
      }
      
      const result = await res.json();
      
      const updatedUser = { ...user, points: result.updatedUser.points };
      setUser(updatedUser);
      localStorage.setItem('ss_current_user', JSON.stringify(updatedUser));
      
      setMyDonations(prev => prev.map(d => d.fullId === fullId ? { ...d, status: 'Completed' } : d));
      
      alert('Donation completed and points awarded!');
    } catch (error) {
      console.error(error);
      alert('Failed to complete donation.');
    }
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 0 },
    mainContent: { maxWidth: 800, margin: '40px auto', padding: '0 20px' },
    pageHeader: { marginBottom: 40, textAlign: 'center' },
    pageHeaderH1: { fontFamily: 'Playfair Display, serif', fontSize: 32, marginBottom: 10 },
    formCard: { background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    stepper: { display: 'flex', justifyContent: 'space-between', marginBottom: 40, position: 'relative' },
    stepperBefore: { content: '""', position: 'absolute', top: 15, left: 0, width: '100%', height: 2, background: '#DEE2E6', zIndex: 1 },
    step: { width: 32, height: 32, borderRadius: '50%', background: 'white', border: '2px solid #DEE2E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, zIndex: 2, color: '#6C757D' },
    stepActive: { borderColor: '#1E4D4B', background: '#1E4D4B', color: 'white' },
    formStep: { animation: 'fadeIn 0.5s ease' },
    formGroup: { marginBottom: 24 },
    label: { display: 'block', fontWeight: 600, marginBottom: 10 },
    formControl: { width: '100%', padding: 14, border: '2px solid #DEE2E6', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 16 },
    numberInput: { display: 'flex', alignItems: 'center', gap: 10 },
    numBtn: { width: 40, height: 40, borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 20 },
    dateGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginTop: 10 },
    formActions: { display: 'flex', justifyContent: 'space-between', marginTop: 40, borderTop: '1px solid #DEE2E6', paddingTop: 30 },
    btn: { padding: '12px 28px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    btnPrev: { background: '#DEE2E6', color: '#343A40' },
    btnNext: { background: '#1E4D4B', color: 'white' },
    btnSubmit: { background: '#E76F51', color: 'white' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'none', alignItems: 'center', justifyContent: 'center' },
    modal: { background: 'white', padding: 40, borderRadius: 16, maxWidth: 500, width: '90%', textAlign: 'center' },
    pointsBox: { background: '#F1F3F5', padding: 20, borderRadius: 12, margin: '24px 0', border: '2px dashed #E9C46A' },
    donationsSection: { marginTop: 60 },
    donationsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginTop: 20 },
    donationCard: { background: 'white', padding: 24, borderRadius: 12, border: '1px solid #DEE2E6', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, backgroundColor: '#E9ECEF', color: '#495057' },
    statusPending: { backgroundColor: '#FFF3CD', color: '#856404' },
    statusCompleted: { backgroundColor: '#D4EDDA', color: '#155724' },
    statusRejected: { backgroundColor: '#F8D7DA', color: '#721C24' }
  };

  const totalBooks = donationCategory === 'books' ? bookCollections.reduce((sum, col) => sum + col.bookCount, 0) : 0;
  const totalCrafts = donationCategory === 'crafts' ? craftCollections.reduce((sum, col) => sum + col.craftCount, 0) : 0;
  const points = donationCategory === 'books' 
    ? bookCollections.reduce((sum, col) => sum + (col.bookCount * pointsPerBook) + (col.bookCount > 1 ? Math.round((col.bookCount * pointsPerBook) * (collectionBonusPct / 100)) : 0), 0)
    : (totalCrafts * 10);

  try {
    return (
      <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

      <main className="donate-main" style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageHeaderH1}>Donate Your Items</h1>
          <p>Help others discover new stories or crafts, and earn points for your generosity.</p>
        </div>

        <div className="donate-form-card" style={styles.formCard}>
          <div style={styles.stepper}>
            <div style={{ ...styles.step, ...(step >= 1 ? styles.stepActive : {}) }}>1</div>
            <div style={{ ...styles.step, ...(step >= 2 ? styles.stepActive : {}) }}>2</div>
            <div style={{ ...styles.step, ...(step >= 3 ? styles.stepActive : {}) }}>3</div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div>
                <h3 style={{ marginBottom: 20 }}>Step 1: What are you donating?</h3>

                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <button type="button" onClick={() => setDonationCategory('books')} style={{ ...styles.btn, background: donationCategory === 'books' ? '#1E4D4B' : '#E9ECEF', color: donationCategory === 'books' ? 'white' : '#495057', flex: 1 }}>
                    <i className="fa-solid fa-book"></i> Books
                  </button>
                  <button type="button" onClick={() => setDonationCategory('crafts')} style={{ ...styles.btn, background: donationCategory === 'crafts' ? '#1E4D4B' : '#E9ECEF', color: donationCategory === 'crafts' ? 'white' : '#495057', flex: 1 }}>
                    <i className="fa-solid fa-paintbrush"></i> Crafts
                  </button>
                </div>
                
                {donationCategory === 'books' && (
                  <>
                    {bookCollections.map((col, idx) => (
                      <div key={col.id || idx} style={{ background: '#F8F9FA', padding: 20, borderRadius: 12, marginBottom: 20, position: 'relative', border: '1px solid #DEE2E6' }}>
                        {bookCollections.length > 1 && (
                          <button type="button" onClick={() => removeBookCollection(idx)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#E63946', cursor: 'pointer', fontSize: 16 }}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Book Category</label>
                          <select style={styles.formControl} value={col.bookCategory} onChange={(e) => updateBookCategory(idx, e.target.value)} required>
                            <option value="">Select a category...</option>
                            <option value="Fiction">Fiction (Novels, Fantasy, Mystery)</option>
                            <option value="Non-Fiction">Non-Fiction (Biographies, History)</option>
                            <option value="Academic">Academic (Textbooks, Reference)</option>
                            <option value="Children">Children's Books</option>
                            <option value="Comics">Comics & Manga</option>
                            <option value="Mixed">Mixed Collection</option>
                          </select>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Number of Copies Donating</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button type="button" onClick={() => updateBookCount(idx, -1)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 20, fontWeight: 700 }}>-</button>
                            <input
                              type="number"
                              style={{ ...styles.formControl, width: 80, textAlign: 'center', fontWeight: 600 }}
                              value={col.bookCount}
                              onChange={(e) => setExactBookCount(idx, e.target.value)}
                              min="1"
                              max="100"
                            />
                            <button type="button" onClick={() => updateBookCount(idx, 1)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 20, fontWeight: 700 }}>+</button>
                          </div>
                        </div>

                        {/* ===== DYNAMIC FILE INPUTS FOR BOOKS ===== */}
                        {col.bookCount > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <label style={styles.label}>📸 Upload Photos for Each Book ({col.bookCount} book{col.bookCount > 1 ? 's' : ''})</label>
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                              {generateFileInputs(col.bookCount, 'book', idx)}
                            </div>
                            {col.files && col.files.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                <p style={{ fontSize: 12, color: '#2E7D32', margin: 0, fontWeight: 600 }}>
                                  ✓ {col.files.length} photo(s) attached
                                </p>
                                <button type="button" onClick={() => clearBookFilesForIndex(idx)} style={{ background: 'none', border: 'none', color: '#E63946', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Clear all photos</button>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ background: '#E8F5E9', padding: 12, borderRadius: 8, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#2E7D32' }}>
                            Estimated Points: {col.bookCount > 1 ? `(${col.bookCount * pointsPerBook} base + ${Math.round((col.bookCount * pointsPerBook) * (collectionBonusPct / 100))} bonus)` : ''}
                          </span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: '#1E4D4B' }}>
                            {col.bookCount * pointsPerBook + (col.bookCount > 1 ? Math.round((col.bookCount * pointsPerBook) * (collectionBonusPct / 100)) : 0)} pts
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#6C757D', marginTop: 4 }}>
                          Based on {pointsPerBook} pts/book {col.bookCount > 1 ? `+ ${collectionBonusPct}% collection bonus` : ''}
                        </p>

                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addBookCollection}
                      style={{
                        ...styles.btn,
                        width: '100%',
                        background: '#E9F5F3',
                        color: '#1E4D4B',
                        border: '2px dashed #1E4D4B',
                        justifyContent: 'center',
                        marginBottom: 20,
                        fontWeight: 600
                      }}
                    >
                      <i className="fa-solid fa-plus"></i> Add Another Book Collection
                    </button>
                  </>
                )}

                {donationCategory === 'crafts' && (
                  <>
                    {craftCollections.map((col, idx) => (
                      <div key={col.id || idx} style={{ background: '#F8F9FA', padding: 20, borderRadius: 12, marginBottom: 20, position: 'relative', border: '1px solid #DEE2E6' }}>
                        {craftCollections.length > 1 && (
                          <button type="button" onClick={() => removeCraftCollection(idx)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#E63946', cursor: 'pointer', fontSize: 16 }}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Craft Collection Type</label>
                          <select style={styles.formControl} value={col.craftType} onChange={(e) => updateCraftType(idx, e.target.value)} required>
                            <option value="">Select a category...</option>
                            <option value="Paper Crafts">Paper Crafts (Origami, Quilling)</option>
                            <option value="Woodwork">Woodwork (Carvings, Small Furniture)</option>
                            <option value="Textiles">Textiles (Knitting, Crochet, Sewing)</option>
                            <option value="Upcycled">Upcycled Materials</option>
                            <option value="Mixed Media">Mixed Media / Other</option>
                          </select>
                        </div>
                        
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Number of Items</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button type="button" onClick={() => updateCraftCount(idx, -1)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 20, fontWeight: 700 }}>-</button>
                            <input
                              type="number"
                              style={{ ...styles.formControl, width: 80, textAlign: 'center', fontWeight: 600 }}
                              value={col.craftCount}
                              onChange={(e) => setExactCraftCount(idx, e.target.value)}
                              min="1"
                              max="100"
                            />
                            <button type="button" onClick={() => updateCraftCount(idx, 1)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 20, fontWeight: 700 }}>+</button>
                          </div>
                        </div>

                        {/* ===== DYNAMIC FILE INPUTS FOR CRAFTS ===== */}
                        {col.craftCount > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <label style={styles.label}>📸 Upload Photos for Each Craft ({col.craftCount} craft{col.craftCount > 1 ? 's' : ''})</label>
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                              {generateFileInputs(col.craftCount, 'craft', idx)}
                            </div>
                            {col.files && col.files.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                <p style={{ fontSize: 12, color: '#2E7D32', margin: 0, fontWeight: 600 }}>
                                  ✓ {col.files.length} photo(s) attached
                                </p>
                                <button type="button" onClick={() => clearCraftFilesForIndex(idx)} style={{ background: 'none', border: 'none', color: '#E63946', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Clear all photos</button>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ marginTop: 16 }}>
                          <label style={styles.label}>Photos for this Craft Item (Optional)</label>
                          <label style={{ ...styles.btn, display: 'inline-block', background: '#F8F9FA', color: '#495057', border: '1px solid #CED4DA', padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>
                            <i className="fa-solid fa-upload" style={{ marginRight: 8 }}></i> Choose Files
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                updateCraftCollectionFiles(idx, Array.from(e.target.files));
                                e.target.value = null;
                              }}
                              style={{ display: 'none' }}
                            />
                          </label>
                          {col.files && col.files.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                              <p style={{ fontSize: 12, color: '#2E7D32', margin: 0, fontWeight: 600 }}>
                                ✓ {col.files.length} photo(s) attached
                              </p>
                              <button type="button" onClick={() => clearCraftFiles(idx)} style={{ background: 'none', border: 'none', color: '#E63946', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Clear photos</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button type="button" onClick={addCraftCollection} style={{ background: 'none', border: '2px dashed #DEE2E6', width: '100%', padding: 16, borderRadius: 12, cursor: 'pointer', color: '#1E4D4B', fontWeight: 600, marginBottom: 24 }}>
                      <i className="fa-solid fa-plus"></i> Add Another Craft Collection
                    </button>
                  </>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Notes (Optional)</label>
                  <textarea style={styles.formControl} rows="3" placeholder="Tell us about the condition or specific titles..." value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}></textarea>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginBottom: 20 }}>Step 2: Additional Details</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Drop-off Date</label>
                  <input type="date" style={styles.formControl} value={formData.selectedDate} min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} onChange={(e) => setFormData(prev => ({ ...prev, selectedDate: e.target.value }))} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Preferred Time Slot</label>
                  <select style={styles.formControl} value={formData.timeSlot} onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))} required>
                    <option value="10:00 AM">Morning (10:00 AM - 12:00 PM)</option>
                    <option value="02:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="05:00 PM">Evening (05:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: 20 }}>Step 3: Review & Confirm</h3>
                <div style={{ background: '#F1F3F5', padding: 20, borderRadius: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: '#6C757D', display: 'block', marginBottom: 4 }}>Collections:</span>
                    {donationCategory === 'books' ? bookCollections.map((col, idx) => (
                        <div key={col.id || idx} style={{ padding: '8px 12px', background: 'white', borderRadius: 8, marginBottom: 8, border: '1px solid #DEE2E6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <strong>{col.bookCategory || 'Not Selected'}</strong>
                                <span>{col.bookCount} Book(s)</span>
                            </div>
                            {col.files && col.files.length > 0 && (
                              <div style={{ fontSize: 12, color: '#2E7D32' }}>✓ {col.files.length} photo(s) attached</div>
                            )}
                        </div>
                    )) : craftCollections.map((col, idx) => (
                      <div key={col.id || idx} style={{ padding: '8px 12px', background: 'white', borderRadius: 8, marginBottom: 8, border: '1px solid #DEE2E6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{col.craftType || 'Not Selected'}</strong>
                          <span>{col.craftCount} Items</span>
                        </div>
                        {col.files && col.files.length > 0 && (
                          <div style={{ fontSize: 12, color: '#2E7D32' }}>✓ {col.files.length} photo(s) attached</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingTop: 12, borderTop: '1px solid #DEE2E6' }}>
                    <span style={{ color: '#6C757D' }}>Total Items:</span>
                    <strong>{donationCategory === 'books' ? totalBooks + ' Books' : totalCrafts + ' Crafts'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ color: '#6C757D' }}>Drop-off Date:</span><strong>{formData.selectedDate || '-'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6C757D' }}>Estimated Points:</span><strong style={{ color: '#2A9D8F' }}>~{points} pts</strong></div>
                </div>
                <p style={{ fontSize: 13, color: '#6C757D', marginTop: 16 }}><i className="fa-solid fa-circle-info"></i> Points will be credited to your account after our staff verifies the condition and count of your items at the collection center.</p>
              </div>
            )}

            <div style={styles.formActions}>
              {step > 1 && <button type="button" style={{ ...styles.btn, ...styles.btnPrev }} onClick={prevStep}>Back</button>}
              {step < 3 && <button type="button" style={{ ...styles.btn, ...styles.btnNext }} onClick={nextStep}>Next <i className="fa-solid fa-arrow-right"></i></button>}
              {step === 3 && <button type="submit" style={{ ...styles.btn, ...styles.btnSubmit }}>Confirm Donation</button>}
            </div>
          </form>
        </div>

        <div style={styles.donationsSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 10 }}>My Donations</h2>
              <p style={{ color: '#6C757D', margin: 0 }}>Track the status of your recent donations.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #DEE2E6', outline: 'none', background: 'white', color: '#495057', fontWeight: 500 }}
              >
                <option value="All">All Types</option>
                <option value="Books">Books</option>
                <option value="Crafts">Crafts</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #DEE2E6', outline: 'none', background: 'white', color: '#495057', fontWeight: 500 }}
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          {myDonations.filter(d => 
            (filterStatus === 'All' || d.status === filterStatus) && 
            (filterType === 'All' || (filterType === 'Books' && !(d.type || '').includes('Craft')) || (filterType === 'Crafts' && (d.type || '').includes('Craft')))
          ).length === 0 ? (
            <div style={{ background: 'white', padding: 40, borderRadius: 12, textAlign: 'center', border: '1px dashed #DEE2E6' }}>
               <i className="fa-solid fa-box-open" style={{ fontSize: 48, color: '#DEE2E6', marginBottom: 16 }}></i>
              <p style={{ color: '#6C757D' }}>No donations match your filters.</p>
            </div>
          ) : (
            <div style={styles.donationsGrid}>
              {myDonations.filter(d => 
                (filterStatus === 'All' || d.status === filterStatus) && 
                (filterType === 'All' || (filterType === 'Books' && !(d.type || '').includes('Craft')) || (filterType === 'Crafts' && (d.type || '').includes('Craft')))
              ).map((donation, idx) => (
                <div key={idx} style={styles.donationCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 16, lineHeight: '1.4' }}>
                        {donation.type?.includes('Craft') ? (
                          `Crafts: ${donation.type.replace(/Crafts?:\s*/i, '')}`
                        ) : (
                          <>
                            <span style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: 18 }}>Books:</span>
                            {(donation.type || 'General').split('|').map((part, pIdx) => (
                              <div key={pIdx} style={{ fontSize: 14, fontWeight: 500, color: '#374151', paddingLeft: 8, borderLeft: '3px solid #2A9D8F', margin: '6px 0' }}>
                                {part.trim()}
                              </div>
                            ))}
                          </>
                        )}
                      </h4>
                      <div style={{ color: '#6C757D', fontSize: 14 }}>ID: {donation.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ 
                        ...styles.statusBadge, 
                        ...(donation.status === 'Completed' 
                          ? styles.statusCompleted 
                          : donation.status === 'Rejected' 
                          ? styles.statusRejected 
                          : styles.statusPending) 
                      }}>
                        {donation.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <i className={donation.type && donation.type.startsWith('Craft:') ? "fa-solid fa-circle" : "fa-solid fa-book"} style={{ color: '#2A9D8F', width: 20, fontSize: donation.type && donation.type.startsWith('Craft:') ? 10 : 14 }}></i> 
                      {donation.count} {donation.type && donation.type.startsWith('Craft:') ? 'Crafts' : 'Books'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}><i className="fa-solid fa-calendar" style={{ color: '#2A9D8F', width: 20 }}></i> {donation.date}</div>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: donation.status === 'Rejected' ? 12 : 0 }}>
                    <i className="fa-solid fa-clock" style={{ color: '#2A9D8F', width: 20 }}></i> {donation.time}
                  </div>
                  {donation.status === 'Rejected' && donation.staffNotes && (
                    <div style={{ background: '#F8D7DA', color: '#721C24', padding: '10px 14px', borderRadius: 8, fontSize: 13, display: 'flex', gap: 6, alignItems: 'flex-start', border: '1px solid #F5C6CB', marginTop: 12 }}>
                      <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 2 }}></i>
                      <div>
                        <strong>Rejection Reason: </strong>{donation.staffNotes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <div id="successModal" style={styles.modalOverlay}>
        <div style={styles.modal}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 64, color: '#2A9D8F', marginBottom: 20 }}></i>
          <h2>Donation Scheduled!</h2>
          <p>Thank you for contributing to the ShareShelf community.</p>
          <div style={styles.pointsBox}>
            Estimated points to earn:<br />
            <span id="finalPoints" style={{ fontSize: 32, fontWeight: 800, color: '#1E4D4B' }}>0</span> pts
          </div>
          <button style={{ ...styles.btn, ...styles.btnNext, margin: '30px auto 0' }} onClick={() => window.location.href = '/user-dashboard'}>Back to Dashboard</button>
        </div>
      </div>
    </div>
    );
  } catch (err) {
    console.error('Render crash:', err);
    return (
      <div style={{ padding: 40, color: 'red', background: '#FFF3CD', border: '1px solid #FFEBAA', borderRadius: 8, margin: 40 }}>
        <h3>Render Error (Please report this error message):</h3>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{err.message}</pre>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>{err.stack}</pre>
      </div>
    );
  }
};

export default Donate;