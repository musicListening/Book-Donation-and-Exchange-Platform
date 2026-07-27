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
    { bookCategory: '', bookTitle: '', bookCount: 1, files: [] }
  ]);
  const [craftCollections, setCraftCollections] = useState([{ craftType: '', craftCount: 1, pointsPrice: 50, files: [] }]);
  const navigate = useNavigate();

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
            time: 'N/A', 
            status: d.pointsAwarded > 0 ? 'Completed' : 'Pending',
            details: null 
          }));
          setMyDonations(mappedDonations);
        })
        .catch(err => console.error('Error fetching donations:', err));
    }

    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);
    
    // Fetch system config for points calculation
    fetch(`${API_BASE}/donations/points-preview?count=1&isCollection=false`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.baseRate) setPointsPerBook(data.baseRate);
        if (data && data.bonusPct) setCollectionBonusPct(data.bonusPct);
      })
      .catch(() => {});
  }, [navigate]);

  const updateBookCategory = (index, value) => {
    setBookCollections(prev => {
      const newCols = [...prev];
      newCols[index].bookCategory = value;
      return newCols;
    });
  };

  const updateBookTitle = (index, value) => {
    setBookCollections(prev => {
      const newCols = [...prev];
      newCols[index].bookTitle = value;
      return newCols;
    });
  };

  const updateBookCount = (index, delta) => {
    setBookCollections(prev => {
      const newCols = [...prev];
      newCols[index].bookCount = Math.max(1, Math.min(100, newCols[index].bookCount + delta));
      return newCols;
    });
  };

  const setExactBookCount = (index, value) => {
    const val = parseInt(value) || 1;
    setBookCollections(prev => {
      const newCols = [...prev];
      newCols[index].bookCount = Math.max(1, Math.min(100, val));
      return newCols;
    });
  };

  const updateBookFiles = (index, files) => {
    setBookCollections(prev => {
      const newCols = [...prev];
      newCols[index].files = [...(newCols[index].files || []), ...files];
      return newCols;
    });
  };

  const clearBookFiles = (index) => {
    setBookCollections(prev => {
      const newCols = [...prev];
      newCols[index].files = [];
      return newCols;
    });
  };

  const addBookCollection = () => {
    setBookCollections(prev => [...prev, { bookCategory: '', bookTitle: '', bookCount: 1, files: [] }]);
  };

  const removeBookCollection = (index) => {
    setBookCollections(prev => prev.filter((_, i) => i !== index));
  };

  const updateCraftCollectionFiles = (index, files) => {
    setCraftCollections(prev => {
      const newCols = [...prev];
      newCols[index].files = [...(newCols[index].files || []), ...files];
      return newCols;
    });
  };

  const clearCraftFiles = (index) => {
    setCraftCollections(prev => {
      const newCols = [...prev];
      newCols[index].files = [];
      return newCols;
    });
  };

  const updateCraftPoints = (index, value) => {
    const val = parseInt(value) || 0;
    setCraftCollections(prev => {
      const newCols = [...prev];
      newCols[index].pointsPrice = Math.max(0, val);
      return newCols;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("Please log in to donate.");
      return;
    }
    
    const totalBooks = donationCategory === 'books'
      ? bookCollections.reduce((sum, col) => sum + col.bookCount, 0)
      : 0;
    const totalCrafts = donationCategory === 'crafts' ? craftCollections.reduce((sum, col) => sum + col.craftCount, 0) : 0;
    const points = donationCategory === 'books' 
      ? bookCollections.reduce((sum, col) => sum + (col.bookCount * pointsPerBook) + (col.bookCount > 1 ? Math.round((col.bookCount * pointsPerBook) * (collectionBonusPct / 100)) : 0), 0)
      : (totalCrafts * 10);
    
    try {
      if (donationCategory === 'books') {
        for (const col of bookCollections) {
          const bodyData = new FormData();
          bodyData.append('userId', user.id);
          bodyData.append('type', 'SINGLE_BOOK');
          bodyData.append('collectionName', col.bookCategory || 'Books');
          bodyData.append('category', col.bookCategory);
          bodyData.append('requestedCount', col.bookCount);
          bodyData.append('notes', formData.notes || '');
          bodyData.append('dropOffDate', formData.selectedDate);

          if (col.files && col.files.length > 0) {
            for (let i = 0; i < col.files.length; i++) {
              bodyData.append('images', col.files[i]);
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
          bodyData.append('notes', (formData.notes ? `${formData.notes} | ` : '') + `Expected Points: ${col.pointsPrice || 50}`);
          bodyData.append('dropOffDate', formData.selectedDate);
          
          if (col.files && col.files.length > 0) {
            for (let i = 0; i < col.files.length; i++) {
              bodyData.append('images', col.files[i]);
            }
          } else if (donationFiles) {
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
    statusCompleted: { backgroundColor: '#D4EDDA', color: '#155724' }
  };

  const totalBooks = donationCategory === 'books' ? bookCollections.reduce((sum, col) => sum + col.bookCount, 0) : 0;
  const totalCrafts = donationCategory === 'crafts' ? craftCollections.reduce((sum, col) => sum + col.craftCount, 0) : 0;
  const points = donationCategory === 'books' 
    ? bookCollections.reduce((sum, col) => sum + (col.bookCount * pointsPerBook) + (col.bookCount > 1 ? Math.round((col.bookCount * pointsPerBook) * (collectionBonusPct / 100)) : 0), 0)
    : (totalCrafts * 10);

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

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
                    {bookCollections.map((col, idx) => (
                      <div key={idx} style={{ background: '#F8F9FA', padding: 20, borderRadius: 12, marginBottom: 20, position: 'relative', border: '1px solid #DEE2E6' }}>
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

                        <div style={{ marginTop: 16 }}>
                          <label style={styles.label}>Photos of the Book (Optional)</label>
                          <label style={{ ...styles.btn, display: 'inline-block', background: '#F8F9FA', color: '#495057', border: '1px solid #CED4DA', padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>
                            <i className="fa-solid fa-upload" style={{ marginRight: 8 }}></i> Choose Files
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                updateBookFiles(idx, Array.from(e.target.files));
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
                              <button type="button" onClick={() => clearBookFiles(idx)} style={{ background: 'none', border: 'none', color: '#E63946', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Clear photos</button>
                            </div>
                          )}
                        </div>
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
                        <div style={{ marginBottom: 16 }}>
                          <label style={styles.label}>Number of Items</label>
                          <div style={styles.numberInput}>
                            <input type="number" style={{ ...styles.formControl, textAlign: 'center', width: 100 }} value={col.craftCount} onChange={(e) => setExactCraftCount(idx, e.target.value)} />
                          </div>
                        </div>



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
                        <div key={idx} style={{ padding: '8px 12px', background: 'white', borderRadius: 8, marginBottom: 8, border: '1px solid #DEE2E6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <strong>{col.bookCategory || 'Not Selected'}</strong>
                                <span>{col.bookCount} Book(s)</span>
                            </div>
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