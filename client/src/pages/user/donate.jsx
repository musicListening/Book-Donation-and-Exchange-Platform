import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { API_BASE } from '../../services/api';

const Donate = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({ points: 0, name: '' });
  const [formData, setFormData] = useState({
    collections: [{ bookType: '', bookCount: 1 }],
    notes: '',
    selectedDate: '',
    timeSlot: '10:00 AM'
  });
  const [donationFiles, setDonationFiles] = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [donationCategory, setDonationCategory] = useState('books');
  const [craftCollections, setCraftCollections] = useState([{ craftType: '', craftCount: 1 }]);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { points: 0, name: 'User' };
    setUser(storedUser);
    
    // Fetch user donations from backend
    if (storedUser.id) {
      fetch(`${API_BASE}/donations?userId=${storedUser.id}`)
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
          // Map backend data to frontend format
          const mappedDonations = data.map(d => ({
            id: d.id.substring(0, 8).toUpperCase(), // Shorten UUID for display
            fullId: d.id,
            type: d.category || d.type,
            count: d.requestedCount,
            date: d.dropOffDate ? new Date(d.dropOffDate).toLocaleDateString() : 'N/A',
            time: 'N/A', // Time not stored separately in backend
            status: d.pointsAwarded > 0 ? 'Completed' : 'Pending',
            details: null // Not applicable if each collection is separate
          }));
          setMyDonations(mappedDonations);
        })
        .catch(err => console.error('Error fetching donations:', err));
    }
  }, []);


  const updateCount = (index, delta) => {
    setFormData(prev => {
      const newCols = [...prev.collections];
      newCols[index].bookCount = Math.max(1, Math.min(100, newCols[index].bookCount + delta));
      return { ...prev, collections: newCols };
    });
  };

  const setExactBookCount = (index, value) => {
    const val = parseInt(value) || 1;
    setFormData(prev => {
      const newCols = [...prev.collections];
      newCols[index].bookCount = Math.max(1, Math.min(100, val));
      return { ...prev, collections: newCols };
    });
  };

  const updateType = (index, value) => {
    setFormData(prev => {
      const newCols = [...prev.collections];
      newCols[index].bookType = value;
      return { ...prev, collections: newCols };
    });
  };

  const addCollection = () => {
    setFormData(prev => ({
      ...prev,
      collections: [...prev.collections, { bookType: '', bookCount: 1 }]
    }));
  };

  const removeCollection = (index) => {
    setFormData(prev => {
      const newCols = prev.collections.filter((_, i) => i !== index);
      return { ...prev, collections: newCols };
    });
  };

  const updateCraftCount = (index, delta) => {
    setCraftCollections(prev => {
      const newCols = [...prev];
      newCols[index].craftCount = Math.max(1, Math.min(100, newCols[index].craftCount + delta));
      return newCols;
    });
  };

  const setExactCraftCount = (index, value) => {
    const val = parseInt(value) || 1;
    setCraftCollections(prev => {
      const newCols = [...prev];
      newCols[index].craftCount = Math.max(1, Math.min(100, val));
      return newCols;
    });
  };

  const updateCraftType = (index, value) => {
    setCraftCollections(prev => {
      const newCols = [...prev];
      newCols[index].craftType = value;
      return newCols;
    });
  };

  const addCraftCollection = () => {
    setCraftCollections(prev => [...prev, { craftType: '', craftCount: 1 }]);
  };

  const removeCraftCollection = (index) => {
    setCraftCollections(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step === 1) {
      if (donationCategory === 'books' && formData.collections.some(c => !c.bookType)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("Please log in to donate.");
      return;
    }
    
    const totalBooks = donationCategory === 'books' ? formData.collections.reduce((sum, col) => sum + col.bookCount, 0) : 0;
    const totalCrafts = donationCategory === 'crafts' ? craftCollections.reduce((sum, col) => sum + col.craftCount, 0) : 0;
    const points = (totalBooks * 10) + (totalCrafts * 10);
    
    try {
      if (donationCategory === 'books') {
        for (const col of formData.collections) {
          const bodyData = new FormData();
          bodyData.append('userId', user.id);
          bodyData.append('type', 'COLLECTION');
          bodyData.append('category', col.bookType);
          bodyData.append('requestedCount', col.bookCount);
          bodyData.append('notes', formData.notes || '');
          bodyData.append('dropOffDate', formData.selectedDate);
          
          if (donationFiles) {
            for (let i = 0; i < donationFiles.length; i++) {
              bodyData.append('images', donationFiles[i]);
            }
          }

          const response = await fetch(`${API_BASE}/donations`, {
            method: 'POST',
            body: bodyData
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to save book donation');
          }
        }
      } else {
        for (const col of craftCollections) {
          const bodyData = new FormData();
          bodyData.append('userId', user.id);
          bodyData.append('type', 'COLLECTION');
          bodyData.append('category', 'Craft: ' + col.craftType);
          bodyData.append('requestedCount', col.craftCount);
          bodyData.append('notes', formData.notes || '');
          bodyData.append('dropOffDate', formData.selectedDate);
          
          if (donationFiles) {
            for (let i = 0; i < donationFiles.length; i++) {
              bodyData.append('images', donationFiles[i]);
            }
          }

          const response = await fetch(`${API_BASE}/donations`, {
            method: 'POST',
            body: bodyData
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to save craft donation');
          }
        }
      }

      // Re-fetch donations to update UI
      fetch(`${API_BASE}/donations?userId=${user.id}`)
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
            status: d.pointsAwarded > 0 ? 'Completed' : 'Pending',
            details: null
          }));
          setMyDonations(mappedDonations);
        })
        .catch(err => console.error('Error fetching donations:', err));
      
      document.getElementById('successModal').style.display = 'flex';
      document.getElementById('finalPoints').innerText = points;
    } catch (error) {
      console.error('Error creating donations:', error);
      alert('Failed to submit donations. Please try again.');
    }
  };

  const handleCompleteDonation = async (fullId) => {
    try {
      const res = await fetch(`${API_BASE}/donations/${fullId}/complete`, { method: 'PUT' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete donation');
      }
      
      const result = await res.json();
      
      // Update local storage user points
      const updatedUser = { ...user, points: result.updatedUser.points };
      setUser(updatedUser);
      localStorage.setItem('ss_current_user', JSON.stringify(updatedUser));
      
      // Update local state for donations
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
    statusCompleted: { backgroundColor: '#D4EDDA', color: '#155724' }
  };

  const totalBooks = donationCategory === 'books' ? formData.collections.reduce((sum, col) => sum + col.bookCount, 0) : 0;
  const totalCrafts = donationCategory === 'crafts' ? craftCollections.reduce((sum, col) => sum + col.craftCount, 0) : 0;
  const points = (totalBooks * 10) + (totalCrafts * 10);

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} />

      <main style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageHeaderH1}>Donate Your Items</h1>
          <p>Help others discover new stories or crafts, and earn points for your generosity.</p>
        </div>

        <div style={styles.formCard}>
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
                    {formData.collections.map((col, idx) => (
                      <div key={idx} style={{ background: '#F8F9FA', padding: 20, borderRadius: 12, marginBottom: 20, position: 'relative', border: '1px solid #DEE2E6' }}>
                        {formData.collections.length > 1 && (
                          <button type="button" onClick={() => removeCollection(idx)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#E63946', cursor: 'pointer', fontSize: 16 }}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Book Collection Type</label>
                          <select style={styles.formControl} value={col.bookType} onChange={(e) => updateType(idx, e.target.value)} required>
                            <option value="">Select a category...</option>
                            <option value="Fiction">Fiction (Novels, Fantasy, Mystery)</option>
                            <option value="Non-Fiction">Non-Fiction (Biographies, History)</option>
                            <option value="Academic">Academic (Textbooks, Reference)</option>
                            <option value="Children">Children's Books</option>
                            <option value="Comics">Comics & Manga</option>
                            <option value="Mixed">Mixed Collection</option>
                          </select>
                        </div>
                        <div style={{ marginBottom: 0 }}>
                          <label style={styles.label}>Approximate Number of Books</label>
                          <div style={styles.numberInput}>
                            <input type="number" style={{ ...styles.formControl, textAlign: 'center', width: 100 }} value={col.bookCount} onChange={(e) => setExactBookCount(idx, e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button type="button" onClick={addCollection} style={{ background: 'none', border: '2px dashed #DEE2E6', width: '100%', padding: 16, borderRadius: 12, cursor: 'pointer', color: '#1E4D4B', fontWeight: 600, marginBottom: 24 }}>
                      <i className="fa-solid fa-plus"></i> Add Another Book Collection
                    </button>
                  </>
                )}

                {donationCategory === 'crafts' && (
                  <>
                    {craftCollections.map((col, idx) => (
                      <div key={idx} style={{ background: '#F8F9FA', padding: 20, borderRadius: 12, marginBottom: 20, position: 'relative', border: '1px solid #DEE2E6' }}>
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
                        <div style={{ marginBottom: 0 }}>
                          <label style={styles.label}>Number of Items</label>
                          <div style={styles.numberInput}>
                            <input type="number" style={{ ...styles.formControl, textAlign: 'center', width: 100 }} value={col.craftCount} onChange={(e) => setExactCraftCount(idx, e.target.value)} />
                          </div>
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>Donation Images (Optional)</label>
                  <input type="file" multiple accept="image/*" style={styles.formControl} onChange={(e) => setDonationFiles(e.target.files)} />
                  <small style={{ color: '#6C757D', display: 'block', marginTop: 4 }}>You can select multiple images to upload</small>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: 20 }}>Step 3: Review & Confirm</h3>
                <div style={{ background: '#F1F3F5', padding: 20, borderRadius: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: '#6C757D', display: 'block', marginBottom: 4 }}>Collections:</span>
                    {donationCategory === 'books' ? formData.collections.map((col, idx) => (
                      <div key={idx} style={{ padding: '8px 12px', background: 'white', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', border: '1px solid #DEE2E6' }}>
                        <strong>{col.bookType || 'Not Selected'}</strong>
                        <span>{col.bookCount} Books</span>
                      </div>
                    )) : craftCollections.map((col, idx) => (
                      <div key={idx} style={{ padding: '8px 12px', background: 'white', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', border: '1px solid #DEE2E6' }}>
                        <strong>{col.craftType || 'Not Selected'}</strong>
                        <span>{col.craftCount} Items</span>
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
            (filterType === 'All' || (filterType === 'Books' && !d.type.includes('Craft')) || (filterType === 'Crafts' && d.type.includes('Craft')))
          ).length === 0 ? (
            <div style={{ background: 'white', padding: 40, borderRadius: 12, textAlign: 'center', border: '1px dashed #DEE2E6' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: 48, color: '#DEE2E6', marginBottom: 16 }}></i>
              <p style={{ color: '#6C757D' }}>No donations match your filters.</p>
            </div>
          ) : (
            <div style={styles.donationsGrid}>
              {myDonations.filter(d => 
                (filterStatus === 'All' || d.status === filterStatus) && 
                (filterType === 'All' || (filterType === 'Books' && !d.type.includes('Craft')) || (filterType === 'Crafts' && d.type.includes('Craft')))
              ).map((donation, idx) => (
                <div key={idx} style={styles.donationCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 18 }}>
                        {donation.type?.includes('Craft') ? `Crafts: ${donation.type.replace(/Crafts?:\s*/i, '')}` : `Books: ${donation.type || 'General'}`}
                      </h4>
                      <div style={{ color: '#6C757D', fontSize: 14 }}>ID: {donation.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {donation.status === 'Pending' && (
                        <button 
                          onClick={() => handleCompleteDonation(donation.fullId)} 
                          style={{ background: '#2A9D8F', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                        >
                          Complete Drop-off
                        </button>
                      )}
                      <span style={{ 
                        ...styles.statusBadge, 
                        ...(donation.status === 'Completed' ? styles.statusCompleted : styles.statusPending) 
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
                  <div style={{ fontSize: 14 }}>
                    <i className="fa-solid fa-clock" style={{ color: '#2A9D8F', width: 20 }}></i> {donation.time}
                  </div>
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
};

export default Donate;